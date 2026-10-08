const fs = require('node:fs');
const path = require('node:path');
const { campaign, stock } = require('../tests/helpers/business.cjs');
const { reserveLocation, hireStaff, selectAdvertising, openDay, nextDay, results, purchaseUpgrade } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const rows = [];
for (const location of ['neighborhood', 'park', 'downtown']) for (const blender of [0, 1, 2]) {
    for (const staff of ['none', 'server', 'host']) for (const advertising of ['none', 'flyers', 'radio']) {
        let profit = 0, sold = 0, abandoned = 0;
        for (const seed of [1, 2026, 87, 999]) {
            let { state } = campaign(seed, 12);
            for (let level = 0; level < blender; level++) state = purchaseUpgrade(state, "blender");
            state = reserveLocation(state, location);
            state = selectAdvertising(hireStaff(state, staff), advertising);
            for (let day = 0; day < 30; day++) {
                state = stock(state, location === 'downtown' ? 275 : 175);
                const done = finishStreetDay(beginStreetDay(openDay(state))).day.game;
                profit += results(done).profit; sold += done.daily.sold; abandoned += done.daily.abandoned;
                state = nextDay(done);
            }
        }
        rows.push({ location, blender, staff, advertising, days: 120, profit, sold, abandoned });
    }
}
const out = path.resolve('.local-m4/m6-balance.json'); fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ scope: '9720 seeded business days; forecast recipe; bounded stock targets; not human/global optimum', rows }, null, 2));
for (const id of ['neighborhood', 'park', 'downtown']) for (const blender of [0, 1, 2]) console.log(id, blender, rows.filter(row => row.location === id && row.blender === blender).sort((a, b) => b.profit - a.profit).slice(0, 2));
