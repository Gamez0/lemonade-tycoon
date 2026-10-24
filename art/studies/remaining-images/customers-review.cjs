// Private research board: source atlas pixels never enter product assets.
// Uses the unchanged current customer drawing function to render its baseline.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
const legacy = process.argv[2];
if (!legacy) throw Error('Pass the private legacy parent worktree root.');
const out = path.resolve(root, process.argv[3] || '.local-m4/customer-art');
fs.mkdirSync(out, { recursive: true });
const frames = JSON.parse(fs.readFileSync(path.resolve(legacy, 'public/assets/original/customers.json'), 'utf8')).frames;
if (Object.keys(frames).length !== 980) throw Error('Expected the retained49×4×5 atlas; inspect metadata before changing assumptions.');
const atlas = 'data:image/png;base64,' + fs.readFileSync(path.resolve(legacy, 'public/assets/original/customers.png')).toString('base64');
const artSource = fs.readFileSync(path.join(root, 'src/game/presentation/art.ts'), 'utf8');
const art = ts.transpileModule(artSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const phaser = fs.readFileSync(path.join(root, 'node_modules/phaser/dist/phaser.min.js'), 'utf8');
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
        await page.setContent('<!doctype html><div id="game"></div>');
        await page.addScriptTag({ content: phaser });
        const current = await page.evaluate(code => new Promise((resolve, reject) => {
            try {
                const exports = {};
                const require = id => id === 'phaser' ? { default: Phaser } : { createMapArt() {} };
                new Function('exports', 'require', code)(exports, require);
                const game = new Phaser.Game({ type: Phaser.CANVAS, width: 300, height: 240,
                    parent: 'game', audio: { noAudio: true }, banner: false,
                    scene: { create() {
                        try {
                            exports.createArt(this);
                            const result = [];
                            for (let profile = 0; profile < 3; profile++) for (let pose = 0; pose < 4; pose++) {
                                const source = this.textures.get(`customer-${profile}-${pose}`).getSourceImage();
                                const c = document.createElement('canvas'); c.width = source.width; c.height = source.height;
                                c.getContext('2d').drawImage(source, 0, 0);
                                result.push({ profile, pose, width: c.width, height: c.height, png: c.toDataURL() });
                            }
                            resolve(result); setTimeout(() => game.destroy(true), 0);
                        } catch (error) { reject(String(error)); }
                    } } });
            } catch (error) { reject(String(error)); }
        }), art);
        if (current.length !== 12 || current.some(frame => frame.width !== 20 || frame.height !== 34)) throw Error('Unexpected current baseline.');
        const directions = ['group0: inferred SE', 'group1: inferred NE', 'group2: inferred NW', 'group3: inferred SW'];
        const rows = Array.from({ length: 49 }, (_, character) => `<article><h2>Atlas character ${character}</h2>${directions.map((direction, group) => `<div class="direction"><label>${direction}</label>${Array.from({ length: 5 }, (_, pose) => {
            const index = character * 20 + group * 5 + pose;
            const frame = frames[String(index)];
            if (frame.rotated) throw Error('Rotated reference frame needs explicit handling.');
            const r = frame.frame, s = frame.spriteSourceSize;
            return `<span class="cell" title="frame${index}; source22×34"><span style="position:absolute;left:${s.x}px;top:${s.y}px;width:${r.w}px;height:${r.h}px;background-position:-${r.x}px -${r.y}px"></span></span>`;
        }).join('')}</div>`).join('')}</article>`);
        // The atlas data URL is shared in CSS instead of duplicated980 times.
        
        const cards = rows.join('');
        const baseline = current.map(frame => `<figure><figcaption>Profile${frame.profile} · pose${frame.pose}${frame.pose === 2 ? ' · rear, currently unused' : ''}</figcaption><img width="13.125" height="22.3125" src="${frame.png}"></figure>`).join('');
        const html = `<!doctype html><meta charset="utf-8"><title>Customer silhouettes and direction evidence</title><style>body{font:15px/1.5 system-ui;background:#eee9d8;color:#243a30;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:12px}article{padding:12px;background:#faf5dc;border:1px solid #9fac93}h2{font-size:16px;margin:0}.direction{display:flex;gap:12px;align-items:center;min-height:54px}label{width:180px}.cell{position:relative;display:inline-block;width:22px;height:34px;background:#a2b797}.cell>span{background-image:url('${atlas}')}#baseline{display:flex;flex-wrap:wrap;gap:18px}figure{margin:0;padding:12px;background:#a2b797}img{image-rendering:auto}#atlas.scaled .direction{min-height:88px}#atlas.scaled .cell{transform:scale(2);transform-origin:bottom center;margin-inline:12px}</style><h1>Customer art baseline and retained original directions</h1><p>Private reference board. Original atlas:49 visual characters ×4 direction groups ×5 frames =980. These are visual families, not proof of49 or11 simulation profiles. Direction labels are the preserved legacy renderer's interpretation, not newly recovered original motion rules.</p><p>Current code:3 profiles ×4 poses =12 textures,20×34 displayed1.4× in the640×512 world. Both families below are normalized to a300px-wide map: current source cells display13.125×22.3125px, original source cells22×34px. Pose2 is drawn but not selected by the current scene. Baseline below uses the unchanged production drawing function with map creation stubbed out; it is not a mock illustration.</p><h2>Current three-profile baseline · normalized to300px map width</h2><section id="baseline">${baseline}</section><h2>Retained original frames ·22×34 source cells</h2><button onclick="document.getElementById('atlas').classList.toggle('scaled')">Original normalized size /2× inspection</button><main id="atlas">${cards}</main>`;
        fs.writeFileSync(path.join(out, 'original-current-customers.html'), html);
        fs.writeFileSync(path.join(out, 'baseline.json'), JSON.stringify({ original: { characters: 49, directions: 4, framesPerDirection: 5, frames: 980 }, current: current.map(({ png, ...frame }) => frame) }, null, 2));
        await page.setContent(html);
        await page.screenshot({ path: path.join(out, 'customer-baseline.png') });
        console.log('Customer baseline:980 private original frames and12 actual code-drawn textures; board saved to ' + out);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
