const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, setPlan, buy, unitCost, capacity, cupsPerPitcher, pitcherCost, quality, demand, openDay, stepCustomer, nextDay, results } = require('../.test-build/simulation/game.js');
const { openingReadiness, purchaseUpgrade } = require('../.test-build/simulation/game.js');

test('first pitcher is ready before a visitor and depletion immediately refills the same recipe', () => {
    const { settleVisitor } = require('../.test-build/simulation/game.js');
    for (let ice = 0; ice <= 7; ice++) {
        const recipe = { lemon: 6, sugar: 3, ice }, yieldCups = cupsPerPitcher(recipe);
        const prepared = setPlan(newGame(), { price: 150, recipe });
        const stock = { lemon: 18, sugar: 9, ice: 3 * ice * yieldCups, cup: yieldCups + 2 };
        let state = openDay({ ...prepared, stock });
        assert.equal(state.pitcherCups, yieldCups);
        assert.equal(state.daily.pitchersMade, 1);
        assert.equal(state.daily.sold, 0);
        assert.equal(state.daily.cost, pitcherCost(recipe));
        assert.equal(state.stock.lemon, 12);
        for (let id = 1; id <= yieldCups; id++) state = settleVisitor(state, { id, profile: 0, intent: 'buy', willingness: 500 }).state;
        assert.equal(state.daily.sold, yieldCups);
        assert.equal(state.pitcherCups, yieldCups);
        assert.equal(state.daily.pitchersMade, 2);
        assert.equal(state.stock.lemon, 6);
        assert.equal(state.stock.sugar, 3);
        assert.equal(state.stock.ice, ice * yieldCups);
        assert.equal(state.daily.cost, 2 * pitcherCost(recipe) + yieldCups * ITEMS.cup.cost);
    }
});

test('empty pitcher does not refill when the day closes, cups run out or any batch ingredient is missing', () => {
    const { settleVisitor } = require('../.test-build/simulation/game.js');
    const start = openDay(stocked());
    const visitor = { id: 1, profile: 0, intent: 'buy', willingness: 500 };
    for (const item of ['lemon', 'sugar', 'ice', 'cup', 'closing']) {
        const state = { ...start, pitcherCups: 1,
            stock: { ...start.stock, ...(item === 'closing' ? {} : { [item]: item === 'cup' ? 1 : 0 }) },
            business: { ...start.business, ...(item === 'closing' ? { traffic: 1 } : {}) } };
        const next = settleVisitor(state, visitor).state;
        assert.equal(next.pitcherCups, 0);
        assert.equal(next.daily.pitchersMade, 1);
        assert.ok(Object.values(next.stock).every(count => count >= 0));
    }
});

test('forecast ice opening reports exact full-pitcher shortage at every recipe boundary', () => {
    for (let ice = 0; ice <= 7; ice++) {
        const recipe = { lemon: 6, sugar: 3, ice };
        const needed = ice * cupsPerPitcher(recipe);
        const base = setPlan(newGame(), { price: 150, recipe });
        const ready = { ...base, stock: { lemon: 80, sugar: 40, ice: needed, cup: 40 } };
        assert.equal(openingReadiness(ready).cups, Math.min(40, cupsPerPitcher(recipe) * (ice === 0 ? 13 : 1)));
        assert.deepEqual(openingReadiness(ready).missing, { lemon: 0, sugar: 0, ice: 0, cup: 0 });
        assert.equal(openDay(ready).phase, 'selling');
        if (ice > 0) {
            const short = { ...ready, stock: { ...ready.stock, ice: needed - 1 } };
            assert.equal(openingReadiness(short).cups, 0);
            assert.equal(openingReadiness(short).missing.ice, 1);
            assert.throws(() => openDay(short), /supplies/);
        }
    }
    const screenshot = { ...setPlan(newGame(), { price: 150, recipe: { lemon: 6, sugar: 3, ice: 4 } }),
        stock: { lemon: 80, sugar: 40, ice: 60, cup: 40 } };
    assert.deepEqual(openingReadiness(screenshot), { cups: 0, missing: { lemon: 0, sugar: 0, ice: 4, cup: 0 } });
});

