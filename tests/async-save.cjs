const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, buy } = require('../.test-build/simulation/game.js');
const { encodeSave, SAVE_KEY, BACKUP_KEY } = require('../.test-build/simulation/save.js');
const { writeSaveAsync, readSaveAsync } = require('../.test-build/simulation/async-save.js');

test('async backup I/O failure rejects without replacing the primary', async () => {
    const prior = encodeSave(newGame(), []);
    const values = new Map([[SAVE_KEY, prior]]);
    const storage = {
        getItem: async key => values.get(key) ?? null,
        setItem: async (key, value) => {
            if (key === BACKUP_KEY) throw Error('disk full');
            values.set(key, value);
        },
    };
    await assert.rejects(writeSaveAsync(storage, encodeSave(buy(newGame(), 'lemon', 10), [])), /disk full/);
    assert.equal(values.get(SAVE_KEY), prior);
});

test('async damaged primary keeps valid backup; missing primary recovers it', async () => {
    const prior = encodeSave(newGame(), []);
    const values = new Map([[SAVE_KEY, '{'], [BACKUP_KEY, prior]]);
    const storage = { getItem: async key => values.get(key) ?? null,
        setItem: async (key, value) => { values.set(key, value); } };
    const next = encodeSave(buy(newGame(), 'lemon', 10), []);
    await writeSaveAsync(storage, next);
    assert.equal(values.get(BACKUP_KEY), prior);
    assert.equal(values.get(SAVE_KEY), next);
    values.delete(SAVE_KEY);
    assert.deepEqual(await readSaveAsync(storage), { document: JSON.parse(prior), recovered: true });
    values.set(SAVE_KEY, '{'); values.set(BACKUP_KEY, '{');
    await assert.rejects(readSaveAsync(storage), /JSON/);
});
