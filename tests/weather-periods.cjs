const { test } = require('node:test');
const assert = require('node:assert/strict');
const { weatherPeriod, periodTraffic, periodWeather } = require('../.test-build/simulation/weather-periods.js');
const game = require('../.test-build/simulation/game.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { beginStreetDay, finishStreetDay, tickStreet } = require('../.test-build/simulation/street-day.js');
const { stock } = require('./helpers/business.cjs');

test('actual main v10 paid checkpoints retain weather, RNG, fees, stock and completed ledger exactly', () => {
    for (const fixture of require('./fixtures/weather-news-v10.json').cases) {
        const restored = decodeSave(JSON.stringify(fixture.document));
        assert.deepEqual(restored.state, fixture.document.state);
        assert.equal(restored.state.weatherForecast, undefined);
        const done = finishStreetDay(beginStreetDay(game.openDay(restored.state))).day.game;
        assert.deepEqual(done, fixture.expected, `v10 seed ${fixture.seed}`);
    }
});

test('period opening is atomic; frozen actual weather and fees replay identically after reload', () => {
    for (const seed of [1, 42, 2026, 0xffffffff]) {
        const fresh = game.withWeatherForecast(game.newGame(seed));
        const before = JSON.stringify(fresh);
        assert.throws(() => game.openDay(fresh), /supplies/);
        assert.equal(JSON.stringify(fresh), before);
        assert.deepEqual(decodeSave(encodeSave(fresh, [])).state, fresh);
        const prepared = stock(fresh), opened = game.openDay(prepared);
        const unaffordable = { ...prepared, management: { ...prepared.management, advertising: 'flyers' }, cash: 0 };
        const unchanged = JSON.stringify(unaffordable);
        assert.throws(() => game.openDay(unaffordable), /cash/);
        assert.equal(JSON.stringify(unaffordable), unchanged);
        assert.equal(opened.business.traffic, periodTraffic(opened.business.periods.quotas));
        assert.ok(opened.business.periods.actual.every(w => w.temperature >= 10 && w.temperature <= 40));
        const checkpoint = { ...opened, phase: 'preparation' };
        const restored = decodeSave(encodeSave(checkpoint, [])).state;
        assert.deepEqual(game.openDay(restored), opened);
        const expected = finishStreetDay(beginStreetDay(opened)).day.game;
        assert.deepEqual(finishStreetDay(beginStreetDay(game.openDay(restored))).day.game, expected);
        let ordinary = beginStreetDay(opened);
        while (ordinary.game.phase === 'selling') ordinary = tickStreet(ordinary).day;
        assert.deepEqual(ordinary.game, expected);
        assert.deepEqual(decodeSave(encodeSave(expected, [expected])).state, expected);
        const next = game.nextDay(expected);
        assert.ok(next.weatherForecast);
        assert.notDeepEqual(next.weatherForecast, fresh.weatherForecast);
        assert.deepEqual(decodeSave(encodeSave(next, [expected])).state, next);
    }
});

test('street periods handle empty quotas, single visitors, final queues and sold-out arrivals without duplication', () => {
    const opened = game.openDay(stock(game.withWeatherForecast(game.newGame(1))));
    for (const quotas of [[0, 0, 1], [0, 2, 0], [1, 0, 0], [1, 0, 2], [0, 1, 2], [1, 1, 0]]) {
        const total = periodTraffic(quotas);
        for (const price of [25, 500]) {
            const state = { ...opened, stock: { ...opened.stock, cup: 1 }, plan: { ...opened.plan, price },
                business: { ...opened.business, traffic: total, activePeriod: weatherPeriod(quotas, 1),
                    periods: { ...opened.business.periods, quotas } } };
            let day = beginStreetDay(state);
            while (day.game.phase === 'selling') {
                day = tickStreet(day).day;
                assert.equal(day.game.business.activePeriod, weatherPeriod(quotas, Math.max(1, day.arrived)));
                assert.ok(day.game.daily.visitors <= day.arrived);
            }
            assert.equal(day.arrived, total);
            assert.equal(day.game.daily.visitors, total);
            assert.ok(day.game.daily.sold <= 1);
            assert.equal(day.waiting.length, 0);
            assert.equal(day.serving, null);
            assert.equal(day.game.business.activePeriod, weatherPeriod(quotas, total));
        }
    }
});

test('service-time taste changes across the arrival boundary while queued willingness stays fixed', () => {
    const prepared = game.setPlan(stock(game.withWeatherForecast(game.newGame(42))),
        { price: 25, recipe: { lemon: 6, sugar: 3, ice: 0 } });
    const opened = game.openDay(prepared);
    const actual = [{ label: 'Sunny', temperature: 40, traffic: 48 },
        { label: 'Rainy', temperature: 10, traffic: 32 }, { label: 'Cloudy', temperature: 23, traffic: 40 }];
    const hot = { ...opened, business: { ...opened.business, traffic: 3, activePeriod: 0,
        periods: { model: 'arrival-periods-v1', actual, quotas: [1, 1, 1] } } };
    const visitor = { id: 1, profile: 0, intent: 'buy', willingness: 200 };
    const cold = game.drawVisitor(hot, 2).state;
    assert.equal(game.effectiveWeather(cold).temperature, 10);
    assert.equal(game.recipeTaste(cold.plan.recipe, game.effectiveWeather(cold).temperature).score, 100);
    assert.equal(game.settleVisitor(cold, visitor).event.satisfaction, 100);
    assert.equal(visitor.willingness, 200);
    const mall = { ...cold, location: 'mall' };
    assert.equal(game.effectiveWeather(mall).temperature, 20);
    assert.equal(game.effectiveWeather(hot).temperature, 40);
    assert.deepEqual(game.weatherTemperatures(cold), [40, 10, 23]);
    assert.deepEqual(game.weatherTemperatures(mall), [20, 20, 20]);
    const emptyHot = { ...cold, business: { ...cold.business, periods: { ...cold.business.periods, quotas: [0, 2, 1] } } };
    assert.deepEqual(game.weatherTemperatures(emptyHot), [10, 23]);
});

test('period save validation rejects wrong tuple lengths, quotas, active boundaries and old-schema smuggling', () => {
    const opened = game.openDay(stock(game.withWeatherForecast(game.newGame(42))));
    const raw = encodeSave({ ...opened, phase: 'preparation' }, []);
    for (const mutate of [
        d => { d.version = 10; },
        d => { d.state.weatherForecast.pop(); },
        d => { d.state.business.periods.actual.pop(); },
        d => { d.state.business.periods.actual[0].temperature = 41; },
        d => { d.state.business.periods.quotas[0] = -1; },
        d => { d.state.business.periods.quotas[0]++; },
        d => { d.state.business.activePeriod = 3; },
        d => { delete d.state.weatherForecast; },
        d => { delete d.state.business.periods; },
    ]) { const doc = JSON.parse(raw); mutate(doc); assert.throws(() => decodeSave(JSON.stringify(doc)), /damaged/); }
    const future = JSON.parse(raw); future.version = 12;
    assert.throws(() => decodeSave(JSON.stringify(future)), /Unsupported save version/);
});

test('weather periods count generated visitors, skip empty quotas and retain the last occupied period', () => {
    for (let first = 0; first <= 5; first++) for (let middle = 0; middle <= 5; middle++)
        for (let last = 0; last <= 5; last++) {
            const quotas = [first, middle, last];
            const expected = quotas.flatMap((quota, index) => Array(quota).fill(index));
            assert.equal(periodTraffic(quotas), expected.length);
            if (!expected.length) { assert.throws(() => weatherPeriod(quotas, 1), /at least one/); continue; }
            for (let visitor = 1; visitor <= expected.length + 3; visitor++)
                assert.equal(weatherPeriod(quotas, visitor), expected[Math.min(visitor, expected.length) - 1],
                    `${quotas}: visitor ${visitor}`);
        }
});

test('weather period selects the frozen actual observation without mutating or rerolling it', () => {
    const actual = [{ label: 'Sunny', temperature: 35, traffic: 48 },
        { label: 'Rainy', temperature: 19, traffic: 32 }, { label: 'Cloudy', temperature: 24, traffic: 40 }];
    const periods = { model: 'arrival-periods-v1', actual, quotas: [2, 1, 0] };
    const before = JSON.stringify(periods);
    assert.equal(periodWeather(periods, 2), actual[0]);
    assert.equal(periodWeather(periods, 3), actual[1]);
    assert.equal(periodWeather(periods, 500), actual[1]);
    assert.equal(JSON.stringify(periods), before);
});

test('invalid period counters and traffic are rejected before selecting weather', () => {
    for (const quotas of [[1, 2], [1, 2, 3, 4], [-1, 1, 1], [1.5, 1, 1], [NaN, 1, 1],
        [Infinity, 0, 0], [501, 0, 0], [250, 250, 1]]) assert.throws(() => periodTraffic(quotas));
    for (const visitor of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
        assert.throws(() => weatherPeriod([1, 1, 1], visitor), /positive/);
    assert.equal(periodTraffic([500, 0, 0]), 500);
});
