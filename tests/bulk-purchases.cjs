const { test } = require('node:test');
const assert = require('node:assert/strict');
const game = require('../.test-build/simulation/game.js');
const { withInventoryCosts, totalCost, allocatedCost } = require('../.test-build/simulation/inventory-costs.js');
const { minimumPackCost, supplyPacks } = require('../.test-build/content/supply-packs.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const empty = () => ({ lemon: [0, 0, 0], sugar: [0, 0, 0], ice: [0, 0, 0], cup: [0, 0, 0] });
const finish = state => finishStreetDay(beginStreetDay(game.openDay(state))).day.game;
function pack(state, item, index, count = 1) {
    const order = empty(); order[item][index] = count;
    return game.buyPacks(state, order);
}
const conserve = state => assert.equal(totalCost(state.inventoryCosts.values) + state.daily.cost,
    state.inventoryCosts.opening + state.daily.purchases);

test('confirmed ice and cup packs charge their exact quotes and discount larger quantities', () => {
    for (const item of ['ice', 'cup']) for (const [index, quote] of supplyPacks(item, true).entries()) {
        const before = game.newGame(), after = pack(before, item, index);
        assert.equal(after.stock[item], quote.quantity);
        assert.equal(after.cash, before.cash - quote.price);
        assert.equal(after.daily.purchases, quote.price);
        assert.equal(after.inventoryCosts.values[item], quote.price);
        assert.equal(totalCost(after.inventoryCosts.values), quote.price);
        assert.deepEqual(decodeSave(encodeSave(after, [])).state, after);
        conserve(after);
    }
    assert.deepEqual(supplyPacks('ice', true).map(p => [p.quantity, p.price]), [[50, 100], [200, 300], [500, 500]]);
    assert.deepEqual(supplyPacks('cup', true).map(p => [p.quantity, p.price]), [[75, 100], [225, 235], [400, 375]]);
});

test('mixed multipack checkout is atomic on price, storage, counts and malformed orders', () => {
    const order = empty(); order.ice = [1, 2, 1]; order.cup = [2, 0, 1];
    const start = game.newGame(), after = game.buyPacks(start, order);
    assert.equal(after.stock.ice, 950); assert.equal(after.stock.cup, 550);
    assert.equal(start.cash - after.cash, 1775);
    assert.equal(after.inventoryCosts.values.ice, 1200);
    assert.equal(after.inventoryCosts.values.cup, 575);
    conserve(after);
    for (const mutate of [o => { o.ice = [0, 0, 2]; }, o => { o.cup[0] = -1; },
        o => { o.cup[0] = 0.5; }, o => { o.ice.pop(); }, o => { o.lemon = [99, 0, 0]; }]) {
        const invalid = structuredClone(order); mutate(invalid);
        const snapshot = JSON.stringify(start);
        assert.throws(() => game.buyPacks(start, invalid));
        assert.equal(JSON.stringify(start), snapshot);
    }
    assert.throws(() => game.buyPacks({ ...start, cash: 1774, openingCash: 1774 }, order), /cash/);
    assert.throws(() => game.buyPacks(start, empty()), /Choose supplies/);
});

test('weighted consumption, free generated ice and overnight retention conserve acquisition cents', () => {
    for (const fridge of [0, 1, 2]) {
        let state = game.withCustomerProfiles(game.newGame(13));
        state = { ...state, cash: 10000, openingCash: 10000 };
        state = game.purchaseUpgrade(state, 'iceMaker');
        for (let n = 0; n < fridge; n++) state = game.purchaseUpgrade(state, 'refrigerator');
        for (const [item, quantity] of [['lemon', 80], ['sugar', 40]]) state = game.buy(state, item, quantity);
        state = pack(pack(pack(state, 'cup', 0), 'cup', 2), 'ice', 1);
        assert.equal(state.inventoryCosts.values.cup, 475);
        assert.equal(allocatedCost(state, 'cup', 475), 475);
        const opened = game.openDay(state);
        assert.equal(opened.freeIce, 60);
        assert.equal(opened.inventoryCosts.values.ice, 300);
        conserve(opened);
        const checkpoint = { ...opened, phase: 'preparation' };
        const restored = decodeSave(encodeSave(checkpoint, [])).state;
        assert.deepEqual(game.openDay(restored), opened);
        const done = finish(restored);
        conserve(done);
        assert.equal(done.daily.cost, totalCost(state.inventoryCosts.values) - totalCost(done.inventoryCosts.values));
        assert.deepEqual(decodeSave(encodeSave(done, [done])).state, done);
        const next = game.nextDay(done);
        conserve(next);
        assert.equal(next.inventoryCosts.values.ice, Math.round(done.inventoryCosts.values.ice *
            (next.stock.ice - next.freeIce) / (done.stock.ice - done.freeIce)));
        assert.deepEqual(decodeSave(encodeSave(next, [done])).state, next);
    }
});

test('actual main v12 paid openings replay exactly and adopt only after the next unpaid boundary', () => {
    for (const fixture of require('./fixtures/alpha21-v12-supplies.json').cases) {
        const restored = decodeSave(JSON.stringify(fixture.document)).state;
        assert.deepEqual(restored, fixture.document.state);
        assert.equal(withInventoryCosts(restored), restored);
        assert.equal(supplyPacks('cup', Boolean(restored.inventoryCosts))[0].quantity, 20);
        assert.deepEqual(finish(restored), fixture.expected);
        const toppedUp = pack(restored, 'ice', 0);
        assert.equal(toppedUp.cash, restored.cash - 120);
        assert.equal(toppedUp.stock.ice, restored.stock.ice + 60);
        assert.equal(toppedUp.inventoryCosts, undefined);
        const after = withInventoryCosts(game.nextDay(fixture.expected));
        assert(after.inventoryCosts);
        conserve(after);
        assert.deepEqual(decodeSave(encodeSave(after, [fixture.expected])).history, [fixture.expected]);
    }
});

test('save validation rejects changed acquisition pools and legacy smuggling', () => {
    const raw = encodeSave(pack(game.newGame(), 'cup', 0), []);
    for (const change of [d => { d.version = 12; }, d => { d.state.inventoryCosts.values.cup++; },
        d => { d.state.inventoryCosts.opening++; }, d => { d.state.inventoryCosts.values.ice = 1; },
        d => { d.state.inventoryCosts.values.cup = 0.5; }]) {
        const document = JSON.parse(raw); change(document);
        assert.throws(() => decodeSave(JSON.stringify(document)), /damaged/);
    }
});

test('bankruptcy checks quoted affordable packs while keeping the paid legacy rule unchanged', () => {
    const state = withInventoryCosts(game.newGame());
    assert.equal(game.isBankrupt({ ...state, cash: 99 }), true);
    assert.equal(game.isBankrupt({ ...state, cash: 100 }), false);
    assert.equal(game.isBankrupt({ ...game.newGame(), cash: 6 }), false);
    assert.equal(minimumPackCost('cup', 76, 999), 200);
    assert.equal(minimumPackCost('cup', 151, 999), 235);
    assert.equal(minimumPackCost('ice', 201, 999), 400);
    assert.equal(minimumPackCost('ice', 450, 999), 500);
    const legacy = { ...game.newGame(), cash: 0, daily: { ...game.newGame().daily, purchases: 4000 } };
    assert.equal(withInventoryCosts(legacy), legacy);
    assert.deepEqual(decodeSave(encodeSave(legacy, [])).state, legacy);
});

test('repeated weighted days preserve exact history, paid replay and inventory transitions', () => {
    let state = withInventoryCosts(game.withCustomerProfiles(game.withWeatherForecast(game.newGame(42))));
    const history = [];
    for (let day = 0; day < 12; day++) {
        for (const [item, target] of [['lemon', 80], ['sugar', 40]])
            if (state.stock[item] < target) state = game.buy(state, item, target - state.stock[item]);
        if (state.stock.cup < 75) state = pack(state, 'cup', day % 3);
        if (state.stock.ice < 100) state = pack(state, 'ice', 1);
        const opened = game.openDay(state);
        const checkpoint = decodeSave(encodeSave({ ...opened, phase: 'preparation' }, history)).state;
        const done = finish(checkpoint);
        assert.deepEqual(done, finish(state));
        conserve(done);
        history.push(done);
        state = game.nextDay(done);
        assert.deepEqual(decodeSave(encodeSave(state, history)).state, state);
    }
    const forged = JSON.parse(encodeSave(state, history));
    delete forged.state.inventoryCosts;
    assert.throws(() => decodeSave(JSON.stringify(forged)), /inventory costs/);
});
