// Review page only: draws no raster edits and changes no production assets.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
async function main() {
    const textures = JSON.parse(fs.readFileSync('D:/lemonade-calendar-ci/.local-m4/house-structure/study-textures.json', 'utf8'));
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
        await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
        await page.evaluate(async textures => {
            const article = document.createElement('article');
            article.innerHTML = '<h2>후보 2 + 현재 게임 스프라이트</h2><p>실제 렌더러 시안과 같은 좌표·배율입니다. 보도 정합성과 화풍 차이를 확인합니다.</p>';
            for (const scale of [1, 2]) {
                const stage = document.createElement('div');
                stage.style.cssText = `position:relative;width:${300*scale}px;height:${240*scale}px;margin:12px 0`;
                const add = (src, x, y, w, h) => {
                    const img = new Image(); img.src = src;
                    img.style.cssText = `position:absolute;left:${x*scale}px;top:${y*scale}px;width:${w*scale}px;height:${h*scale}px;margin:0;image-rendering:pixelated`;
                    stage.append(img);
                };
                add('environment-v2.png', 0, 0, 300, 240);
                add(textures.stand, 93.75, 112.5, 27, 33);
                add(textures['customer-0-0'], 127.5, 147, 13.125, 22.3125);
                add(textures['customer-1-0'], 154, 134, 13.125, 22.3125);
                article.append(stage);
            }
            document.querySelector('main').append(article);
            await Promise.all([...document.images].map(img => img.decode()));
        }, textures);
        for (const name of ['baseline-pr250.png', 'whole-scene-v1.png', 'environment-v2.png', 'environment-v3-streets.png', 'environment-v4-house-scale.png']) {
            const data = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, name)).toString('base64');
            await page.evaluate(({ name, data }) => {
                for (const img of document.images) if (img.getAttribute('src') === name) img.src = data;
            }, { name, data });
        }
        await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
        const out = path.resolve(__dirname, '../../../.local-m4/neighborhood-cohesion');
        fs.mkdirSync(out, { recursive: true });
        await page.screenshot({ path: path.join(out, 'comparison.png'), fullPage: true });
        fs.writeFileSync(path.join(out, 'comparison.html'), await page.content());
        console.log(path.join(out, 'comparison.png'));
    } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
