const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const { newGame, setPlan, buyOrder, nextDay, withWeatherForecast, withCustomerProfiles, results } = require('../.test-build/simulation/game.js');
const { encodeSave } = require('../.test-build/simulation/save.js');
const { withInventoryCosts } = require('../.test-build/simulation/inventory-costs.js');
const { WEATHER } = require('../.test-build/content/catalog.js');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (!executablePath || !fs.existsSync(executablePath)) throw Error('Set LEMONADE_DESKTOP_EXE to the actual Windows package.');
const out = path.resolve('test-results/desktop-taste'); fs.mkdirSync(out, { recursive: true });
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-taste-'));
let app;
(async () => {
    const observations = [];
    try {
        const env = { ...process.env, APPDATA: path.join(base, 'Roaming'), LOCALAPPDATA: base }; delete env.ELECTRON_RUN_AS_NODE;
        app = await electron.launch({ executablePath, env, args: profileArgs(base), timeout: 60000 });
        await verifyProfile(app, base); const page = await app.firstWindow();
        await expect(page.locator('canvas')).toBeVisible({ timeout: 30000 }); assert.ok(page.url().startsWith('file:'));
        await page.clock.install();
        const read = () => page.evaluate(async () => JSON.parse(await window.desktopSave.getItem('lemonade-tycoon.reboot.save')));
        for (const [name, weather, ice, reaction, advice] of [
            ['hot', WEATHER[0], 0, 'Too warm!', 'Not enough ice'],
            ['cold', WEATHER[2], 7, 'Too watery!', 'Too watery'],
        ]) {
            const state = buyOrder(setPlan({ ...newGame(), weather }, { price: 25, recipe: { lemon: 6, sugar: 3, ice } }),
                { lemon: 40, sugar: 20, ice: 500, cup: 40 });
            await page.locator('#save-file').setInputFiles({ name: name + '.json', mimeType: 'application/json', buffer: Buffer.from(encodeSave(state, [])) });
            await expect(page.locator('#save-status')).toContainText('Imported save'); await page.clock.runFor(500);
            await page.locator('#open').click();
            let tasted = false;
            for (let tick = 0; tick < 120; tick++) {
                await page.clock.runFor(100);
                if ((await page.locator('#feedback').textContent()).includes(reaction)) { tasted = true; break; }
            }
            assert.ok(tasted, name + ' buyer feedback was never displayed');
            await page.locator('#app').screenshot({ path: path.join(out, name + '-selling.png') });
            await page.locator('#skip').click(); await page.clock.runFor(500);
            await expect(page.locator('#report-response')).toContainText(advice);
            await expect.poll(async () => (await read())?.state.business).toBe(null);
            const saved = await read(); assert.equal(saved.version, 13);
            const report = saved.history.at(-1);
            assert.deepEqual(saved.state, withCustomerProfiles(withWeatherForecast(nextDay(report))));
            assert.equal(report.business.customerModel, 'purchase-first-v1');
            assert.ok(report.daily.sold > 0);
            await page.locator('#app').screenshot({ path: path.join(out, name + '-results.png') });
            observations.push({ name, sold: report.daily.sold, buyerSatisfaction: report.daily.satisfactionTotal / report.daily.sold,
                dailySatisfaction: results(report).satisfaction,
                feedback: await page.locator('#report-response').textContent() });
        }
        const { fundedStandBusiness } = require('./helpers/stand-business.cjs');
        const { expectedTraffic } = require('../.test-build/simulation/game.js');
        const rainyVisitors = {};
        for (const location of ['park', 'mall']) {
            const fixture = fundedStandBusiness(location);
            fixture.state = { ...fixture.state, weather: WEATHER[2] };
            const expected = expectedTraffic(fixture.state);
            await page.locator('#save-file').setInputFiles({ name: 'rain.json', mimeType: 'application/json',
                buffer: Buffer.from(encodeSave(fixture.state, fixture.history)) });
            await expect(page.locator('#save-status')).toContainText('Imported save');
            await page.locator('[data-page=rent]').click();
            const catalog = page.locator('.location-list');
            assert.equal(await catalog.evaluate(e => getComputedStyle(e).overflowX), 'clip');
            await page.locator('[data-page=recipe]').click();
            await page.locator('#open').click(); await page.clock.runFor(100);
            if (location === 'mall') await expect(page.locator('#weather')).toHaveText('20\u00b0C');
            await page.locator('#skip').click(); await page.clock.runFor(500);
            await expect.poll(async () => (await read())?.state.business).toBe(null);
            const saved = await read();
            assert.equal(saved.history.at(-1).daily.visitors, expected);
            rainyVisitors[location] = expected;
            await page.locator('#app').screenshot({ path: path.join(out, location + '-rain.png') });
            await page.reload(); await page.clock.runFor(500);
            await page.locator('#menu-continue').click();
            assert.deepEqual(await read(), saved);
            observations.push({ name: location + ' rain', visitors: expected, exactReload: true });
        }
        assert.ok(rainyVisitors.park < 8);
        assert.ok(rainyVisitors.mall > rainyVisitors.park * 10);
        const legacy = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/alpha13-customer-model.json'), 'utf8')).cases[0];
        await page.locator('#save-file').setInputFiles({ name: 'alpha13-v6.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy.document)) });
        await expect(page.locator('#save-status')).toContainText('Imported save'); await page.clock.runFor(500);
        await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
        await expect.poll(async () => (await read())?.state.business).toBe(null);
        const replay = await read();
        const expected = require('./helpers/stand-schema.cjs').withBasicStand(legacy.expected);
        assert.deepEqual(replay.history.at(-1), expected);
        assert.deepEqual(replay.state, withInventoryCosts(withCustomerProfiles(withWeatherForecast(nextDay(expected)))));
        observations.push({ name: 'actual alpha13 paid opening', exactReplay: true, importedVersion: 6, savedVersion: replay.version });
        const game = require('../.test-build/simulation/game.js');
        const { stock } = require('./helpers/business.cjs');
        const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
        const periodPrepared = withInventoryCosts(stock(withWeatherForecast(newGame(1))));
        const periodExpected = finishStreetDay(beginStreetDay(game.openDay(periodPrepared))).day.game;
        await page.locator('#save-file').setInputFiles({ name: 'periods.json', mimeType: 'application/json',
            buffer: Buffer.from(encodeSave(periodPrepared, [])) });
        await expect(page.locator('#save-status')).toContainText('Imported save');
        await page.locator('#open').click(); await page.clock.runFor(8200);
        await expect(page.locator('#weather-advice')).toContainText('Period 2 / 3');
        await expect(page.locator('#weather')).toHaveText('25°C');
        await expect(page.locator('#app')).toHaveAttribute('data-weather', 'cloudy');
        await page.locator('#app').screenshot({ path: path.join(out, 'period-2.png') });
        await page.clock.runFor(6500);
        await expect(page.locator('#weather-advice')).toContainText('Period 3 / 3');
        await expect(page.locator('#weather')).toHaveText('15°C');
        await expect(page.locator('#app')).toHaveAttribute('data-weather', 'rainy');
        await page.locator('#app').screenshot({ path: path.join(out, 'period-3.png') });
        await page.reload(); await page.clock.runFor(500);
        await page.locator('#menu-continue').click();
        await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
        await expect.poll(async () => (await read())?.state.business).toBe(null);
        assert.deepEqual((await read()).history[0], periodExpected);
        observations.push({ name: 'intraday actual weather and paid reload', periods: periodExpected.business.periods, exactReplay: true });
        for (const fixture of require('./fixtures/weather-news-v10.json').cases) {
            await page.locator('#save-file').setInputFiles({ name: 'main-v10.json', mimeType: 'application/json',
                buffer: Buffer.from(JSON.stringify(fixture.document)) });
            await expect(page.locator('#save-status')).toContainText('Imported save');
            await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
            await expect.poll(async () => (await read())?.state.business).toBe(null);
            assert.deepEqual((await read()).history[0], fixture.expected);
            observations.push({ name: `actual main v10 seed ${fixture.seed}`, exactReplay: true });
        }
        for (const fixture of require('./fixtures/intraday-weather-v11.json').cases) {
            await page.locator('#save-file').setInputFiles({ name: 'actual-v11.json', mimeType: 'application/json',
                buffer: Buffer.from(JSON.stringify(fixture.document)) });
            await expect(page.locator('#save-status')).toContainText('Imported save');
            await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
            await expect.poll(async () => (await read())?.state.business).toBe(null);
            assert.deepEqual((await read()).history[0], fixture.expected);
            assert.equal((await read()).state.customerProfileModel, 'eleven-profiles-v1');
            observations.push({ name: `actual v11 weather periods seed ${fixture.seed}`, exactReplay: true });
        }
        for (const fixture of require('./fixtures/alpha21-v12-supplies.json').cases) {
            await page.locator('#save-file').setInputFiles({ name: 'main-v12.json', mimeType: 'application/json',
                buffer: Buffer.from(JSON.stringify(fixture.document)) });
            await expect(page.locator('#save-status')).toContainText('Imported save');
            await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
            await expect.poll(async () => (await read())?.state.business).toBe(null);
            assert.deepEqual((await read()).history[0], fixture.expected);
            observations.push({ name: `actual main v12 seed ${fixture.seed}`, exactReplay: true });
        }
        const beach = fundedStandBusiness('beach');
        const profilePrepared = withInventoryCosts(stock(withCustomerProfiles(withWeatherForecast(beach.state)), 125));
        const profileExpected = finishStreetDay(beginStreetDay(game.openDay(profilePrepared))).day.game;
        const profileErrors = []; page.on('pageerror', error => profileErrors.push(error.message));
        await page.locator('#save-file').setInputFiles({ name: 'eleven-groups.json', mimeType: 'application/json',
            buffer: Buffer.from(encodeSave(profilePrepared, beach.history)) });
        await expect(page.locator('#save-status')).toContainText('Imported save');
        await page.locator('#open').click(); await page.clock.runFor(5000);
        await page.locator('#app').screenshot({ path: path.join(out, 'eleven-profile-beach.png') });
        await page.reload(); await page.clock.runFor(500); await page.locator('#menu-continue').click();
        await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
        await expect.poll(async () => (await read())?.state.business).toBe(null);
        assert.deepEqual((await read()).history.at(-1), profileExpected);
        assert.deepEqual(profileErrors, []);
        observations.push({ name: 'eleven anonymous groups, beach visuals and paid reload', exactReplay: true });
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ target: 'actual packaged Windows game', observations }, null, 2));
        console.log(`Windows buyer taste, eleven groups, weather and actual v6/v10/v11/v12 paid replay: ${observations.length} observations PASS`);
    } finally {
        await app?.close();
        if (!path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep + 'lemonade-taste-')) throw Error('Unexpected test profile path.');
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
