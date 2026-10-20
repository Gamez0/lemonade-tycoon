// Private comparison only. No source-game pixels are checked in or shipped.
// node art/studies/remaining-images/review.cjs <legacy-parent-root> [output-dir]
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../..');
const reference = process.argv[2];
if (!reference) throw Error('Pass the private legacy parent worktree root.');
const destination = path.resolve(root, process.argv[3] || '.local-m4/remaining-images');
fs.mkdirSync(destination, { recursive: true });
const source = fs.readFileSync(path.join(root, 'src/game/presentation/icons.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(code + '\nexports.names = Object.keys(drawings);', { exports: exportsObject });
const original = {
    stand: 'equipment-canopy', refrigerator: 'equipment-refrigerator',
    iceMaker: 'equipment-ice-maker', blender: 'equipment-citrus-juicer',
    server: 'equipment-cashier', host: 'equipment-entertainer', rent: 'tab-rent',
    sunny: 'weather-sunny', cloudy: 'weather-cloudy', rainy: 'weather-rainy',
    lemon: 'supply-lemon', sugar: 'supply-sugar', ice: 'supply-ice', cup: 'supply-cup',
    results: 'tab-results', recipe: 'tab-recipe', supplies: 'tab-supplies', price: 'tab-marketing',
};
const large = new Set(['stand', 'refrigerator', 'iceMaker', 'blender', 'owner', 'server', 'host']);
const references = [];
const rows = exportsObject.names.map(name => {
    const size = large.has(name) ? 88 : name === 'happy' || name === 'unhappy' || name === 'expensive' ? 42 : 34;
    let image = '<span>No standalone matching reference; review full screen.</span>';
    if (original[name]) {
        const file = path.resolve(reference, 'public/assets/original', original[name] + '.png');
        if (!fs.existsSync(file)) throw Error('Missing private reference: ' + file);
        references.push(original[name]);
        image = `<img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}" alt="Original ${original[name]}">`;
    }
    const role = { owner: 'owner', server: 'server', host: 'host' }[name];
    const revised = role ? `<figure><figcaption>Revised native portrait · actual 100px display</figcaption><div class="box" style="width:100px;height:100px"><img src="data:image/png;base64,${fs.readFileSync(path.join(root, `src/game/assets/staff-${role}-v1.png`)).toString('base64')}" alt="Revised ${role}"></div></figure>` : '';
    return `<article><h2>${name}</h2><p>${size}px baseline display · ${original[name] || 'full-screen reference required'}</p><div class="pair"><figure><figcaption>Original · contained in equal display box</figcaption><div class="box" style="width:${size}px;height:${size}px">${image}</div></figure><figure><figcaption>Baseline SVG · same display box</figcaption><div class="box" style="width:${size}px;height:${size}px">${exportsObject.icon(name)}</div></figure>${revised}</div></article>`;
});
const html = `<!doctype html><meta charset="utf-8"><title>Remaining image inventory</title>
<style>body{font:16px/1.5 system-ui;margin:24px;background:#eee9d8;color:#243a30}article{break-inside:avoid;background:#fff9e8;border:1px solid #aab49c;padding:16px;margin:12px 0}h2{font-size:18px;margin:0}.pair{display:flex;gap:32px}figure{margin:0;width:310px}figcaption{font-size:13px;margin-bottom:8px}.box{display:flex;align-items:center;justify-content:center;background:#067725}.box img,.box svg{width:100%;height:100%;object-fit:contain}.box span{font-size:10px;background:#fff9e8}#grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(680px,1fr));gap:12px}button{font:inherit}</style>
<h1>Original references and current game glyphs</h1><p>Private research board. The original reference and current SVG have equal bounding-box dimensions; original aspect ratio is preserved. Catalogue illustrations are 88px, report faces 42px, other glyphs 34px. Actual context has additional responsive overrides; this board does not replace packaged screenshots. Similar equipment or tab imagery is a visual reference, not proof of equivalent game mechanics.</p><p>${exportsObject.names.length} current glyphs; ${references.length} standalone reference matches. Customers, full-screen reports and non-image CSS controls require their separate screen/animation review.</p><div id="grid">${rows.join('')}</div>`;
fs.writeFileSync(path.join(destination, 'original-current.html'), html);
fs.writeFileSync(path.join(destination, 'inventory.json'), JSON.stringify({ glyphs: exportsObject.names, references, privateOnly: true }, null, 2));
console.log(JSON.stringify({ glyphs: exportsObject.names.length, references: references.length, output: path.join(destination, 'original-current.html') }));
