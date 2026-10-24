const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const game = require('../.test-build/simulation/game.js');
const street = require('../.test-build/simulation/street-day.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { WEATHER } = require('../.test-build/content/catalog.js');
const { LOCATIONS } = require('../.test-build/content/locations.js');

const prepared = (recipe, weather = WEATHER[0]) => game.buyOrder(game.setPlan({ ...game.newGame(), weather },
    { price: 25, recipe }), { lemon: 40, sugar: 20, ice: 500, cup: 40 });

test('untried recipes have identical purchase intentions at the same price, publicity and prior rating', () => {
    const good = game.openDay(prepared({ lemon: 2, sugar: 1, ice: 4 }));
    const poor = game.openDay(prepared({ lemon: 6, sugar: 1, ice: 0 }));
    let a = good, b = poor;
    for (let id = 1; id <= good.business.traffic; id++) {
        const left = game.drawVisitor(a, id), right = game.drawVisitor(b, id);
        assert.deepEqual(left.visitor, right.visitor);
        a = left.state; b = right.state;
    }
    const plan = good.plan;
    assert.ok(game.demand({ ...plan, price: 300 }, good.weather, 0.5, 0, 0.5).probability <
        game.demand(plan, good.weather, 0.5, 0, 0.5).probability);
    assert.ok(game.demand(plan, good.weather, 0.9, 0, 0.5).probability >
        game.demand(plan, good.weather, 0.1, 0, 0.5).probability);
    assert.ok(game.openDay(game.selectAdvertising(prepared(plan.recipe), 'radio')).business.traffic > good.business.traffic);
});

test('ice dilution and insufficient cooling are tasted only by buyers and reduce future rating', () => {
    for (const [weather, ideal, wrong, reason] of [[WEATHER[2], 1, 7, 'too-weak'], [WEATHER[0], 2, 0, 'too-warm']]) {
        const make = ice => game.openDay(prepared({ lemon: 6, sugar: 3, ice }, weather));
        const visitor = { id: 1, profile: 0, intent: 'buy', willingness: 500 };
        const good = game.settleVisitor(make(ideal), visitor);
        assert.deepEqual(good.event.tasteComplaints, []);
        const outcomes = Array.from({ length: 100 }, (_, i) => game.settleVisitor(make(wrong), { ...visitor, id: i + 1 }).event);
        const unhappy = outcomes.filter(event => event.satisfaction === 0);
        assert.ok(unhappy.length > 20 && unhappy.length < 90);
        for (const event of unhappy) assert.deepEqual(event.tasteComplaints, [reason]);
        assert.ok(outcomes.every(event => event.satisfaction === 0 || event.satisfaction === 100));
        for (const intent of ['passed', 'price']) {
            const rejected = game.settleVisitor(make(wrong), { ...visitor, intent });
            assert.equal(rejected.event.satisfaction, null);
            assert.deepEqual(rejected.event.tasteComplaints, []);
        }
        const goodDay = street.finishStreetDay(street.beginStreetDay(make(ideal))).day.game;
        const poorDay = street.finishStreetDay(street.beginStreetDay(make(wrong))).day.game;
        assert.ok(poorDay.reputation < goodDay.reputation);
        const poorTomorrow = game.nextDay(poorDay), goodTomorrow = game.nextDay(goodDay);
        assert.ok(game.expectedTraffic(poorTomorrow) <= game.expectedTraffic(goodTomorrow));
        assert.ok(game.demand(goodTomorrow.plan, goodTomorrow.weather, poorTomorrow.reputation, 0, 0.5).probability <
            game.demand(goodTomorrow.plan, goodTomorrow.weather, goodTomorrow.reputation, 0, 0.5).probability);
    }
    assert.deepEqual(game.recipeTaste({ lemon: 14, sugar: 3, ice: 3 }, 32).complaints, ['too-sour']);
    assert.deepEqual(game.recipeTaste({ lemon: 2, sugar: 6, ice: 3 }, 32).complaints, ['too-sweet']);
});

test('recovered original taste cases distinguish concentration, balance, cooling and dilution', () => {
    for (const [lemon, sugar, ice, temperature, score, complaints] of [
        [14, 3, 0, 34, 0, ['too-warm', 'too-sour']],
        [6, 3, 3, 40, 100, []],
        [2, 1, 3, 40, 40, ['too-weak']],
        [6, 3, 5, 20, 40, ['too-weak']],
        [6, 3, 0, 20, 100, []],
        [14, 7, 7, 20, 100, []],
        [6, 3, 0, 25, 100, []],
        [6, 3, 0, 26, 50, ['too-warm']],
        [0, 0, 0, 40, -10, ['too-warm', 'too-weak']],
    ]) {
        const actual = game.recipeTaste({ lemon, sugar, ice }, temperature);
        assert.equal(actual.score, score);
        assert.deepEqual(actual.complaints, complaints);
    }
    for (const recipe of [{ lemon: 0, sugar: 0, ice: 0 }, { lemon: 20, sugar: 10, ice: 7 }]) {
        const state = game.setPlan(game.newGame(), { price: 100, recipe });
        assert.deepEqual(decodeSave(encodeSave(state, [])).state.plan.recipe, recipe);
    }
    const water = game.buy(game.setPlan(game.newGame(), { price: 100, recipe: { lemon: 0, sugar: 0, ice: 0 } }), 'cup', 1);
    assert.equal(game.capacity(water), 1);
    assert.equal(game.openDay(water).daily.cost, 0);
});

test('daily satisfaction includes missed customers while existing paid-day reports retain their old denominator', () => {
    const opened = game.openDay(prepared({ lemon: 6, sugar: 3, ice: 5 }));
    const state = { ...opened, phase: 'results', daily: { ...opened.daily,
        sold: 40, satisfactionTotal: 1800, soldOut: 42, abandoned: 0, priceRejected: 0 } };
    assert.equal(game.results(state).satisfaction, 21);
    assert.equal(game.results({ ...state, business: { ...state.business, customerModel: undefined } }).satisfaction, 45);
});

test('office workers leave at their own deadline while other customers keep waiting in the same line', () => {
    const opened = game.openDay(prepared({ lemon: 2, sugar: 1, ice: 4 }));
    const visitor = (id, profile) => ({ id, profile, intent: 'buy', willingness: 500 });
    const day = { ...street.beginStreetDay(opened), tick: 8, arrived: 4,
        serving: { visitor: visitor(1, 0), doneAt: 40 },
        waiting: [0, 1, 2].map((profile, i) => ({ visitor: visitor(i + 2, profile), joinedAt: 0 })) };
    assert.equal(street.visitorPatienceTicks(day, visitor(3, 1)), 9);
    const next = street.tickStreet(day);
    assert.deepEqual(next.events.map(event => [event.id, event.kind]), [[3, 'abandoned']]);
    assert.deepEqual(next.day.waiting.map(person => person.visitor.profile), [0, 2]);
    assert.equal(next.day.game.cash, opened.cash);
    assert.deepEqual(next.day.game.stock, opened.stock);
    assert.ok(LOCATIONS.downtown.weights[1] / LOCATIONS.downtown.weights.reduce((a,b) => a+b) >
        LOCATIONS.park.weights[1] / LOCATIONS.park.weights.reduce((a,b) => a+b));
    const host = street.beginStreetDay(game.openDay(game.hireStaff(prepared(opened.plan.recipe), 'host')));
    for (const profile of [0, 1, 2])
        assert.equal(street.visitorPatienceTicks(host, visitor(3, profile)) -
            street.visitorPatienceTicks(street.beginStreetDay(opened), visitor(3, profile)), 12);
});

test('real alpha13 v6 paid openings retain exact old outcomes after migration and v7 protects future model data', () => {
    const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/alpha13-customer-model.json'), 'utf8'));
    for (const entry of fixture.cases) {
        const migrated = decodeSave(JSON.stringify(entry.document));
        assert.equal(migrated.version, 10);
        const { withBasicStand } = require('./helpers/stand-schema.cjs');
        assert.deepEqual(migrated.state, withBasicStand(entry.document.state));
        assert.deepEqual(street.finishStreetDay(street.beginStreetDay(game.openDay(migrated.state))).day.game, withBasicStand(entry.expected));
        assert.deepEqual(decodeSave(encodeSave(migrated.state, migrated.history)), migrated);
    }
    const opened = game.openDay(prepared({ lemon: 2, sugar: 1, ice: 4 }));
    const checkpoint = { ...opened, phase: 'preparation' };
    const raw = encodeSave(checkpoint, []);
    assert.equal(JSON.parse(raw).version, 10);
    assert.deepEqual(game.openDay(decodeSave(raw).state), opened);
    const wrong = JSON.parse(raw); wrong.state.business.customerModel = 'unknown-model';
    assert.throws(() => decodeSave(JSON.stringify(wrong)), /damaged/);
});

test('old saves cannot introduce zero-sugar legacy replay or smuggle the new model under an old version', () => {
    const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/alpha13-customer-model.json'), 'utf8'));
    for (const version of [6, 7]) {
        const invalid = structuredClone(fixture.cases[0].document);
        invalid.version = version;
        invalid.state.plan.recipe.sugar = 0;
        assert.throws(() => decodeSave(JSON.stringify(invalid)), /damaged/);
    }
    const unpaid = JSON.parse(encodeSave(game.setPlan(game.newGame(), {
        price: 100, recipe: { lemon: 0, sugar: 0, ice: 0 },
    }), []));
    assert.deepEqual(decodeSave(JSON.stringify(unpaid)).state.plan.recipe, { lemon: 0, sugar: 0, ice: 0 });
    unpaid.version = 6;
    assert.throws(() => decodeSave(JSON.stringify(unpaid)), /damaged/);
    const opened = game.openDay(prepared({ lemon: 6, sugar: 3, ice: 2 }));
    const downgraded = JSON.parse(encodeSave({ ...opened, phase: 'preparation' }, []));
    downgraded.version = 6;
    assert.throws(() => decodeSave(JSON.stringify(downgraded)), /damaged/);
});
