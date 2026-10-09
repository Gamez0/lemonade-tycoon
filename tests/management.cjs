const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, purchaseUpgrade, hireStaff, selectAdvertising, openDay, openingCosts, setPlan, nextDay, results, settleVisitor, unitCost, buy } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { stock, campaign } = require('./helpers/business.cjs');
const finish = state => finishStreetDay(beginStreetDay(openDay(state))).day.game;

test('ice maker cannot prevent a stocked low-cash business from reopening and replaying', () => {
    for (const [lemons, sugar, cups, cash] of [[343, 2, 8, 0], [344, 1, 7, 2], [344, 1, 6, 8]]) {
        let state = purchaseUpgrade(newGame(), 'iceMaker');
        state = setPlan(state, { price: 175, recipe: { lemon: 1, sugar: 1, ice: 1 } });
        state = buy(buy(buy(state, 'lemon', lemons), 'sugar', sugar), 'cup', cups);
        assert.equal(state.cash, cash);
        assert.deepEqual(openingCosts(state), { fees: 0, ice: 60 });
        const opened = openDay(state);
        assert.equal(opened.cash, cash);
        assert.equal(opened.stock.ice, 49);
        assert.equal(opened.freeIce, 49);
        assert.equal(opened.daily.freeIceUsed, 11);
        assert.equal(opened.daily.purchases, state.daily.purchases);
        const restored = decodeSave(encodeSave({ ...opened, phase: 'preparation' }, [])).state;
        assert.deepEqual(openingCosts(restored), { fees: 0, ice: 0 });
        assert.deepEqual(openDay(restored), opened);
        const done = finish(state);
        assert.deepEqual(finish(restored), done);
        assert.deepEqual(decodeSave(encodeSave(done, [done])).state, done);
        const staffed = hireStaff(state, 'server');
        assert.deepEqual(openingCosts(staffed), { fees: 250, ice: 60 });
        assert.throws(() => openDay(staffed), /opening costs/);
    }
});

test('free ice respects stock space and equipment limit without changing fixed fees', () => {
    const base = hireStaff(purchaseUpgrade(stock(newGame()), 'iceMaker'), 'server');
    for (const [cash, stockIce, ice] of [[250, 0, 60], [500, 998, 1], [500, 999, 0], [500, 0, 60]]) {
        const state = { ...base, cash, stock: { ...base.stock, ice: stockIce },
            plan: { ...base.plan, recipe: { lemon: 1, sugar: 1, ice: 0 } } };
        assert.deepEqual(openingCosts(state), { fees: 250, ice });
        const opened = openDay(state);
        assert.equal(opened.cash, cash - 250);
        assert.equal(opened.stock.ice, stockIce + ice);
    }
    const upgraded = purchaseUpgrade(campaign().state, 'iceMaker');
    assert.equal(openingCosts(purchaseUpgrade(upgraded, 'iceMaker')).ice, 120);
    const recipe = { lemon: 2, sugar: 1, ice: 2 };
    assert.equal(unitCost(recipe, 60), 20 / 12 + 6);
    assert.equal(unitCost(recipe, 10), (20 + 14 * 2) / 12 + 6);
});

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

test('ice equipment preserves exact stock, produces free ice, and recovers old v3 saves', () => {
    const old = JSON.parse(encodeSave(newGame(), [])); old.version = 3;
    delete old.state.management;
    for (const key of ['capital', 'wages', 'advertising']) delete old.state.daily[key];
    assert.deepEqual(decodeSave(JSON.stringify(old)).state, newGame());
    let state = purchaseUpgrade(newGame(), 'iceMaker');
    for (const [key, count] of [['lemon', 4], ['sugar', 2], ['cup', 20]]) state = buy(state, key, count);
    const opened = openDay(state);
    assert.equal(opened.stock.ice, 36);
    assert.equal(opened.daily.purchases, state.daily.purchases);
    assert.equal(opened.cash, state.cash);
    let saved = campaign().state;
    saved = purchaseUpgrade(purchaseUpgrade(saved, 'refrigerator'), 'refrigerator');
    const done = finish(stock(saved));
    assert.equal(nextDay(done).stock.ice, done.stock.ice);
    assert.equal(nextDay(done).daily.meltedIce, 0);
});

