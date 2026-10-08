const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGame, setPlan, openDay, nextDay, reserveLocation, results, unlockLocations, isBankrupt } = require('../.test-build/simulation/game.js');
const { beginStreetDay, tickStreet, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { encodeSave, decodeSave, writeSave, readSave, SAVE_KEY } = require('../.test-build/simulation/save.js');
const { LOCATIONS, LOCATION_IDS } = require('../.test-build/content/locations.js');

const { stock, campaign } = require('./helpers/business.cjs');

test('unlock thresholds are inclusive and unlocks persist after satisfaction declines', () => {
    assert.deepEqual(unlockLocations(['neighborhood'], 2, 4500, .55), ['neighborhood']);
    assert.deepEqual(unlockLocations(['neighborhood'], 3, 4499, .55), ['neighborhood']);
    assert.deepEqual(unlockLocations(['neighborhood'], 3, 4500, .549), ['neighborhood']);
    const park = unlockLocations(['neighborhood'], 3, 4500, .55);
    assert.deepEqual(park, ['neighborhood', 'park']);
    assert.deepEqual(unlockLocations(park, 7, 12000, .65), LOCATION_IDS);
    assert.deepEqual(unlockLocations(LOCATION_IDS, 8, 12000, .1), LOCATION_IDS);
    assert.throws(() => reserveLocation(newGame(), 'park'), /locked/);
    assert.throws(() => encodeSave({ ...newGame(), unlocked: LOCATION_IDS }, []), /unlocks/);
});

test('rent and moving are atomic; paid checkpoints replay without duplicate charges', () => {
    let { state, history } = campaign();
    assert.ok(state.unlocked.includes('downtown'));
    state = stock(state);
    const reserved = reserveLocation(state, 'downtown');
    assert.equal(reserved.cash, state.cash);
    assert.equal(reserved.location, 'neighborhood');
    assert.deepEqual(reserveLocation(reserved, null), state);
    const poor = { ...reserved, cash: 799 };
    assert.throws(() => openDay(poor), /rent/);
    assert.equal(poor.cash, 799);
    assert.throws(() => openDay({ ...reserved, stock: { ...reserved.stock, cup: 0 } }), /supplies/);
    const opened = openDay(reserved);
    assert.equal(opened.cash, state.cash - 800);
    assert.equal(opened.daily.rent, 500); assert.equal(opened.daily.moveFee, 300);
    assert.equal(opened.location, 'downtown');
    assert.equal(opened.pendingLocation, null);
    const checkpoint = { ...opened, phase: 'preparation' };
    const loaded = decodeSave(encodeSave(checkpoint, history)).state;
    assert.deepEqual(openDay(loaded), opened);
    assert.throws(() => reserveLocation(loaded, 'neighborhood'), /already paid/);
    let partial = beginStreetDay(opened);
    while (partial.game.daily.sold === 0) partial = tickStreet(partial).day;
    const done = finishStreetDay(partial).day.game;
    assert.deepEqual(done, finishStreetDay(beginStreetDay(openDay(loaded))).day.game);
    assert.equal(done.cash, state.cash + done.daily.revenue - 800);
    assert.equal(results(done).profit, done.daily.revenue - done.daily.cost - 800);
    history.push(done);
    assert.deepEqual(decodeSave(encodeSave(done, history)).state, done);
    const next = nextDay(done);
    assert.equal(next.business, null); assert.equal(next.daily.rent, 0);
    assert.equal(openDay(stock(next)).daily.moveFee, 0);
    assert.equal(openDay(stock(reserveLocation(next, 'neighborhood'))).daily.rent, 0);
    assert.equal(openDay(stock(reserveLocation(next, 'neighborhood'))).daily.moveFee, 0);
});

test('snapshots keep distinct location demand and queues; only completed local ratings change', () => {
    const { state } = campaign();
    const prepared = stock(state);
    for (const id of LOCATION_IDS) {
        const opened = openDay(reserveLocation(prepared, id));
        assert.equal(opened.business.budget, LOCATIONS[id].budget);
        assert.equal(beginStreetDay(opened).rules.patienceTicks, LOCATIONS[id].patience);
        assert.equal(beginStreetDay(opened).rules.arrivalEvery, LOCATIONS[id].arrival);
        const done = finishStreetDay(beginStreetDay(opened)).day.game;
        assert.equal(done.daily.visitors, opened.business.traffic);
        assert.equal(done.business, opened.business);
        for (const other of LOCATION_IDS.filter(key => key !== id))
            assert.deepEqual(done.locationStats[other], opened.locationStats[other]);
        assert.ok(done.locationStats[id].satisfaction >= 0 && done.locationStats[id].popularity <= 1);
    }
    const noSale = setPlan(prepared, { ...prepared.plan, price: 500 });
    const done = finishStreetDay(beginStreetDay(openDay(reserveLocation(noSale, 'park')))).day.game;
    assert.equal(done.daily.sold, 0);
    assert.deepEqual(done.locationStats, prepared.locationStats);
});

test('v2 and earlier accounting migrate exactly; malformed v3 progression cannot replace saves', () => {
    const first = campaign(2026, 1).history[0];
    const old = JSON.parse(JSON.stringify(first));
    for (const key of ['location', 'pendingLocation', 'unlocked', 'locationStats', 'lifetimeRevenue', 'business']) delete old[key];
    delete old.daily.rent; delete old.daily.moveFee;
    const migrated = decodeSave(JSON.stringify({ version: 2, state: old, history: [old] }));
    assert.equal(migrated.version, 3);
    for (const key of ['cash', 'stock', 'plan', 'seed', 'reputation', 'weather']) assert.deepEqual(migrated.state[key], old[key]);
    for (const key of Object.keys(old.daily)) assert.equal(migrated.state.daily[key], old.daily[key]);
    assert.equal(migrated.state.business.traffic, old.weather.traffic);
    assert.equal(results(migrated.state).profit, old.daily.revenue - old.daily.cost);
    assert.deepEqual(decodeSave(encodeSave(migrated.state, migrated.history)), migrated);
    const { state, history } = campaign();
    const opened = openDay(reserveLocation(stock(state), 'park'));
    const checkpoint = { ...opened, phase: 'preparation' };
    const raw = encodeSave(checkpoint, history);
    for (const mutate of [
        doc => { doc.state.location = 'moon'; },
        doc => { doc.state.unlocked.push('park'); },
        doc => { doc.state.business.paid = false; },
        doc => { doc.state.business.rent = 0; },
        doc => { doc.state.business.traffic = 0; },
        doc => { doc.state.lifetimeRevenue++; },
        doc => { doc.state.locationStats.park.popularity = 2; },
        doc => { doc.state.pendingLocation = 'downtown'; },
    ]) { const doc = JSON.parse(raw); mutate(doc); assert.throws(() => decodeSave(JSON.stringify(doc))); }
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    writeSave(storage, checkpoint, history); const prior = values.get(SAVE_KEY);
    assert.throws(() => writeSave(storage, { ...checkpoint, cash: checkpoint.cash + 1 }, history));
    assert.equal(values.get(SAVE_KEY), prior);
    assert.deepEqual(readSave(storage).document.state, checkpoint);
});

test('thirty days visiting all three locations reconcile fees, saves, ice melt and replay across seeds', () => {
    for (const seed of [0, 42, 2026, 4294967295]) {
        let state = newGame(seed), revenue = 0, purchases = 0, fees = 0;
        const history = [], visited = new Set();
        for (let i = 0; i < 30; i++) {
            state = stock(state);
            const available = state.unlocked;
            state = reserveLocation(state, available[i % available.length]);
            const opened = openDay(state); visited.add(opened.location);
            const checkpoint = { ...opened, phase: 'preparation' };
            const loaded = decodeSave(encodeSave(checkpoint, history));
            const done = finishStreetDay(beginStreetDay(opened)).day.game;
            assert.deepEqual(finishStreetDay(beginStreetDay(openDay(loaded.state))).day.game, done);
            history.push(done);
            revenue += done.daily.revenue; purchases += done.daily.purchases; fees += done.daily.rent + done.daily.moveFee;
            assert.equal(done.cash, 4000 + revenue - purchases - fees);
            assert.equal(done.lifetimeRevenue, revenue);
            assert.deepEqual(decodeSave(encodeSave(done, history)).state, done);
            state = nextDay(done);
            assert.equal(state.stock.ice, 0); assert.equal(state.daily.meltedIce, done.stock.ice);
        }
        assert.equal(visited.size, 3);
    }
});

test('bankruptcy checks cheapest legal pitcher and preserves free recovery and reset choice', () => {
    const state = newGame();
    assert.equal(isBankrupt({ ...state, cash: 17 }), true);
    assert.equal(isBankrupt({ ...state, cash: 18 }), false);
    assert.equal(isBankrupt({ ...state, cash: 0, stock: { lemon: 1, sugar: 1, ice: 0, cup: 1 } }), false);
    assert.equal(reserveLocation({ ...state, cash: 0 }, 'neighborhood').cash, 0);
});