test('opening preview includes free maker ice once and retains paid-checkpoint stock', () => {
    const base = setPlan(purchaseUpgrade(newGame(), 'iceMaker'), { price: 150, recipe: { lemon: 2, sugar: 1, ice: 4 } });
    const ready = { ...base, stock: { lemon: 2, sugar: 1, ice: 4, cup: 20 } };
    assert.equal(capacity(ready), 0);
    assert.equal(openingReadiness(ready).cups, 16);
    const opened = openDay(ready);
    assert.equal(opened.stock.ice, 0);
    assert.equal(opened.pitcherCups, 16);
    const paid = { ...opened, phase: 'preparation', stock: { ...opened.stock, ice: 0 }, pitcherCups: 3 };
    assert.equal(openingReadiness(paid).cups, 3);
    assert.deepEqual(openingReadiness(paid).missing, { lemon: 0, sugar: 0, ice: 0, cup: 0 });
    assert.equal(openDay(paid).stock.ice, 0);
    const empty = { ...paid, pitcherCups: 0 };
    assert.equal(openingReadiness(empty).cups, 0);
    assert.equal(openingReadiness(empty).missing.ice, 64);
    assert.throws(() => openDay(empty), /supplies/);
});
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
    const initial = stocked();
    let s = openDay(initial);
    while (s.phase === 'selling') {
        const before = frozen(s); const step = stepCustomer(s); s = step.state;
        const bought = step.event.kind === 'bought';
        assert.equal(s.cash - before.cash, bought ? s.plan.price : 0);
        const made = s.daily.pitchersMade - before.daily.pitchersMade;
        for (const key of ITEM_KEYS) assert.equal(before.stock[key] - s.stock[key],
            key === 'cup' ? Number(bought) : made * (key === 'ice' ? s.plan.recipe.ice * cupsPerPitcher(s.plan.recipe) : s.plan.recipe[key]));
        assert.equal(s.daily.cost - before.daily.cost, made * pitcherCost(s.plan.recipe) + Number(bought) * ITEMS.cup.cost);
        assert.ok(ITEM_KEYS.every(key => s.stock[key] >= 0));
    }
    assert.ok(s.daily.sold > 0);
    assert.equal(s.daily.revenue, s.daily.sold * s.plan.price);
    assert.equal(s.daily.cost, s.daily.pitchersMade * pitcherCost(s.plan.recipe) + s.daily.sold * ITEMS.cup.cost);
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
    const s = finish(openDay({ ...start, stock: { lemon: 2, sugar: 1, ice: 24, cup: 1 } }));
    assert.equal(s.daily.sold, 1); assert.ok(s.daily.soldOut > 0);
    assert.deepEqual(s.stock, { lemon: 0, sugar: 0, ice: 0, cup: 0 });
    const noIce = setPlan(start, { ...start.plan, recipe: { ...start.plan.recipe, ice: 0 } });
    assert.ok(capacity({ ...noIce, stock: { ...noIce.stock, ice: 0 } }) > 0);
});
test('one pitcher uses lemons and sugar once, while ice scales yield and melts overnight', () => {
    const recipe = newGame().plan.recipe;
    assert.equal(cupsPerPitcher(recipe), 12);
    assert.equal(cupsPerPitcher({ ...recipe, ice: 4 }), 16);
    assert.equal(cupsPerPitcher({ ...recipe, lemon: 6, sugar: 4 }), 12);
    assert.ok(unitCost({ ...recipe, lemon: 6 }) > unitCost(recipe));
    const prepared = { ...stocked(), stock: { lemon: 2, sugar: 1, ice: 24, cup: 12 } };
    let state = openDay(prepared);
    const visitor = { id: 1, profile: 0, intent: 'buy', willingness: 500 };
    state = require('../.test-build/simulation/game.js').settleVisitor(state, visitor).state;
    assert.equal(state.pitcherCups, 11);
    assert.deepEqual(state.stock, { lemon: 0, sugar: 0, ice: 0, cup: 11 });
    assert.equal(state.daily.pitchersMade, 1);
    assert.equal(state.daily.cost, pitcherCost(recipe) + ITEMS.cup.cost);
    for (let i = 2; i <= 12; i++) state = require('../.test-build/simulation/game.js').settleVisitor(state, { ...visitor, id: i }).state;
    assert.equal(state.daily.sold, 12);
    assert.equal(state.daily.pitchersMade, 1);
    assert.equal(state.pitcherCups, 0);
    const overnight = nextDay(finish(openDay(stocked())));
    assert.equal(overnight.stock.ice, 0);
    assert.ok(overnight.daily.meltedIce > 0);
});
test('no buyers means zero revenue but the prepared first pitcher still costs ingredients', () => {
    const s = finish(openDay(setPlan(stocked(), { ...newGame().plan, price: 500 })));
    assert.equal(s.daily.sold, 0); assert.equal(s.daily.cost, pitcherCost(s.plan.recipe)); assert.equal(s.daily.revenue, 0);
    assert.equal(results(s).satisfaction, null); assert.equal(s.reputation, 0.5);
});
test('deterministic replay and ten consecutive days preserve accounts and reset daily data', () => {
    assert.deepEqual(finish(openDay(stocked(42))), finish(openDay(stocked(42))));
    let s = stocked(42);
    for (let day = 1; day <= 10; day++) {
        for (const key of ITEM_KEYS) if (s.stock[key] < 120) s = buy(s, key, 120 - s.stock[key]);
        const done = finish(openDay(s)); const next = nextDay(frozen(done));
        assert.equal(done.day, day); assert.equal(next.day, day + 1);
        assert.equal(next.cash, done.cash); assert.deepEqual(next.stock, { ...done.stock, ice: 0 }); assert.equal(next.reputation, done.reputation);
        assert.equal(next.daily.meltedIce, done.stock.ice);
        assert.equal(next.daily.visitors, 0); assert.equal(next.daily.revenue, 0); assert.equal(next.daily.purchases, 0);
        assert.equal(results(next).cashChange, 0); assert.throws(() => nextDay(next)); s = next;
    }
});
test('many seeded days keep numeric and economic invariants', () => {
    for (let seed = 0; seed < 200; seed++) {
        const s = finish(openDay(stocked(seed)));
        assert.ok(s.cash >= 0 && Number.isSafeInteger(s.cash));
        assert.ok(s.reputation >= 0 && s.reputation <= 1);
        assert.equal(s.daily.visitors, s.business.traffic);
        assert.equal(s.cash, 4000 - s.daily.purchases + s.daily.revenue);
    }
});

test('staged multi-item checkout commits everything or nothing', () => {
    const { buyOrder } = require('../.test-build/simulation/game.js');
    const before = frozen(newGame());
    const order = frozen({ lemon: 40, sugar: 20, ice: 60, cup: 20 });
    const after = buyOrder(before, order);
    assert.deepEqual(after.stock, order);
    assert.equal(after.cash, 3360);
    assert.equal(after.daily.purchases, 640);
    const short = frozen({ ...before, cash: 550 });
    assert.throws(() => buyOrder(short, order), /cash/);
    assert.deepEqual(short.stock, before.stock);
    assert.equal(short.cash, 550);
    assert.equal(short.daily.purchases, 0);
    const full = frozen({ ...before, stock: { ...before.stock, cup: 990 } });
    assert.throws(() => buyOrder(full, order), /Storage/);
    assert.equal(full.stock.lemon, 0);
    for (const quantity of [-1, .5, NaN, Infinity, 1000]) assert.throws(() => buyOrder(before, { ...order, cup: quantity }));
    assert.throws(() => buyOrder(before, { lemon: 0, sugar: 0, ice: 0, cup: 0 }), /Choose/);
    assert.throws(() => buyOrder(openDay(after), order), /preparation/);
});
