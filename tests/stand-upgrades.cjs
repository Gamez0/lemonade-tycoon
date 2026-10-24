const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, purchaseUpgrade, buy, openDay, nextDay } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { UPGRADES } = require('../.test-build/content/management.js');

test('stand purchases charge the observed prices, preserve supplies and survive days and portable saves', () => {
    // A funded test opening balance exercises all tiers without altering product starting cash.
    let state = { ...newGame(), cash: 2000000, openingCash: 2000000 };
    const history = [];
    let capital = 0;
    for (let level = 1; level <= 3; level++) {
        const before = state;
        state = purchaseUpgrade(state, 'stand');
        const price = UPGRADES.stand.prices[level - 1]; capital += price;
        assert.equal(before.management.upgrades.stand, level - 1);
        assert.equal(state.management.upgrades.stand, level);
        assert.equal(state.cash, before.cash - price);
        assert.deepEqual(state.stock, before.stock);
        assert.deepEqual(decodeSave(encodeSave(state, history)).state, state);
        for (const [item, quantity] of [['lemon', 40], ['sugar', 20], ['ice', 200], ['cup', 40]])
            if (state.stock[item] < quantity) state = buy(state, item, quantity - state.stock[item]);
        const opened = openDay(state);
        assert.throws(() => purchaseUpgrade(opened, 'stand'), /preparation/);
        const done = finishStreetDay(beginStreetDay(opened)).day.game;
        history.push(done); state = nextDay(done);
        state = decodeSave(encodeSave(state, history)).state;
        assert.equal(state.management.upgrades.stand, level);
    }
    assert.equal(capital, 1144997);
    assert.throws(() => purchaseUpgrade(state, 'stand'), /fully/);
    assert.throws(() => purchaseUpgrade(newGame(), 'stand'), /cash/);
});

test('version7 histories migrate to Basic Stand and forged tiers or unpaid purchases are rejected', () => {
    const base = newGame(), old = JSON.parse(encodeSave(base, [])); old.version = 7;
    delete old.state.management.upgrades.stand;
    assert.deepEqual(decodeSave(JSON.stringify(old)).state, base);
    for (const level of [-1, 0.5, 4, null]) {
        const invalid = JSON.parse(encodeSave(base, [])); invalid.state.management.upgrades.stand = level;
        assert.throws(() => decodeSave(JSON.stringify(invalid)), /damaged/);
    }
    const missing = JSON.parse(encodeSave(base, [])); delete missing.state.management.upgrades.stand;
    assert.throws(() => decodeSave(JSON.stringify(missing)), /damaged/);
    const unpaid = JSON.parse(encodeSave(base, [])); unpaid.state.management.upgrades.stand = 1;
    assert.throws(() => decodeSave(JSON.stringify(unpaid)), /equipment/);
    old.state.management.upgrades.stand = 1;
    assert.throws(() => decodeSave(JSON.stringify(old)), /damaged/);
    const earned = require('./helpers/business.cjs').campaign(2026, 2);
    const historical = JSON.parse(encodeSave(earned.state, earned.history)); historical.version = 7;
    for (const day of [historical.state, ...historical.history]) { delete day.management.upgrades.stand; if (day.business) delete day.business.conditions; }
    const restored = decodeSave(JSON.stringify(historical));
    assert.deepEqual(restored.state, earned.state);
    assert.deepEqual(restored.history, historical.history.map(day => ({ ...day, management: { ...day.management, upgrades: { ...day.management.upgrades, stand: 0 } } })));
});
