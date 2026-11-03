// Counterfactual study of CURRENT remake rules, never an original-game observation.
// Run after npm test. Only this process's loaded catalog objects are changed.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const game = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { LOCATIONS, LOCATION_IDS } = require('../.test-build/content/locations.js');
const { STAFF } = require('../.test-build/content/management.js');
const rents = { neighborhood: 0, park: 1000, downtown: 3000, beach: 4000, 'old-square': 10000,
    'train-station': 3000, mall: 5000, marina: 5000, stadium: 15000, 'magic-gardens': 10000 };
const originalRents = Object.fromEntries(LOCATION_IDS.map(id => [id, LOCATIONS[id].rent]));
const originalWages = { server: STAFF.server.wage, host: STAFF.host.wage };
const seeds = Array.from({ length: 12 }, (_, index) => index + 1);
const files = ['src/game/simulation/game.ts', 'src/game/simulation/inventory-costs.ts',
    'src/game/simulation/street-day.ts', 'src/game/simulation/weather-periods.ts',
    ...fs.readdirSync('src/game/content').filter(name => name.endsWith('.ts')).map(name => 'src/game/content/' + name)];
const rows = [];
try {
    for (const mode of ['current', 'reference-prices-only']) {
        for (const id of LOCATION_IDS) LOCATIONS[id].rent = mode === 'current' ? originalRents[id] : rents[id];
        STAFF.server.wage = mode === 'current' ? originalWages.server : 6000;
        STAFF.host.wage = mode === 'current' ? originalWages.host : 8000;
        for (const location of LOCATION_IDS) for (const staff of ['none', 'server', 'host']) {
            let best = null;
            for (let price = 25; price <= 500; price += 25) {
                const profits = [], sold = [];
                for (const seed of seeds) {
                    let state = game.withCustomerProfiles(game.withWeatherForecast(game.newGame(seed)));
                    state = { ...state, location, unlocked: LOCATION_IDS, cash: 1000000, openingCash: 1000000 };
                    state = game.hireStaff(state, staff);
                    state = game.setPlan(state, { price, recipe: { lemon: 6, sugar: 3, ice: 2 } });
                    state = game.buy(game.buy(state, 'lemon', 999), 'sugar', 999);
                    state = game.buyPacks(state, { lemon: [0, 0, 0], sugar: [0, 0, 0], ice: [1, 2, 1], cup: [2, 0, 2] });
                    const done = finishStreetDay(beginStreetDay(game.openDay(state))).day.game;
                    if (done.daily.soldOut !== 0) throw Error('Stockout confounds price study');
                    profits.push(game.results(done).profit); sold.push(done.daily.sold);
                }
                const sum = profits.reduce((a, b) => a + b, 0);
                if (!best || sum > best.sum) best = { sum, mode, location, staff, price,
                    rent: LOCATIONS[location].rent, wage: STAFF[staff].wage,
                    meanProfit: Math.round(sum / seeds.length), minProfit: Math.min(...profits), maxProfit: Math.max(...profits),
                    meanSold: Number((sold.reduce((a, b) => a + b, 0) / seeds.length).toFixed(2)) };
            }
            const { sum, ...row } = best; rows.push(row);
        }
    }
} finally {
    for (const id of LOCATION_IDS) LOCATIONS[id].rent = originalRents[id];
    STAFF.server.wage = originalWages.server; STAFF.host.wage = originalWages.host;
}
const result = { scope: 'Current remake simulation counterfactual; not original economic parity or human playtest.',
    method: 'Day1, twelve seeds, fixed6/3/2 recipe, best mean price from25..500 cents in25-cent steps, no equipment/ads, abundant purchased stock, artificial cash/unlocks.',
    seeds, sourceHashes: Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])), rows };
const output = path.resolve(process.argv[2] || '.local-m4/economy-price-study.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
for (const row of rows.filter(row => row.mode === 'reference-prices-only')) console.log(JSON.stringify(row));
console.log('Saved counterfactual study:', output);
