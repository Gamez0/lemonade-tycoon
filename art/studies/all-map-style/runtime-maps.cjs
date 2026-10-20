const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const compile = text => ts.transpileModule(text, { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
} }).outputText.replace(/^import .*;\r?\n/gm, '').replace(/\bexport /g, '');
exports.renderRuntimeMaps = async root => {
    const source = compile(fs.readFileSync(path.join(root, 'src/game/presentation/map-raster.ts'), 'utf8'));
    const layouts = new Function(compile(fs.readFileSync(path.join(root, 'src/game/content/map-layouts.ts'), 'utf8')) + ';return {MAP_LAYOUTS,mapPosition};')();
    const entries = Object.entries(layouts.MAP_LAYOUTS).map(([id, layout]) => ({ id,
        image: 'data:image/png;base64,' + fs.readFileSync(path.join(root, `src/game/assets/map-${id}.png`)).toString('base64'),
        ground: layout.ground, facing: layout.facing, service: layouts.mapPosition(id, 286), route: layout.route }));
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        return await page.evaluate(async ({ source, entries }) => {
            const raster = new Function(source + ';return logicalMap;')();
            const results = [];
            for (const entry of entries) {
                const image = new Image(); image.src = entry.image; await image.decode();
                results.push({ ...entry, image: raster(image).toDataURL() });
            }
            return results;
        }, { source, entries });
    } finally { await browser.close(); }
};
