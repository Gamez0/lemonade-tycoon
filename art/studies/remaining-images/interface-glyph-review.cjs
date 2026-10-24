// Private weather/navigation comparison. Original button strips show normal frame only.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ts = require('typescript'), { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..'), legacy = process.argv[2];
if (!legacy) throw Error('Pass the private original-reference root.');
const baseline = process.argv[3] || '1ce0651';
const out = path.join(root, '.local-m4/interface-glyph-review');
fs.mkdirSync(out, { recursive: true });
function load(source) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
    return exports.icon;
}
const oldIcon = load(execFileSync('git', ['show', baseline + ':src/game/presentation/icons.ts'], { cwd: root, encoding: 'utf8' }));
const newIcon = load(fs.readFileSync(path.join(root, 'src/game/presentation/icons.ts'), 'utf8'));
const tabs = JSON.parse(fs.readFileSync(path.join(legacy, 'src/data/original-preparation-tabs.json'), 'utf8'));
const image = file => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
const staff = image(path.join(root, 'src/game/assets/staff-server-v1.png'));
const names = ['sunny', 'cloudy', 'rainy', 'results', 'rent', 'upgrades', 'staff', 'marketing', 'recipe', 'supplies'];
const rows = names.map(name => {
    const weather = ['sunny', 'cloudy', 'rainy'].includes(name);
    const tab = tabs.find(tab => tab.name === name);
    const original = image(path.join(legacy, 'public/assets/original', (weather ? 'weather-' + name : tab.asset) + '.png'));
    const reference = weather ? `<div class="box" style="width:32px;height:32px"><img src="${original}"></div>` :
        `<div class="tab" style="width:${tab.rectangle.width}px;height:${tab.rectangle.height}px"><img src="${original}" style="width:${tab.rectangle.width}px"></div>`;
    const previous = { upgrades: 'supplies', staff: 'happy', marketing: 'price' }[name] || name;
    const revised = name === 'staff' ? `<img src="${staff}">` : newIcon(name);
    return `<article><h2>${name}</h2><section><figure>Original ${weather ? '32px box' : 'normal button frame, native size'}${reference}</figure><figure>Baseline ${baseline}${(weather ? [32] : [43, 32]).map(size => `<div class="box" style="width:${size}px;height:${size}px">${oldIcon(previous)}</div>`).join('')}</figure><figure>Revised ${weather ? '32px' : '43px /32px'}${(weather ? [32] : [43, 32]).map(size => `<div class="box revised" style="width:${size}px;height:${size}px">${revised}</div>`).join('')}</figure></section></article>`;
}).join('');
const html = `<!doctype html><meta charset="utf-8"><title>Interface glyph review</title><style>
body{font:16px system-ui;background:#eee9d8;color:#243a30;margin:24px}main{display:grid;grid-template-columns:1fr 1fr;gap:20px}
article{background:#fff9e8;padding:16px}section{display:flex;gap:24px}figure{font-size:12px;margin:0;width:150px}
.box{display:grid;place-items:center;background:#067725;margin-top:10px}.box svg,.box img{width:100%;height:100%;object-fit:contain}
.tab{overflow:hidden;margin-top:10px}.tab img{max-width:none;display:block}h2{margin:0 0 12px}
</style><h1>Weather and navigation glyphs - private comparison</h1><p>Weather uses equal32px boxes. Original tabs are normal50px-high button frames from the retained strip metadata, including their labels; revised icons are43px/32px as actually styled. Staff reuses the unchanged detailed portrait. Original pixels remain private. Results is reviewed unchanged.</p><main>${rows}</main>`;
fs.writeFileSync(path.join(out, 'review.html'), html);
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
        await page.setContent(html);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
        const bounds = await page.locator('.revised svg g').evaluateAll(groups => groups.map(group => {
            const b = group.getBBox(); return { x: b.x, y: b.y, width: b.width, height: b.height };
        }));
        if (errors.length || bounds.some(b => b.x < .5 || b.y < .5 || b.x + b.width > 25.5 || b.y + b.height > 25.5))
            throw Error(JSON.stringify({ errors, bounds }));
        await page.screenshot({ path: path.join(out, 'review.png'), fullPage: true });
        fs.writeFileSync(path.join(out, 'bounds.json'), JSON.stringify({ baseline, bounds, errors }, null, 2));
        console.log('Ten interface roles rendered at actual icon sizes with stroke-safe bounds.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
