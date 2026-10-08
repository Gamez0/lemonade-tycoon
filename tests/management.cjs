const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, purchaseUpgrade, hireStaff, selectAdvertising, openDay, nextDay, results, buy } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { stock, campaign } = require('./helpers/business.cjs');
const finish = state => finishStreetDay(beginStreetDay(openDay(state))).day.game;

test('equipment purchases are immutable, two levels, cash constrained and saved', () => {
    const initial = newGame();
    const bought = purchaseUpgrade(initial, 'refrigerator');
    assert.equal(initial.management.upgrades.refrigerator, 0);
    assert.equal(bought.cash, 3100);
    assert.equal(bought.daily.capital, 900);
    assert.deepEqual(decodeSave(encodeSave(bought, [])).state, bought);
    const max = purchaseUpgrade(bought, 'refrigerator');
    assert.throws(() => purchaseUpgrade(max, 'refrigerator'), /fully/);
    assert.throws(() => purchaseUpgrade(purchaseUpgrade(max, 'iceMaker'), 'blender'), /cash/);
    assert.throws(() => purchaseUpgrade(initial, 'missing'), /Unknown/);
    assert.throws(() => hireStaff(initial, 'constructor'), /Unknown/);
    assert.throws(() => selectAdvertising(initial, 'toString'), /Unknown/);
    const unpaid = JSON.parse(encodeSave(initial, [])); unpaid.state.management.upgrades.blender = 1;
    assert.throws(() => decodeSave(JSON.stringify(unpaid)), /equipment/);
});

test('staff and ads charge once, change queues/traffic, lock paid settings, can be dismissed', () => {
    const original = stock(newGame());
    const configured = selectAdvertising(hireStaff(original, 'server'), 'flyers');
    const opened = openDay(configured);
    assert.equal(opened.cash, original.cash - 430);
    assert.equal(opened.business.serviceTicks, 6);
    assert.equal(opened.business.arrivalEvery, 4);
    assert.equal(opened.business.traffic, Math.round(openDay(original).business.traffic * 1.2));
    const checkpoint = { ...opened, phase: 'preparation' };
    assert.deepEqual(openDay(decodeSave(encodeSave(checkpoint, [])).state), opened);
    assert.throws(() => hireStaff(checkpoint, 'none'), /fixed/);
    assert.throws(() => selectAdvertising(checkpoint, 'radio'), /fixed/);
    const damaged = JSON.parse(encodeSave(checkpoint, [])); damaged.state.daily.wages = 0; damaged.state.cash += 250;
    assert.throws(() => decodeSave(JSON.stringify(damaged)), /damaged/);
    const host = openDay(hireStaff(original, 'host'));
    assert.equal(host.business.patienceTicks, 30);
    const done = finish(configured);
    assert.equal(results(done).profit, done.daily.revenue - done.daily.cost - 430);
    const tomorrow = selectAdvertising(hireStaff(nextDay(done), 'none'), 'none');
    assert.equal(openDay(stock(tomorrow)).daily.wages, 0);
    assert.equal(openDay(stock(tomorrow)).daily.advertising, 0);
});

test('ice equipment preserves exact stock, charges production, and recovers old v3 saves', () => {
    const old = JSON.parse(encodeSave(newGame(), [])); old.version = 3;
    delete old.state.management;
    for (const key of ['capital', 'wages', 'advertising']) delete old.state.daily[key];
    assert.deepEqual(decodeSave(JSON.stringify(old)).state, newGame());
    let state = purchaseUpgrade(newGame(), 'iceMaker');
    for (const [key, count] of [['lemon', 4], ['sugar', 2], ['cup', 20]]) state = buy(state, key, count);
    const opened = openDay(state);
    assert.equal(opened.stock.ice, 60);
    assert.equal(opened.daily.purchases, state.daily.purchases + 120);
    assert.equal(opened.cash, state.cash - 120);
    let saved = campaign().state;
    saved = purchaseUpgrade(purchaseUpgrade(saved, 'refrigerator'), 'refrigerator');
    const done = finish(stock(saved));
    assert.equal(nextDay(done).stock.ice, done.stock.ice);
    assert.equal(nextDay(done).daily.meltedIce, 0);
});

test('management campaigns reconcile every save and replay for thirty days', () => {
    for (const seed of [1, 2026, 87, 999]) {
        let { state, history } = campaign(seed);
        state = purchaseUpgrade(state, 'blender');
        for (let day = 0; day < 30; day++) {
            state = stock(state);
            state = hireStaff(state, day % 3 === 0 ? 'host' : day % 3 === 1 ? 'server' : 'none');
            state = selectAdvertising(state, day % 3 === 0 ? 'radio' : day % 3 === 1 ? 'flyers' : 'none');
            const opened = openDay(state);
            const checkpoint = { ...opened, phase: 'preparation' };
            const restored = decodeSave(encodeSave(checkpoint, history)).state;
            const done = finish(state);
            assert.deepEqual(finish(restored), done);
            history.push(done);
            assert.deepEqual(decodeSave(encodeSave(done, history)).state, done);
            assert.equal(done.cash, done.openingCash + done.daily.revenue - done.daily.purchases - done.daily.capital - done.daily.wages - done.daily.advertising - done.daily.rent - done.daily.moveFee);
            state = nextDay(done);
        }
    }
});
