const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve('android-web-dist');
const prefix = '/android-smoke/';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav' };
(async () => {
    await fs.access(path.join(root,'index.html'));
    const server = http.createServer(async (req,res) => {
        try {
            const url = new URL(req.url,'http://localhost');
            if (!url.pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
            const file = path.resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html');
            if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
            const data = await fs.readFile(file);
            res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'}).end(data);
        } catch { res.writeHead(404).end(); }
    });
    let browser;
    try {
        await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
        browser = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
        const page = await browser.newPage({ viewport:{width:375,height:812}, isMobile:true, hasTouch:true, deviceScaleFactor:2 });
        const failures = [];
        page.on('pageerror', error => failures.push(error.message));
        page.on('console', msg => { if (msg.type()==='error') failures.push(msg.text()); });
        page.on('requestfailed', req => failures.push(req.url() + ': ' + req.failure()?.errorText));
        page.on('response', res => { if (res.status() >= 400) failures.push(res.status() + ' ' + res.url()); });
        const url = 'http://127.0.0.1:' + server.address().port + prefix;
        const external = [];
        await page.route('**/*', async route => {
            const target = new URL(route.request().url());
            if (['http:', 'https:'].includes(target.protocol) && target.origin !== new URL(url).origin) {
                external.push(target.href);
                await route.abort('internetdisconnected');
            } else await route.continue();
        });
        await page.goto(url);
        const enter = () => page.locator('#menu-continue:enabled, #menu-inspect:not([hidden]):enabled').first().tap({timeout:30000});
        await enter();
        await page.locator('canvas').waitFor({state:'visible',timeout:30000});
        await page.locator('#cash').waitFor({state:'visible',timeout:30000});
        const initialCash = await page.locator('#cash').textContent();
        const key = 'lemonade-tycoon.reboot.save';
        await page.waitForFunction(k => !!localStorage.getItem(k),key);
        const initialSave = await page.evaluate(k => localStorage.getItem(k),key);
        await page.locator('[data-page="supplies"]').tap();
        await page.locator('[data-supply="lemon"]').tap();
        await page.locator('[data-bundle="0"][data-delta="1"]').tap();
        await page.locator('#buy-order').tap();
        await page.waitForFunction(({k,old}) => localStorage.getItem(k) !== old && !!localStorage.getItem(k),{k:key,old:initialSave});
        const saved = await page.evaluate(k => localStorage.getItem(k),key);
        const cash = await page.locator('#cash').textContent();
        assert.notEqual(cash,initialCash,'purchase must change cash');
        await page.reload();
        await enter();
        await page.locator('#cash').waitFor({state:'visible',timeout:30000});
        assert.equal(await page.evaluate(k => localStorage.getItem(k),key),saved,'save must survive reload');
        assert.equal(await page.locator('#cash').textContent(),cash,'cash must survive reload');
        await page.screenshot({path:'android-smoke.png',fullPage:true});
        assert.deepEqual(external,[], 'payload must not depend on external HTTP(S) requests');
        assert.deepEqual(failures,[]);
        console.log('Android web payload smoke passed: nested path, mobile touch, local-only network, purchase/save/reload, no observed errors');
    } finally {
        await browser?.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error); process.exitCode=1; });
