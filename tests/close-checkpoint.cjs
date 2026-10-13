const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCloseCheckpoint } = require('../src/desktop/close-checkpoint.cjs');

function setup() {
    const calls = { flush: [], resumed: 0, closed: 0, warnings: 0, recorded: [], cancelled: [] };
    let expire;
    let decide;
    const checkpoint = createCloseCheckpoint({
        flush: id => calls.flush.push(id), resume: () => calls.resumed++, close: () => calls.closed++,
        record: event => calls.recorded.push(event),
        warn: () => { calls.warnings++; return new Promise(resolve => { decide = resolve; }); },
        schedule: callback => { expire = callback; return calls.flush.length + 1; },
        cancel: timer => calls.cancelled.push(timer),
    });
    const request = () => checkpoint.request({ preventDefault() {} });
    return { calls, checkpoint, request, expire: () => expire(), decide: async discard => { decide(discard); await Promise.resolve(); } };
}

test('durable save acknowledgement closes once and cancels its deadline', () => {
    const s = setup(); s.request(); s.request();
    assert.deepEqual(s.calls.flush, [1]);
    s.checkpoint.acknowledge(1, true); s.checkpoint.acknowledge(1, true); s.expire();
    assert.equal(s.calls.closed, 1); assert.equal(s.calls.warnings, 0);
    assert.deepEqual(s.calls.cancelled, [1]);
});

test('failed save keeps the business open until explicit discard', async () => {
    const s = setup(); s.request(); s.checkpoint.acknowledge(1, false);
    assert.equal(s.calls.closed, 0); assert.equal(s.calls.warnings, 1);
    s.request(); s.checkpoint.acknowledge(1, true);
    assert.equal(s.calls.closed, 0);
    await s.decide(false); assert.equal(s.calls.resumed, 1);
    s.request(); s.checkpoint.acknowledge(2, false); await s.decide(true);
    assert.equal(s.calls.closed, 1);
    assert.deepEqual(s.calls.recorded, ['close-save-failed', 'close-save-failed']);
});

test('timeout and cancelled requests cannot acknowledge a subsequent close', async () => {
    const s = setup(); s.request(); s.expire(); s.expire();
    assert.equal(s.calls.warnings, 1); assert.equal(s.calls.closed, 0);
    s.checkpoint.acknowledge(1, true); await s.decide(false);
    s.request(); s.checkpoint.acknowledge(1, true);
    assert.equal(s.calls.closed, 0);
    s.checkpoint.acknowledge(2, true); assert.equal(s.calls.closed, 1);
    assert.deepEqual(s.calls.recorded, ['close-timeout']);
});

test('a failed warning dialog resumes instead of discarding the business', async () => {
    let resumed = false;
    const checkpoint = createCloseCheckpoint({
        flush() {}, resume() { resumed = true; }, close() { assert.fail('must not close'); },
        record() {}, warn: async () => { throw new Error('Dialog unavailable'); },
        schedule: () => 1, cancel() {},
    });
    checkpoint.request({ preventDefault() {} }); checkpoint.acknowledge(1, false);
    await Promise.resolve(); assert.equal(resumed, true);
});

test('an unavailable renderer still requires explicit discard before closing', async () => {
    let warned = false; let closed = false;
    const checkpoint = createCloseCheckpoint({
        flush() { throw new Error('Renderer gone'); }, resume() { assert.fail('discard chosen'); },
        close() { closed = true; }, record() {}, warn: async () => { warned = true; return true; },
        schedule: () => 1, cancel() {},
    });
    checkpoint.request({ preventDefault() {} });
    assert.equal(warned, true); assert.equal(closed, false);
    await Promise.resolve(); assert.equal(closed, true);
});
