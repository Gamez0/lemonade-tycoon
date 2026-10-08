// Run npm test first to compile the pure simulation. This uses test businesses only.
const { campaign, stock } = require('../tests/helpers/business.cjs');
const { openDay, reserveLocation, nextDay, setPlan, results } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { LOCATION_IDS } = require('../.test-build/content/locations.js');
const rows = [];
for (const location of LOCATION_IDS) for (const price of [125, 175, 225, 275, 325]) for (const recipe of ['forecast', 'no-ice']) {
    let profit = 0, sold = 0, abandoned = 0, fees = 0;
    for (const seed of [0, 42, 2026, 4294967295]) {
        let { state } = campaign(seed);
        for (let day = 0; day < 30; day++) {
            state = stock(state, price);
            if (recipe === 'no-ice') state = setPlan(state, { ...state.plan, recipe: { ...state.plan.recipe, ice: 0 } });
            const done = finishStreetDay(beginStreetDay(openDay(reserveLocation(state, location)))).day.game;
            profit += results(done).profit; sold += done.daily.sold; abandoned += done.daily.abandoned;
            fees += done.daily.rent + done.daily.moveFee;
            state = nextDay(done);
        }
    }
    rows.push({ location, price, recipe, days: 120, profit, sold, abandoned, fees });
}
process.stdout.write(JSON.stringify({ seeds: [0, 42, 2026, 4294967295], rows }, null, 2) + '\n');