test('free ice is used first and never counted as a purchased ingredient expense', () => {
    let state = purchaseUpgrade(newGame(), 'iceMaker');
    state = setPlan(state, { price: 175, recipe: { lemon: 2, sugar: 1, ice: 2 } });
    for (const [key, count] of [['lemon', 6], ['sugar', 3], ['ice', 40], ['cup', 25]]) state = buy(state, key, count);
    state = openDay(state);
    while (state.phase === 'selling') {
        const id = state.daily.visitors + 1;
        state = settleVisitor(state, { id, profile: 0, willingness: 500, intent: id <= 25 ? 'buy' : 'passed' }).state;
    }
    assert.equal(state.daily.pitchersMade, 3);
    assert.equal(state.daily.freeIceUsed, 60);
    assert.equal(state.freeIce, 0);
    assert.equal(state.stock.ice, 28);
    assert.equal(state.daily.cost, 3 * (2 * 8 + 4) + 12 * 2 + 25 * 6);
    assert.deepEqual(decodeSave(encodeSave(state, [state])).state, state);
    for (const mutate of [doc => { doc.state.freeIce = 29; }, doc => { doc.state.daily.freeIceUsed = 73; }]) {
        const doc = JSON.parse(encodeSave(state, [state])); mutate(doc);
        assert.throws(() => decodeSave(JSON.stringify(doc)), /damaged/);
    }
});

test('refrigeration retains free ice without introducing a cost basis', () => {
    for (const level of [0, 1, 2]) {
        let { state, history } = campaign();
        state = purchaseUpgrade(state, 'iceMaker');
        for (let i = 0; i < level; i++) state = purchaseUpgrade(state, 'refrigerator');
        state = setPlan(stock(state, 500), { price: 500, recipe: { lemon: 2, sugar: 1, ice: 2 } });
        const done = finish(state); history.push(done);
        assert.equal(done.daily.sold, 0);
        const tomorrow = nextDay(done);
        assert.equal(tomorrow.freeIce, Math.floor(done.freeIce * level / 2));
        assert.deepEqual(decodeSave(encodeSave(tomorrow, history)).state, tomorrow);
        const opened = openDay(tomorrow);
        assert.equal(opened.freeIce, tomorrow.freeIce + 60 - 24);
        assert.equal(opened.daily.purchases, 0);
    }
});

test('v4 charged ice checkpoint migrates without refund or repricing and replays once', () => {
    const { state: initial, history } = campaign();
    const prepared = purchaseUpgrade(stock(initial), 'iceMaker');
    const opened = openDay(prepared);
    // Historical v4 opening had not prepared a pitcher yet; reconstruct that schema.
    const old = { ...opened, phase: 'preparation', freeIce: 0, pitcherCups: 0, cash: opened.cash - 120,
        stock: { ...opened.stock, lemon: opened.stock.lemon + prepared.plan.recipe.lemon,
            sugar: opened.stock.sugar + prepared.plan.recipe.sugar,
            ice: opened.stock.ice + prepared.plan.recipe.ice * require('../.test-build/simulation/game.js').cupsPerPitcher(prepared.plan.recipe) },
        daily: { ...opened.daily, cost: 0, pitchersMade: 0, freeIceUsed: 0, purchases: opened.daily.purchases + 120 } };
    const document = JSON.parse(JSON.stringify({ version: 4, state: old, history }));
    for (const state of [...document.history, document.state]) { delete state.freeIce; delete state.daily.freeIceUsed; }
    const migrated = decodeSave(JSON.stringify(document));
    assert.deepEqual(migrated.state, old);
    const done = finish(migrated.state);
    assert.equal(done.daily.freeIceUsed, 0);
    assert.equal(done.daily.purchases, old.daily.purchases);
    const tomorrow = nextDay(done);
    assert.equal(openDay(tomorrow).daily.purchases, 0);
    assert.equal(openDay(tomorrow).freeIce, 60 - tomorrow.plan.recipe.ice * require('../.test-build/simulation/game.js').cupsPerPitcher(tomorrow.plan.recipe));
});

test('management campaigns reconcile every save and replay for thirty days', () => {
    for (const seed of [1, 2026, 87, 999]) {
        let { state, history } = campaign(seed);
        state = purchaseUpgrade(state, 'blender');
        state = purchaseUpgrade(state, 'iceMaker');
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
