const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const compile = text => ts.transpileModule(text, { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
} }).outputText.replace(/^import .*;\r?\n/gm, '').replace(/\bexport /g, '');
exports.renderStandFrames = async root => {
    const source = fs.readFileSync(path.join(root, 'src/game/presentation/stand-art.ts'), 'utf8')
        .replace(/export const STAND_ASSETS = \{[\s\S]*?\};/, '');
    const content = compile(fs.readFileSync(path.join(root, 'src/game/content/management.ts'), 'utf8'));
    const images = Object.fromEntries(['basic', 'classic', 'lemon', 'castle'].map(name =>
        [`stand-source-${name}`, 'data:image/png;base64,' + fs.readFileSync(path.join(root, `src/game/assets/stand-${name}.png`)).toString('base64')]));
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        return await page.evaluate(async ({ source, content, images }) => {
            const loaded = {};
            for (const [name, src] of Object.entries(images)) { const img = new Image(); img.src = src; await img.decode(); loaded[name] = img; }
            const canvases = {};
            const { factory, size } = new Function(source + ';return {factory:createStandArt,size:standSize};')();
            const names = new Function(content + ';return STAND_NAMES;')();
            factory({ textures: { get: name => ({ getSourceImage: () => loaded[name] }), addCanvas: (name, canvas) => { canvases[name] = canvas; } } });
            return names.map((name, level) => {
                const canvas = canvases[`stand-${level}`];
                const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
                let transparent = 0, opaque = 0;
                for (let i = 3; i < rgba.length; i += 4) { if (rgba[i] === 0) transparent++; if (rgba[i] > 200) opaque++; }
                if (!transparent || !opaque) throw Error('Stand frame lost its alpha or shape: ' + name);
                const display = size(level);
                return { name, image: canvas.toDataURL(), width: display.width * 300 / 640,
                    height: display.height * 240 / 512, nativeFacing: level === 0 ? 'left' : 'right', transparent, opaque };
            });
        }, { source: compile(source), content, images });
    } finally { await browser.close(); }
};
