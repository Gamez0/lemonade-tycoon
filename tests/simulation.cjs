const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, setPlan, buy, unitCost, capacity, quality, demand, openDay, stepCustomer, nextDay, results } = require('../.test-build/simulation/game.js');
const { WEATHER, ITEM_KEYS, ITEMS } = require('../.test-build/content/catalog.js');
const stocked = (seed = 2026, quantity = 80) => ITEM_KEYS.reduce((s, key) => buy(s, key, quantity), newGame(seed));
function finish(state) { while (state.phase === 'selling') state = stepCustomer(state).state; return state; }
function frozen(value) { Object.values(value).forEach(v => { if (v && typeof v === 'object') frozen(v); }); return Object.freeze(value); }

test('preparation purchases are atomic, priced exactly and immutable', () => {
    const before = frozen(newGame());
    const after = buy(before, 'lemon', 40);
    assert.equal(after.cash, 3680); assert.equal(after.stock.lemon, 40); assert.equal(after.daily.purchases, 320);
    assert.equal(before.cash, 4000); assert.equal(before.stock.lemon, 0);
    for (const invalid of [0, -1, 0.5, NaN, Infinity, 1000]) assert.throws(() => buy(before, 'cup', invalid));
    assert.throws(() => buy(before, 'lemon', 999), /cash/);
    assert.throws(() => buy(before, 'unknown', 1));
    assert.throws(() => buy({ ...before, stock: { ...before.stock, cup: 999 } }, 'cup', 1), /Storage/);
});
test('plan validation, ownership and phase guards', () => {
    const start = newGame();
    for (const price of [-1, 0, NaN, Infinity, 501, 25.5]) assert.throws(() => setPlan(start, { ...start.plan, price }));
    for (const [key, value] of [['lemon', 0], ['sugar', 5], ['ice', -1], ['ice', NaN]]) {
        assert.throws(() => setPlan(start, { ...start.plan, recipe: { ...start.plan.recipe, [key]: value } }));
    }
    const plan = { price: 125, recipe: { lemon: 2, sugar: 1, ice: 0 } };
    const changed = setPlan(start, plan); plan.recipe.lemon = 6;
    assert.equal(changed.plan.recipe.lemon, 2);
    assert.throws(() => openDay(start), /supplies/); assert.throws(() => nextDay(start)); assert.throws(() => stepCustomer(start));
    const selling = openDay(stocked());
    for (const fn of [() => openDay(selling), () => buy(selling, 'cup', 1), () => setPlan(selling, selling.plan), () => nextDay(selling)]) assert.throws(fn);
});
test('price, weather, recipe and reputation affect demand in intended directions', () => {
    const plan = newGame().plan;
    const base = demand(plan, WEATHER[1], 0.5, 0, 0.5);
    assert.ok(demand({ ...plan, price: 300 }, WEATHER[1], 0.5, 0, 0.5).probability < base.probability);
    assert.ok(demand(plan, WEATHER[0], 0.5, 0, 0.5).willingness > demand(plan, WEATHER[2], 0.5, 0, 0.5).willingness);
    assert.ok(demand(plan, WEATHER[1], 1, 0, 0.5).probability > demand(plan, WEATHER[1], 0, 0, 0.5).probability);
    assert.ok(quality({ lemon: 2, sugar: 1, ice: 4 }, 32) > quality({ lemon: 6, sugar: 1, ice: 0 }, 32));
    assert.ok(demand(plan, WEATHER[1], 0.5, 1, 0.5).willingness > demand(plan, WEATHER[1], 0.5, 2, 0.5).willingness);
    assert.ok(quality({ lemon: 2, sugar: 1, ice: 4 }, 32) > quality({ lemon: 2, sugar: 1, ice: 0 }, 32));
});
test('every sale reconciles complete stock consumption, cash, revenue and cost', () => {
    let s = openDay(stocked());
    const initial = s;
    while (s.phase === 'selling') {
        const before = frozen(s); const step = stepCustomer(s); s = step.state;
        const bought = step.event.kind === 'bought';
        assert.equal(s.cash - before.cash, bought ? s.plan.price : 0);
        for (const key of ITEM_KEYS) assert.equal(before.stock[key] - s.stock[key], bought ? key === 'cup' ? 1 : s.plan.recipe[key] : 0);
        assert.equal(s.daily.cost - before.daily.cost, bought ? unitCost(s.plan.recipe) : 0);
        assert.ok(ITEM_KEYS.every(key => s.stock[key] >= 0));
    }
    assert.ok(s.daily.sold > 0);
    assert.equal(s.daily.revenue, s.daily.sold * s.plan.price);
    assert.equal(s.daily.visitors, s.daily.sold + s.daily.rejected + s.daily.soldOut);
    const inventoryValue = stock => ITEM_KEYS.reduce((n, key) => n + stock[key] * ITEMS[key].cost, 0);
    assert.equal(inventoryValue(initial.stock) - inventoryValue(s.stock), s.daily.cost);
    assert.equal(results(s).cashChange, s.daily.revenue - s.daily.purchases);
    assert.equal(results(s).profit, s.daily.revenue - s.daily.cost);
    assert.throws(() => stepCustomer(s)); assert.throws(() => openDay(s));
});
test('one-cup inventory sells at most once and missing any ingredient blocks opening', () => {
    const start = stocked();
    for (const key of ITEM_KEYS) assert.throws(() => openDay({ ...start, stock: { ...start.stock, [key]: 0 } }));
    const s = finish(openDay({ ...start, stock: { lemon: 2, sugar: 1, ice: 2, cup: 1 } }));
    assert.equal(s.daily.sold, 1); assert.ok(s.daily.soldOut > 0);
    assert.deepEqual(s.stock, { lemon: 0, sugar: 0, ice: 0, cup: 0 });
    const noIce = setPlan(start, { ...start.plan, recipe: { ...start.plan.recipe, ice: 0 } });
    assert.ok(capacity({ ...noIce, stock: { ...noIce.stock, ice: 0 } }) > 0);
});
test('no buyers means zero revenue and no satisfaction; expensive plans fail', () => {
    const s = finish(openDay(setPlan(stocked(), { ...newGame().plan, price: 500 })));
    assert.equal(s.daily.sold, 0); assert.equal(s.daily.cost, 0); assert.equal(s.daily.revenue, 0);
    assert.equal(results(s).satisfaction, null); assert.equal(s.reputation, 0.5);
});
test('deterministic replay and ten consecutive days preserve accounts and reset daily data', () => {
    assert.deepEqual(finish(openDay(stocked(42))), finish(openDay(stocked(42))));
    let s = stocked(42);
    for (let day = 1; day <= 10; day++) {
        for (const key of ITEM_KEYS) if (s.stock[key] < 120) s = buy(s, key, 120 - s.stock[key]);
        const done = finish(openDay(s)); const next = nextDay(frozen(done));
        assert.equal(done.day, day); assert.equal(next.day, day + 1);
        assert.equal(next.cash, done.cash); assert.deepEqual(next.stock, done.stock); assert.equal(next.reputation, done.reputation);
        assert.equal(next.daily.visitors, 0); assert.equal(next.daily.revenue, 0); assert.equal(next.daily.purchases, 0);
        assert.equal(results(next).cashChange, 0); assert.throws(() => nextDay(next)); s = next;
    }
});
test('many seeded days keep numeric and economic invariants', () => {
    for (let seed = 0; seed < 200; seed++) {
        const s = finish(openDay(stocked(seed)));
        assert.ok(s.cash >= 0 && Number.isSafeInteger(s.cash));
        assert.ok(s.reputation >= 0 && s.reputation <= 1);
        assert.equal(s.daily.visitors, s.weather.traffic);
        assert.equal(s.cash, 4000 - s.daily.purchases + s.daily.revenue);
    }
});
