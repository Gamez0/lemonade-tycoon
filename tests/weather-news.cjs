const { test } = require('node:test');
const assert = require('node:assert/strict');
const game = require('../.test-build/simulation/game.js');
const { WEATHER } = require('../.test-build/content/catalog.js');
const { DAILY_NEWS, newsForDay } = require('../.test-build/content/day-conditions.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { stock } = require('./helpers/business.cjs');

test('hot weather needs more cooling; cold weather permits no ice and excess dilution hurts', () => {
    const plain = { lemon: 6, sugar: 3, ice: 0 }, cooled = { ...plain, ice: 2 };
    assert.equal(game.recipeTaste(plain, 32).score, 50);
    assert.equal(game.recipeTaste(cooled, 32).score, 100);
    assert.equal(game.recipeTaste(plain, 40).preferredIce, 3);
    assert.equal(game.recipeTaste({ ...plain, ice: 3 }, 40).score, 100);
    assert.equal(game.recipeTaste(plain, 18).score, 100);
    assert.equal(game.recipeTaste(plain, 18).preferredIce, 0);
    assert.ok(game.recipeTaste({ ...plain, ice: 7 }, 18).score < 100);
});
test('rain leaves very few outdoor park/beach visitors while the indoor mall benefits', () => {
    const fresh = game.newGame();
    const sunny = { ...fresh, weather: WEATHER[0] }, rainy = { ...fresh, weather: WEATHER[2] };
    for (const id of ['park', 'beach', 'magic-gardens']) {
        assert.ok(game.expectedTraffic(rainy, id) <= game.expectedTraffic(sunny, id) * .1, id);
        assert.ok(game.expectedTraffic(rainy, id) >= 1);
    }
    assert.ok(game.expectedTraffic(rainy, 'mall') > game.expectedTraffic(sunny, 'mall'));
    assert.ok(game.expectedTraffic(rainy, 'mall') > game.expectedTraffic(rainy, 'park') * 10);
});
test('news changes its named location, not unrelated pitches, and browsing is deterministic', () => {
    const day = Array.from({ length: 100 }, (_, i) => i + 1).find(d => newsForDay(d).id === 'park-fair');
    const state = { ...game.newGame(), day }, ordinary = { ...state, day: 1 };
    assert.ok(game.expectedTraffic(state, 'park') > game.expectedTraffic(ordinary, 'park'));
    assert.equal(game.expectedTraffic(state, 'downtown'), game.expectedTraffic(ordinary, 'downtown'));
    const before = JSON.stringify(state);
    for (let i = 0; i < 20; i++) game.expectedTraffic(state, 'mall');
    assert.equal(JSON.stringify(state), before);
});
test('mall cooling, daily effects and paid traffic freeze across export/import and replay', () => {
    const business = require('./helpers/stand-business.cjs').fundedStandBusiness('mall');
    const state = { ...business.state, weather: WEATHER[0] };
    const opened = game.openDay(state);
    assert.equal(game.effectiveWeather(opened).temperature, 20);
    const raw = encodeSave({ ...opened, phase: 'preparation' }, business.history);
    // Use the actual prepared opening, without forging the accounting ledger.
    assert.equal(JSON.parse(raw).version, 10);
    const restored = decodeSave(raw).state;
    assert.deepEqual(game.openDay(restored), opened);
    assert.equal(game.expectedTraffic(restored), opened.business.traffic);
    assert.deepEqual(finishStreetDay(beginStreetDay(game.openDay(restored))).day.game,
        finishStreetDay(beginStreetDay(opened)).day.game);
    assert.ok(DAILY_NEWS.some(n => n.id === restored.business.conditions.newsId));
});
test('older paid weather snapshots replay without new effects; forged conditions are rejected', () => {
    const opened = game.openDay(stock(game.newGame()));
    const legacy = { ...opened, phase: 'preparation', business: { ...opened.business } };
    delete legacy.business.conditions;
    const old = decodeSave(JSON.stringify({ version: 9, state: legacy, history: [] }));
    assert.deepEqual(old.state, legacy);
    assert.deepEqual(game.openDay(old.state), { ...legacy, phase: 'selling' });
    assert.equal(game.expectedTraffic(old.state), legacy.business.traffic);
    const current = JSON.parse(encodeSave({ ...opened, phase: 'preparation' }, []));
    current.state.business.conditions.temperature = 999;
    assert.throws(() => decodeSave(JSON.stringify(current)), /damaged/);
    const downgrade = JSON.parse(encodeSave({ ...opened, phase: 'preparation' }, [])); downgrade.version = 9;
    assert.throws(() => decodeSave(JSON.stringify(downgrade)), /damaged/);
});
