const { test } = require('node:test');
const assert = require('node:assert/strict');
const game = require('../.test-build/simulation/game.js');
const street = require('../.test-build/simulation/street-day.js');

const stock = (seed = 2026) => game.buyOrder(game.newGame(seed), {
    lemon: 120, sugar: 120, ice: 120, cup: 120,
});
const start = (seed, rules) => street.beginStreetDay(game.openDay(stock(seed)), rules);
const accounted = day => {
    const d = day.game.daily;
    assert.equal(d.visitors, d.sold + d.rejected + d.soldOut + d.abandoned);
    assert.equal(d.rejected, d.priceRejected + d.passed);
    assert.equal(day.arrived, day.game.business.traffic);
    assert.equal(day.waiting.length, 0);
    assert.equal(day.serving, null);
    assert.equal(day.game.cash, day.game.openingCash - d.purchases + d.revenue);
    assert.equal(d.cost, d.pitchersMade * game.pitcherCost(day.game.plan.recipe) + d.sold * 6);
    assert.ok(Object.values(day.game.stock).every(value => value >= 0));
};

test('several independent people share the street and every arrival settles once', () => {
    let day = start(2026), maxPeople = 0;
    const settled = [];
    while (day.game.phase === 'selling') {
        const step = street.tickStreet(day);
        day = step.day;
        settled.push(...step.events.map(event => event.id));
        const active = [day.serving?.visitor.id, ...day.waiting.map(p => p.visitor.id), ...day.walking.map(p => p.visitor.id)]
            .filter(id => id !== undefined);
        assert.equal(new Set(active).size, active.length);
        maxPeople = Math.max(maxPeople, active.length);
    }
    assert.ok(maxPeople >= 3, 'the street should contain multiple people at once');
    assert.deepEqual([...settled].sort((a, b) => a - b),
        Array.from({ length: day.game.business.traffic }, (_, i) => i + 1));
    accounted(day);
    while (day.walking.length) day = street.tickStreet(day).day;
    assert.equal(day.walking.length, 0);
    assert.equal(day.game.phase, 'results');
});

test('SKIP after partial service uses the same ticks and never repeats a transaction', () => {
    let partial = start(84);
    for (let i = 0; i < 73; i++) partial = street.tickStreet(partial).day;
    assert.ok(partial.game.daily.visitors > 0);
    assert.ok(partial.arrived > partial.game.daily.visitors);
    const skipped = street.finishStreetDay(partial);
    let normal = partial;
    const events = [];
    while (normal.game.phase === 'selling') {
        const step = street.tickStreet(normal);
        normal = step.day;
        events.push(...step.events);
    }
    assert.deepEqual(skipped.events, events);
    assert.deepEqual(skipped.day.game, normal.game);
    accounted(skipped.day);
    assert.deepEqual(street.finishStreetDay(start(84)).day.game,
        street.finishStreetDay(start(84)).day.game);
});

test('a long line causes waiting departures without consuming stock or cash', () => {
    const rules = { arrivalEvery: 1, serviceTicks: 16, patienceTicks: 3 };
    const before = start(2026, rules);
    const done = street.finishStreetDay(before).day;
    accounted(done);
    assert.ok(done.game.daily.abandoned > 0);
    assert.ok(done.game.daily.sold < done.game.daily.visitors);
    assert.equal(done.game.daily.revenue, done.game.daily.sold * done.game.plan.price);
});

test('high prices and one-cup stock keep distinct rejection and empty-stock reasons', () => {
    const expensive = game.openDay(game.setPlan(stock(), { ...game.newGame().plan, price: 500 }));
    const noSales = street.finishStreetDay(street.beginStreetDay(expensive)).day;
    accounted(noSales);
    assert.equal(noSales.game.daily.sold, 0);
    assert.equal(noSales.game.daily.abandoned, 0);
    const limited = game.openDay({ ...stock(), stock: { lemon: 2, sugar: 1, ice: 24, cup: 1 } });
    const empty = street.finishStreetDay(street.beginStreetDay(limited)).day;
    accounted(empty);
    assert.equal(empty.game.daily.sold, 1);
    assert.ok(empty.game.daily.soldOut > 0);
    assert.deepEqual(empty.game.stock, { lemon: 0, sugar: 0, ice: 0, cup: 0 });
});
