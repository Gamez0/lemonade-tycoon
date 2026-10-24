// Private original/baseline/revised comparison at actual ingredient glyph sizes.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..'), legacy = process.argv[2];
if (!legacy) throw Error('Pass the private legacy reference root.');
const baseline = process.argv[3] || '334f052';
const out = path.join(root, '.local-m4/ingredient-review');
fs.mkdirSync(out, { recursive: true });
function load(source) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
    return exports.icon;
}
const oldIcon = load(execFileSync('git', ['show', baseline + ':src/game/presentation/icons.ts'], { cwd: root, encoding: 'utf8' }));
const newIcon = load(fs.readFileSync(path.join(root, 'src/game/presentation/icons.ts'), 'utf8'));
const rows = ['lemon', 'sugar', 'ice', 'cup'].map(name => {
    const original = 'data:image/png;base64,' + fs.readFileSync(path.join(legacy,
        'public/assets/original/supply-' + name + '.png')).toString('base64');
    return `<article><h2>${name}</h2>${[25, 29, 34].map(size =>
        `<section><b>${size}px</b><figure>Original reference<div class="box" style="width:${size}px;height:${size}px"><img src="${original}"></div></figure><figure>Baseline ${baseline}<div class="box" style="width:${size}px;height:${size}px">${oldIcon(name)}</div></figure><figure>Revised<div class="box revised" style="width:${size}px;height:${size}px">${newIcon(name)}</div></figure></section>`).join('')}</article>`;
}).join('');
const html = `<!doctype html><meta charset="utf-8"><title>Ingredient glyph review</title><style>
body{font:16px system-ui;background:#eee9d8;color:#243a30;margin:24px}
main{display:grid;grid-template-columns:1fr 1fr;gap:20px}article{background:#fff9e8;padding:16px}
section{display:flex;gap:24px;align-items:center;margin:18px 0}figure{font-size:12px;margin:0;width:140px}
.box{background:#067725;display:grid;place-items:center;margin-top:6px}.box svg,.box img{width:100%;height:100%;object-fit:contain}
</style><h1>Original / baseline / revised ingredients</h1><p>Equal25/29/34px boxes preserve image aspect ratio. Private original pixels remain outside product assets. Stacked cups are an ingredient emblem, not a stock count; labels and numeric quantities stay authoritative. Ice is reviewed unchanged.</p><main>${rows}</main>`;
fs.writeFileSync(path.join(out, 'review.html'), html);
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1400, height: 1050 } });
        await page.setContent(html);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        const bounds = await page.locator('.revised svg g').evaluateAll(groups => groups.map(group => {
            const box = group.getBBox();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
        }));
        if (bounds.some(box => box.x < .5 || box.y < .5 || box.x + box.width > 25.5 || box.y + box.height > 25.5))
            throw Error('Glyph stroke can clip outside26px viewBox: ' + JSON.stringify(bounds));
        await page.screenshot({ path: path.join(out, 'review.png'), fullPage: true });
        fs.writeFileSync(path.join(out, 'bounds.json'), JSON.stringify({ baseline, bounds }, null, 2));
        console.log('12 revised ingredient samples decode and fit26px viewBox at25/29/34px.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
