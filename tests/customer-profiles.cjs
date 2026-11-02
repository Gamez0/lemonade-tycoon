const { test } = require('node:test');
const assert = require('node:assert/strict');
const game = require('../.test-build/simulation/game.js');
const { CUSTOMER_PROFILES, LOCATION_CUSTOMER_WEIGHTS, profilePatience } = require('../.test-build/content/customer-profiles.js');
const { LOCATION_IDS } = require('../.test-build/content/locations.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { beginStreetDay, finishStreetDay, visitorPatienceTicks } = require('../.test-build/simulation/street-day.js');
const { stock } = require('./helpers/business.cjs');

test('retained eleven groups cover all ten venues, including 80% station groups1/2 and distinct beach types', () => {
    assert.equal(CUSTOMER_PROFILES.length, 11);
    assert.deepEqual(Object.keys(LOCATION_CUSTOMER_WEIGHTS).sort(), [...LOCATION_IDS].sort());
    for (const weights of Object.values(LOCATION_CUSTOMER_WEIGHTS)) {
        assert.equal(weights.length, 11);
        assert.equal(weights.reduce((a, b) => a + b), 100);
    }
    assert.equal(LOCATION_CUSTOMER_WEIGHTS['train-station'][0] + LOCATION_CUSTOMER_WEIGHTS['train-station'][1], 80);
    assert.equal(LOCATION_CUSTOMER_WEIGHTS.beach[10], 25);
    assert.equal(LOCATION_CUSTOMER_WEIGHTS.neighborhood[8], 0);
});

test('all ten frozen mixtures select only represented groups with the observed weighted proportions', () => {
    const base = game.openDay(stock(game.withCustomerProfiles(game.newGame(42))));
    for (const id of LOCATION_IDS) {
        const weights = LOCATION_CUSTOMER_WEIGHTS[id], counts = Array(11).fill(0);
        let state = { ...base, business: { ...base.business, weights } };
        for (let i = 1; i <= 10000; i++) {
            const draw = game.drawVisitor(state, i); state = draw.state; counts[draw.visitor.profile]++;
        }
        weights.forEach((weight, i) => {
            if (!weight) assert.equal(counts[i], 0);
            else assert.ok(Math.abs(counts[i] / 100 - weight) < 2, `${id} group${i + 1}: ${counts[i]}`);
        });
    }
});

test('each group has its own budget ceiling and patience, while staff retains the complete additive bonus', () => {
    const opened = game.openDay(stock(game.withCustomerProfiles(game.newGame(1))));
    const day = beginStreetDay(opened);
    for (let i = 0; i < 11; i++) {
        const weights = Array(11).fill(0); weights[i] = 100;
        const state = { ...opened, business: { ...opened.business, weights } };
        const draw = game.drawVisitor(state, 1);
        assert.equal(draw.visitor.profile, i);
        assert.ok(draw.visitor.willingness <= CUSTOMER_PROFILES[i].maximumPrice * state.business.budget);
        assert.equal(visitorPatienceTicks(day, draw.visitor), profilePatience(day.rules.patienceTicks, i, 0));
        assert.equal(profilePatience(18, i, 12), profilePatience(18, i, 0) + 12);
    }
    assert.ok(profilePatience(18, 0, 0) < profilePatience(18, 5, 0));
    const expensive = { ...opened, plan: { ...opened.plan, price: 500 }, business: { ...opened.business,
        weights: [0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0] } };
    assert.equal(game.drawVisitor(expensive, 1).visitor.intent, 'price');
});

test('new roster keeps per-cup ice, tasted ratings and deterministic paid reload, rejecting forged model combinations', () => {
    const prepared = stock(game.withCustomerProfiles(game.withWeatherForecast(game.newGame(1))), 125);
    const opened = game.openDay(prepared);
    assert.equal(opened.business.customerModel, 'eleven-profiles-v1');
    assert.equal(opened.business.weights.length, 11);
    const raw = encodeSave({ ...opened, phase: 'preparation' }, []);
    const restored = decodeSave(raw);
    assert.deepEqual(game.openDay(restored.state), opened);
    const expected = finishStreetDay(beginStreetDay(opened)).day.game;
    assert.deepEqual(finishStreetDay(beginStreetDay(game.openDay(restored.state))).day.game, expected);
    assert.equal(expected.stock.ice, prepared.stock.ice - expected.daily.sold * prepared.plan.recipe.ice);
    assert.equal(game.satisfactionCustomers(expected), expected.daily.sold + expected.daily.priceRejected + expected.daily.soldOut + expected.daily.abandoned);
    assert.equal(game.results(expected).satisfaction, Math.floor(expected.daily.satisfactionTotal / game.satisfactionCustomers(expected)));
    assert.deepEqual(decodeSave(encodeSave(game.nextDay(expected), [expected])).history, [expected]);
    for (const change of [d => { d.version = 11; }, d => { delete d.state.customerProfileModel; },
        d => { d.state.business.weights.pop(); }, d => { d.state.business.weights[0]++; },
        d => { d.state.business.weights[0] = -1; }, d => { d.state.business.customerModel = 'purchase-first-v1'; }]) {
        const doc = JSON.parse(raw); change(doc); assert.throws(() => decodeSave(JSON.stringify(doc)), /damaged/);
    }
});

test('actual pre-update v11 weather-period paid days and old v10/v7-shaped paid models replay field-for-field', () => {
    for (const filename of ['./fixtures/intraday-weather-v11.json', './fixtures/weather-news-v10.json'])
        for (const fixture of require(filename).cases) {
            const restored = decodeSave(JSON.stringify(fixture.document));
            assert.deepEqual(restored.state, fixture.document.state);
            assert.equal(game.withCustomerProfiles(restored.state), restored.state);
            assert.deepEqual(finishStreetDay(beginStreetDay(game.openDay(restored.state))).day.game, fixture.expected);
        }
    for (const fixture of require('./fixtures/weather-news-v10.json').cases) {
        const doc = structuredClone(fixture.document); doc.version = 7; delete doc.state.business.conditions;
        const expected = structuredClone(fixture.expected); delete expected.business.conditions;
        assert.deepEqual(finishStreetDay(beginStreetDay(game.openDay(decodeSave(JSON.stringify(doc)).state))).day.game, expected);
    }
});
