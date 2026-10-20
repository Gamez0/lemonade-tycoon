const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
async function main() {
    const root = path.resolve(__dirname, '../../..');
    const out = path.join(root, '.local-m4/all-map-art');
    fs.mkdirSync(out, { recursive: true });
    let source = fs.readFileSync(path.join(root, 'src/game/presentation/art.ts'), 'utf8');
    source = source.replace(/ {4}const neighborhoodImages:[\s\S]*?scene.textures.addCanvas\("neighborhood", neighborhoodRaster\(neighborhoodImages\)\);/, '');
    source = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText.replace(/^import .*;\r?\n/gm, '').replace(/\bexport /g, '');
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        await page.setContent('<html><body></body></html>');
        await page.addScriptTag({ path: path.join(root, 'node_modules/phaser/dist/phaser.min.js') });
        const images = await page.evaluate(source => new Promise(resolve => {
            const render = new Function(source + ';return createArt;')();
            new Phaser.Game({ type: Phaser.CANVAS, width: 640, height: 512, audio: { noAudio: true }, banner: false,
                scene: { create() { render(this); const images = Object.fromEntries(['park', 'downtown'].map(id => [id, this.textures.get(id).getSourceImage().toDataURL()])); this.game.loop.sleep(); resolve(images); } } });
        }), source);
        for (const [name, data] of Object.entries(images)) fs.writeFileSync(path.join(out, `${name}-before.png`), Buffer.from(data.split(',')[1], 'base64'));
        console.log(out);
    } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
