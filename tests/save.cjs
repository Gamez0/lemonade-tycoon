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
        assert.deepEqual(decodeSave(encodeSave(state, history)), { version: 2, state, history });
        state = finish(state); history.push(state);
        assert.deepEqual(decodeSave(encodeSave(state, history)), { version: 2, state, history });
        state = nextDay(state);
        state = ['lemon', 'sugar', 'ice', 'cup'].reduce((s, key) => buy(s, key, key === 'ice' ? 40 : 20), state);
    }
});
test('reject malformed, future, selling, inconsistent accounting and contradictory results', () => {
    assert.throws(() => decodeSave('{'));
    assert.throws(() => decodeSave(JSON.stringify({ version: 3 })), /version/);
    assert.throws(() => encodeSave(openDay(stocked()), []), /checkpoint/);
    const state = finish(stocked());
    assert.throws(() => encodeSave({ ...state, cash: state.cash + 1 }, [state]));
    assert.throws(() => encodeSave({ ...state, stock: { ...state.stock, cup: state.stock.cup + 1 } }, [state]), /results/);
    assert.throws(() => encodeSave(nextDay(state), []), /history/);
    const legacy = JSON.parse(encodeSave(newGame(), [])); legacy.version = 0;
    delete legacy.state.pitcherCups; delete legacy.state.daily.model;
    delete legacy.state.daily.pitchersMade; delete legacy.state.daily.meltedIce;
    assert.equal(decodeSave(JSON.stringify(legacy)).version, 2);
});
test('recover corrupt or missing primary without overwriting the valid backup', () => {
    const store = storage(); const initial = newGame();
    writeSave(store, initial, []); writeSave(store, stocked(), []);
    store.setItem(SAVE_KEY, '{');
    assert.deepEqual(readSave(store), { document: { version: 2, state: initial, history: [] }, recovered: true });
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
test('v1 cup-based results migrate without rewriting old profit, and next day uses pitchers', () => {
    const old = finish(stocked());
    const oldCost = old.plan.recipe.lemon * 8 + old.plan.recipe.sugar * 4 + old.plan.recipe.ice * 2 + 6;
    const oldDay = { ...old, daily: { ...old.daily, cost: old.daily.sold * oldCost } };
    delete oldDay.pitcherCups;
    delete oldDay.daily.model; delete oldDay.daily.pitchersMade; delete oldDay.daily.meltedIce;
    const migrated = decodeSave(JSON.stringify({ version: 1, state: oldDay, history: [oldDay] }));
    assert.equal(migrated.version, 2);
    assert.equal(migrated.state.daily.model, 'cup');
    assert.equal(migrated.state.daily.cost, oldDay.daily.cost);
    assert.equal(nextDay(migrated.state).daily.model, 'pitcher');
    assert.equal(decodeSave(encodeSave(migrated.state, migrated.history)).state.daily.cost, oldDay.daily.cost);
});

test('backup I/O failure rejects without replacing the primary', () => {
    const prior = encodeSave(newGame(), []);
    const values = new Map([[SAVE_KEY, prior]]);
    const store = { getItem: key => values.get(key) ?? null, setItem: (key, value) => {
        if (key === BACKUP_KEY) throw Error('disk full');
        values.set(key, value);
    } };
    assert.throws(() => writeSave(store, stocked(), []), /disk full/);
    assert.equal(values.get(SAVE_KEY), prior);
});
