const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, buy, openDay, nextDay } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { encodeSave, decodeSave, readSave, writeSave, SAVE_KEY, BACKUP_KEY } = require('../.test-build/simulation/save.js');
const stocked = () => ['lemon', 'sugar', 'ice', 'cup'].reduce((s, key) => buy(s, key, 40), newGame());
const finish = s => finishStreetDay(beginStreetDay(openDay(s))).day.game;
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };
test('preparation, results and multi-day ledger round-trip exactly', () => {
    let state = stocked(); const history = [];
    for (let day = 0; day < 3; day++) {
        assert.deepEqual(decodeSave(encodeSave(state, history)), { version: 1, state, history });
        state = finish(state); history.push(state);
        assert.deepEqual(decodeSave(encodeSave(state, history)), { version: 1, state, history });
        state = nextDay(state);
        state = ['lemon', 'sugar', 'ice', 'cup'].reduce((s, key) => buy(s, key, 20), state);
    }
});
test('reject malformed, future, selling, inconsistent accounting and contradictory results', () => {
    assert.throws(() => decodeSave('{'));
    assert.throws(() => decodeSave(JSON.stringify({ version: 2 })), /version/);
    assert.throws(() => encodeSave(openDay(stocked()), []), /checkpoint/);
    const state = finish(stocked());
    assert.throws(() => encodeSave({ ...state, cash: state.cash + 1 }, [state]));
    assert.throws(() => encodeSave({ ...state, stock: { ...state.stock, cup: state.stock.cup + 1 } }, [state]), /results/);
    assert.throws(() => encodeSave(nextDay(state), []), /history/);
    const legacy = JSON.parse(encodeSave(newGame(), [])); legacy.version = 0;
    assert.equal(decodeSave(JSON.stringify(legacy)).version, 1);
});
test('recover corrupt or missing primary without overwriting the valid backup', () => {
    const store = storage(); const initial = newGame();
    writeSave(store, initial, []); writeSave(store, stocked(), []);
    store.setItem(SAVE_KEY, '{');
    assert.deepEqual(readSave(store), { document: { version: 1, state: initial, history: [] }, recovered: true });
    writeSave(store, initial, []);
    assert.equal(store.getItem(BACKUP_KEY), encodeSave(initial, []));
    const backupOnly = storage(); backupOnly.setItem(BACKUP_KEY, encodeSave(initial, []));
    assert.equal(readSave(backupOnly).recovered, true);
    store.setItem(SAVE_KEY, ''); store.setItem(BACKUP_KEY, '{}');
    assert.throws(() => readSave(store));
});
test('storage failure leaves the prior primary available', () => {
    const store = storage(); writeSave(store, newGame(), []);
    const prior = store.getItem(SAVE_KEY);
    assert.throws(() => writeSave({ getItem: store.getItem, setItem: () => { throw Error('quota'); } }, stocked(), []));
    assert.equal(store.getItem(SAVE_KEY), prior);
});
