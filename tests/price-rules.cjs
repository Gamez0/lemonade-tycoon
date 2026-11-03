'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const game = require('../.test-build/simulation/game.js');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { withInventoryCosts } = require('../.test-build/simulation/inventory-costs.js');
const { withCompanyEconomy, equipmentValue } = require('../.test-build/simulation/equipment-costs.js');
const { LEGACY_PRICES, PRICE_RULES, pricesFor } = require('../.test-build/content/price-rules.js');
const { UPGRADES, STAFF, ADS } = require('../.test-build/content/management.js');
const { LOCATIONS } = require('../.test-build/content/locations.js');
const { ITEMS } = require('../.test-build/content/catalog.js');
const { supplyPacks } = require('../.test-build/content/supply-packs.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const fixture = require('./fixtures/alpha24-v13-economy.json');
const fresh = () => withCompanyEconomy(withInventoryCosts(game.withCustomerProfiles(game.withWeatherForecast(game.newGame(2026)))));
const finish = state => finishStreetDay(beginStreetDay(game.openDay(state))).day.game;

test('company creation records a rule, restored companies keep the implicit historical contract', () => {
    const legacy = game.newGame(), current = fresh();
    assert.equal(legacy.economy, undefined);
    assert.equal(current.economy.rule, 'legacy-v1');
    assert.equal(equipmentValue(current), 0);
    assert.strictEqual(withCompanyEconomy(current), current);
    assert.throws(() => withCompanyEconomy({...legacy,day:2}), /new company/);
    assert.throws(() => withCompanyEconomy(game.purchaseUpgrade(legacy,'refrigerator')), /new company/);
    assert.deepEqual(decodeSave(encodeSave(current,[])).state,current);
    assert.deepEqual(decodeSave(encodeSave(legacy,[])).state,legacy);
});

test('individual equipment acquisition cents survive every tier and unaffordable/max actions are atomic', () => {
    let state = {...fresh(),cash:2000000,openingCash:2000000};
    let invested = 0;
    for (const [id, prices] of Object.entries(LEGACY_PRICES.upgrades)) {
        for (const [level, quote] of prices.entries()) {
            const before = state;
            state = game.purchaseUpgrade(state,id); invested += quote;
            assert.equal(before.cash-state.cash,quote);
            assert.deepEqual(state.economy.equipment[id], prices.slice(0,level+1));
            assert.equal(equipmentValue(state),invested);
            assert.equal(state.daily.capital,invested);
            assert.deepEqual(decodeSave(encodeSave(state,[])).state,state);
        }
        assert.throws(() => game.purchaseUpgrade(state,id),/fully upgraded/);
    }
    const poor = {...fresh(),cash:899,openingCash:899}, raw = JSON.stringify(poor);
    assert.throws(() => game.purchaseUpgrade(poor,'refrigerator'),/cash/);
    assert.equal(JSON.stringify(poor),raw);
});

test('adding a counterfactual future table never changes the implicit or explicit legacy rule', () => {
    const future = structuredClone(LEGACY_PRICES);
    future.upgrades.refrigerator[0] = 9900;
    future.wages.server = 6500; future.advertising.flyers = 1750;
    future.locations.park.rent = 2000; future.bulk.ice[0].price = 500;
    const registry = {...PRICE_RULES,'future-v2':future};
    for (const owner of [game.newGame(),fresh()]) assert.strictEqual(pricesFor(owner,registry),LEGACY_PRICES);
    assert.strictEqual(pricesFor({economy:{rule:'future-v2'}},registry),future);
    assert.throws(() => pricesFor(game.newGame(),{'future-v2':future}), /Unknown/);
    assert(Object.isFrozen(LEGACY_PRICES)); assert(Object.isFrozen(LEGACY_PRICES.upgrades.refrigerator));
    assert(Object.isFrozen(LEGACY_PRICES.bulk.ice[0]));
    assert.throws(() => { LEGACY_PRICES.wages.server = 6500; }, TypeError);
});

test('actual schema13 bulk/equipment/paid snapshots replay exactly with no adoption, repricing or extra cash', () => {
    assert.equal(fixture.schema,13);
    for (const item of fixture.cases) {
        const decoded = decodeSave(JSON.stringify(item.document));
        assert.deepEqual(decoded.state,item.document.state);
        assert.deepEqual(decoded.history,item.document.history);
        assert.equal(decoded.state.economy,undefined);
        const done = finish(decoded.state);
        assert.deepEqual(done,item.expected,item.name);
        const history = [...decoded.history,done];
        assert.deepEqual(decodeSave(encodeSave(game.nextDay(done),history)).history,history);
    }
});

test('future presentation catalogue prices cannot revalue equipment or alter old-company quotes and ledgers', () => {
    const previous = {upgrade:UPGRADES.refrigerator.prices[0],wage:STAFF.server.wage,
        ad:ADS.flyers.cost,rent:LOCATIONS.park.rent,unit:ITEMS.ice.cost};
    const before = game.purchaseUpgrade(fresh(),'refrigerator');
    const raw = encodeSave(before,[]);
    try {
        UPGRADES.refrigerator.prices[0] = 9900; STAFF.server.wage = 6500;
        ADS.flyers.cost = 1750; LOCATIONS.park.rent = 2000; ITEMS.ice.cost = 50;
        assert.equal(equipmentValue(before),900);
        assert.deepEqual(decodeSave(raw).state,before);
        assert.equal(game.purchaseUpgrade(game.newGame(),'refrigerator').cash,3100);
        assert.equal(game.purchaseUpgrade(fresh(),'refrigerator').cash,3100);
        assert.equal(game.buy(game.newGame(),'ice',60).cash,3880);
        assert.equal(supplyPacks('ice',true)[0].price,100);
        const staffing = game.selectAdvertising(game.hireStaff(game.newGame(),'server'),'flyers');
        assert.equal(game.openingCosts(staffing).fees,430);
        for (const item of fixture.cases) assert.deepEqual(finish(decodeSave(JSON.stringify(item.document)).state),item.expected);
    } finally {
        UPGRADES.refrigerator.prices[0] = previous.upgrade; STAFF.server.wage = previous.wage;
        ADS.flyers.cost = previous.ad; LOCATIONS.park.rent = previous.rent; ITEMS.ice.cost = previous.unit;
    }
});

test('paid opening charges and company acquisition records remain fixed across day progression', () => {
    let state = {...fresh(),cash:10000,openingCash:10000};
    state = game.purchaseUpgrade(state,'refrigerator'); state = game.purchaseUpgrade(state,'iceMaker');
    for (const item of ['lemon','sugar','ice','cup']) state = game.buy(state,item,100);
    state = game.selectAdvertising(game.hireStaff(state,'server'),'flyers');
    const opening = game.openDay(state), checkpoint = {...opening,phase:'preparation'};
    const restored = decodeSave(encodeSave(checkpoint,[])).state;
    assert.equal(restored.daily.wages,250); assert.equal(restored.daily.advertising,180);
    assert.equal(game.openDay(restored).cash,opening.cash);
    const done = finish(restored), next = game.nextDay(done);
    assert.deepEqual(next.economy,state.economy);
    assert.deepEqual(decodeSave(encodeSave(next,[done])).history,[done]);
    const document = JSON.parse(encodeSave(next,[done]));
    for (const change of [d=>delete d.state.economy,d=>delete d.history[0].economy,
        d=>d.state.economy.rule='future-v2',d=>d.state.economy.rule=['legacy-v1'],
        d=>d.state.economy.equipment.refrigerator[0]++,d=>d.state.economy.equipment.blender.push(0),
        d=>d.state.economy.equipment.extra=[],d=>d.version=13]) {
        const invalid=structuredClone(document); change(invalid);
        assert.throws(()=>decodeSave(JSON.stringify(invalid)),/damaged|price rules|equipment/);
    }
});

test('explicit company contracts preserve the same cash, RNG and complete outcomes over120 modeled days', () => {
    const withoutEconomy = state => { const {economy,...rest}=state; return rest; };
    for (let seed=1;seed<=12;seed++) {
        let legacy = {...withInventoryCosts(game.withCustomerProfiles(game.withWeatherForecast(game.newGame(seed)))),cash:100000,openingCash:100000};
        let current = withCompanyEconomy(legacy);
        const history=[];
        for (let day=1;day<=10;day++) {
            const prepare = state => {
                if (day<=3) state=game.purchaseUpgrade(state,['refrigerator','iceMaker','blender'][day-1]);
                state=game.hireStaff(state,['none','server','host'][day%3]);
                state=game.selectAdvertising(state,['none','flyers','radio'][day%3]);
                const location=state.unlocked[(seed+day)%state.unlocked.length];
                state=game.reserveLocation(state,location);
                for (const item of ['lemon','sugar','ice','cup']) if (state.stock[item]<900) state=game.buy(state,item,900-state.stock[item]);
                return state;
            };
            legacy=prepare(legacy); current=prepare(current);
            assert.deepEqual(withoutEconomy(current),legacy);
            const before=game.openDay(legacy), after=game.openDay(current);
            assert.deepEqual(withoutEconomy(after),before);
            const expected=finish(legacy), done=finish(current);
            assert.deepEqual(withoutEconomy(done),expected);
            history.push(done);
            legacy=game.nextDay(expected); current=game.nextDay(done);
            assert.deepEqual(decodeSave(encodeSave(current,history)).state,current);
            assert.deepEqual(withoutEconomy(current),legacy);
        }
    }
});
