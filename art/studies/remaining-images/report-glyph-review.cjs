// Private reference comparison; original pixels stay outside shipping assets.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ts = require('typescript'), { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..'), legacy = process.argv[2];
if (!legacy) throw Error('Pass the private reference root.');
const out = path.join(root, '.local-m4/report-glyphs'); fs.mkdirSync(out, { recursive: true });
function load(source) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
    return exports.icon;
}
const oldIcon = load(execFileSync('git', ['show', 'f81cc5d:src/game/presentation/icons.ts'], { cwd: root, encoding: 'utf8' }));
const icon = load(fs.readFileSync(path.join(root, 'src/game/presentation/icons.ts'), 'utf8'));
const roles = [['calendar', 'calendar'], ['graph', 'results'], ['balance', 'supplies'], ['quiet', 'expensive'],
    ['happy', 'happy'], ['unhappy', 'unhappy'], ['expensive', 'expensive'], ['passing', 'passing'], ['empty', 'empty'], ['clock', 'clock']];
const rows = roles.map(([name, before]) => `<article><h2>${name}</h2><section><figure>Baseline ${before}${oldIcon(before)}</figure><figure>Revised${icon(name)}</figure></section></article>`).join('');
const references = ['happy', 'unhappy', 'price', 'queue'].map(name => `<figure>${name}<img src="data:image/png;base64,${fs.readFileSync(path.join(legacy, 'public/assets/original/reaction-' + name + '.png')).toString('base64')}"></figure>`).join('');
const html = `<!doctype html><meta charset="utf-8"><title>Report glyph review</title><style>
body{font:16px system-ui;background:#eee9d8;color:#243a30;margin:24px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}article{background:#fff9e8;padding:14px}section{display:flex;gap:24px}figure{margin:0;font-size:12px}svg{display:block;width:32px;height:32px;margin-top:10px}article:nth-child(4) svg{width:42px;height:42px}aside{display:flex;gap:24px;margin-bottom:24px}img{display:block;margin-top:10px}h2{font-size:18px}</style>
<h1>Report and reaction roles</h1><p>Report tabs32px, no-sales commentary42px. New graph and balance are independently drawn role symbols, not copies of missing original tab images. Neutral no-sales face does not assert a price cause. Existing outcome/reaction meanings and map feedback remain unchanged.</p><aside>${references}</aside><main>${rows}</main>`;
fs.writeFileSync(path.join(out, 'review.html'), html);
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setContent(html);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
        const bounds = await page.locator('article figure:last-child svg g').evaluateAll(groups => groups.map(group => {
            const b = group.getBBox(); return { x: b.x, y: b.y, width: b.width, height: b.height };
        }));
        if (errors.length || bounds.some(b => b.x < .5 || b.y < .5 || b.x + b.width > 25.5 || b.y + b.height > 25.5))
            throw Error(JSON.stringify({ errors, bounds }));
        await page.screenshot({ path: path.join(out, 'review.png'), fullPage: true });
        fs.writeFileSync(path.join(out, 'bounds.json'), JSON.stringify({ bounds, errors }, null, 2));
        console.log('Ten report/reaction roles reviewed with stroke-safe bounds.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
