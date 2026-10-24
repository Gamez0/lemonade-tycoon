// Exercise the actual production drawPeople and createArt methods in Phaser.
// This deterministic scene review is separate from full-game/native acceptance.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.LEMONADE_CUSTOMER_EVIDENCE_ROOT || path.join(root, '.local-m4/native-customer-motion'));
fs.mkdirSync(out, { recursive: true });
function privateComparison(textures, metrics, visuals) {
    const legacy = process.argv[2];
    if (!legacy) return null;
    const original = JSON.parse(fs.readFileSync(path.join(legacy, 'public/assets/original/customers.json'), 'utf8')).frames;
    if (Object.keys(original).length !== 980) throw Error('Expected980 retained original frames');
    const atlas = 'data:image/png;base64,' + fs.readFileSync(path.join(legacy, 'public/assets/original/customers.png')).toString('base64');
    const baseline = process.argv[3] ? [...fs.readFileSync(process.argv[3], 'utf8').matchAll(
        /<figure><figcaption>Profile(\d)[^<]*pose(\d)[^<]*<\/figcaption><img[^>]*src="(data:image\/png;base64,[A-Za-z0-9+/=]+)"/g,
    )].map(match => ({ profile: match[1], pose: match[2], png: match[3] })) : [];
    if (process.argv[3] && (baseline.length !== 12 || new Set(baseline.map(f => f.profile + '-' + f.pose)).size !== 12))
        throw Error('Expected the supplied twelve-texture47e4376 baseline board');
    const scale = metrics.scale * 300 / 640;
    const views = [['front', false, 'SE'], ['rear', false, 'NE'], ['rear', true, 'NW'], ['front', true, 'SW']];
    const revised = visuals.map((visual, profile) => `<article><h2>Current adapted role ${profile}</h2>${views.map(([group, flip, direction]) =>
        `<section><b>${direction}</b>${textures.filter(f => f.key.startsWith(`customer-${visual}-${group}-`)).map(f =>
            `<figure><figcaption>${f.key.split('-').slice(3).join('-')}</figcaption><img style="width:${metrics.width * scale}px;height:${metrics.height * scale}px;transform:scaleX(${flip ? -1 : 1})" src="${f.png}"></figure>`).join('')}</section>`).join('')}</article>`).join('');
    const old = baseline.map(f => `<figure><figcaption>Role${f.profile}/pose${f.pose}</figcaption><img style="width:13.125px;height:22.3125px" src="${f.png}"></figure>`).join('');
    const families = Array.from({ length: 49 }, (_, family) => `<article><h3>Original visual family${family}</h3>${['SE', 'NE', 'NW', 'SW'].map((direction, group) =>
        `<section><b>${direction}*</b>${Array.from({ length: 5 }, (_, pose) => {
            const frame = original[String(family * 20 + group * 5 + pose)];
            if (frame.rotated) throw Error('Rotated source frame requires explicit restoration');
            const r = frame.frame, trim = frame.spriteSourceSize;
            return `<span class="cell"><span class="trim" style="left:${trim.x}px;top:${trim.y}px;width:${r.w}px;height:${r.h}px;background-position:-${r.x}px -${r.y}px"></span></span>`;
        }).join('')}</section>`).join('')}</article>`).join('');
    const heights = textures.map(f => f.bounds[3] * scale);
    const html = `<!doctype html><meta charset="utf-8"><title>PRIVATE original/baseline/native customer comparison</title><style>
body{font:14px system-ui;background:#eee9d8;color:#243a30;margin:24px}article{background:#fff9e8;padding:12px;margin:12px 0}
section{display:flex;gap:14px;align-items:end;margin:12px 0}section>b{width:40px;align-self:center}
figure{width:75px;height:58px;margin:0;background:#a2b797;padding:4px;display:flex;flex-direction:column;align-items:center;justify-content:end}
figcaption{font-size:10px;margin-bottom:4px}.old{display:flex;gap:8px;flex-wrap:wrap}.original{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cell{position:relative;display:block;width:22px;height:34px;overflow:hidden;background:#a2b797}.trim{position:absolute;background-image:url('${atlas}')}
</style><h1>PRIVATE customer reference / baseline / native frames</h1>
<p>All sprites normalized to the same300px map width. Current opaque alpha128 body heights ${Math.min(...heights).toFixed(2)}..${Math.max(...heights).toFixed(2)}px. Original trimmed rectangle heights19..27px (median24); full cells22x34. Padding/trim offsets are preserved, with no per-frame rescale. Fixed current ground anchors are measured separately in the actual renderer.</p>
<p>Three current adapted roles and66 native sources, mirrored into four views; not eleven recovered behavior profiles. Original49 visual families must not be assigned to those profiles. *Original directions follow the retained legacy interpretation, not a newly measured engine binding. This file contains private original pixels and must stay outside published/package assets.</p>
<h2>Earlier47e4376 body baseline (supplied snapshot)</h2><div class="old">${old || 'No baseline board supplied.'}</div>
<h2>Current actual production-frame output at equal map width</h2>${revised}
<h2>All980 retained original frames - private</h2><div class="original">${families}</div>`;
    fs.writeFileSync(path.join(out, 'private-original-baseline-revised.html'), html);
    return { html, atlas };
}
const sources = Object.fromEntries([
    'content/map-layouts', 'content/customer-facing', 'presentation/art', 'presentation/customer-art', 'presentation/street-scene',
].map(name => [name, ts.transpileModule(fs.readFileSync(path.join(root, 'src/game', name + '.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText]));
const maps = Object.fromEntries(fs.readdirSync(path.join(root, 'src/game/assets'))
    .filter(name => /^map-.*\.png$/.test(name))
    .map(name => [name.slice(4, -4), 'data:image/png;base64,' +
        fs.readFileSync(path.join(root, 'src/game/assets', name)).toString('base64')]));

(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 1024 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setContent('<!doctype html><style>body{margin:0}</style><div id="game"></div>');
        await page.addScriptTag({ path: path.join(root, 'node_modules/phaser/dist/phaser.js') });
        const review = await page.evaluate(async ({ sources, maps }) => {
            const cache = {};
            function load(name) {
                if (cache[name]) return cache[name];
                const exports = cache[name] = {};
                const require = id => {
                    if (id === 'phaser') return { default: Phaser };
                    if (id.endsWith('map-layouts')) return load('content/map-layouts');
                    if (id.endsWith('customer-facing')) return load('content/customer-facing');
                    if (id === './art') return load('presentation/art');
                    if (id === './customer-art') return load('presentation/customer-art');
                    return { createMapArt() {}, tasteReaction() { return 'ok'; } };
                };
                new Function('exports', 'require', sources[name])(exports, require);
                return exports;
            }
            const { MAP_LAYOUTS } = load('content/map-layouts');
            const { StreetScene } = load('presentation/street-scene');
            let location = 'neighborhood';
            const scene = new StreetScene({ state: () => ({ location }) });
            scene.preload = function () {
                for (const [id, url] of Object.entries(maps)) this.load.image(id, url);
            };
            const ready = new Promise(resolve => {
                scene.create = function () { load('presentation/art').createArt(this); resolve(); };
            });
            // Disable production update: controlled fixtures invoke the real renderer below.
            scene.update = function () {};
            const game = new Phaser.Game({ type: Phaser.CANVAS, width: 1280, height: 1024,
                parent: 'game', banner: false, audio: { noAudio: true }, scene: [scene] });
            await ready;
            load('presentation/customer-art').createCustomerArt(scene);
            const textureSamples = scene.textures.getTextureKeys().filter(key => key.startsWith('customer-')).map(key => {
                const image = scene.textures.get(key).getSourceImage();
                const context = image.getContext('2d'), pixels = context.getImageData(0, 0, image.width, image.height).data;
                if (image.width !== 128 || image.height !== 192) throw Error('Non-native customer texture: ' + key);
                for (const [x, y] of [[0, 0], [127, 0], [0, 191], [127, 191]])
                    if (pixels[(y * image.width + x) * 4 + 3] !== 0) throw Error('Opaque frame corner: ' + key);
                for (let x = 0; x < 128; x++)
                    if (pixels[x * 4 + 3] || pixels[(191 * 128 + x) * 4 + 3]) throw Error('Clipped frame edge: ' + key);
                for (let y = 0; y < 192; y++)
                    if (pixels[(y * 128) * 4 + 3] || pixels[(y * 128 + 127) * 4 + 3]) throw Error('Clipped frame edge: ' + key);
                let left = 128, top = 192, right = 0, bottom = 0;
                for (let y = 0; y < 192; y++) for (let x = 0; x < 128; x++) {
                    if (pixels[(y * 128 + x) * 4 + 3] < 128) continue;
                    left = Math.min(left, x); right = Math.max(right, x);
                    top = Math.min(top, y); bottom = Math.max(bottom, y);
                }
                if (right <= left || bottom <= top) throw Error('Empty frame: ' + key);
                return { key, bounds: [left, top, right - left + 1, bottom - top + 1], png: image.toDataURL() };
            });
            if (textureSamples.length !== 66) throw Error('Expected bounded66-frame native customer pool');
            for (const visual of load('presentation/customer-art').CUSTOMER_VISUAL_FOR_PROFILE) for (const group of ['front', 'rear']) for (const action of ['walk', 'cup']) {
                const a = textureSamples.find(f => f.key === `customer-${visual}-${group}-${action}-0`);
                const b = textureSamples.find(f => f.key === `customer-${visual}-${group}-${action}-2`);
                if (a.png === b.png) throw Error('Repeated walk contacts: ' + a.key);
            }
            scene.cameras.main.setZoom(2).centerOn(320, 256);
            const records = [];
            const visitor = id => ({ id, profile: id % 3 });
            for (const id of Object.keys(MAP_LAYOUTS)) {
                location = id;
                scene.resetDay();
                scene.children.removeAll(true);
                scene.add.image(0, 0, id).setOrigin(0).setDisplaySize(640, 512);
                const ground = MAP_LAYOUTS[id].ground;
                scene.add.circle(ground[0] * 640 / 300, ground[1] * 512 / 240, 5, 0xffff00);
                const day = { tick: 4, serving: { visitor: visitor(1) },
                    waiting: [{ visitor: visitor(2), joinedAt: 0 }, { visitor: visitor(3), joinedAt: 3 }],
                    walking: ['passed', 'price', 'bought', 'sold-out', 'abandoned'].map((kind, index) =>
                        ({ visitor: visitor(index + 10), kind, startedAt: index, until: index + 10 })) };
                scene.motion = { matches: false };
                const modelSnapshot = JSON.stringify(day);
                scene.drawPeople(day, .5);
                if (JSON.stringify(day) !== modelSnapshot) throw Error('Renderer advanced model state');
                scene.drawPeople(day);
                const pausedPeople = JSON.stringify([...scene.people].map(([key, sprite]) => [key, sprite.x, sprite.y, sprite.texture.key]));
                scene.elapsed = 25;
                scene.hooks.paused = () => true;
                StreetScene.prototype.update.call(scene, 0, 100);
                if (scene.elapsed !== 25 || JSON.stringify([...scene.people].map(([key, sprite]) =>
                    [key, sprite.x, sprite.y, sprite.texture.key])) !== pausedPeople)
                    throw Error(id + ': paused renderer moved or advanced its clock');
                scene.hooks.paused = () => false;
                game.loop.wake();
                const people = [...scene.people].map(([key, sprite]) => ({
                    id: key, texture: sprite.texture.key, flip: sprite.flipX, depth: sprite.depth,
                    x: sprite.x, y: sprite.y, facing: scene.facings.get(key),
                }));
                if (!people.find(person => person.id === 1).texture.endsWith('-rear-order-0'))
                    throw Error(id + ': serving customer must show back towards stand');
                for (const person of people) {
                    if (person.depth !== person.y && Math.abs(person.depth - person.y) > .51)
                        throw Error(id + ': foot depth drift');
                    if (person.flip !== person.facing.endsWith('w')) throw Error(id + ': mirror mismatch');
                }
                // Reduced motion must retain a rear cup pose and the route-facing.
                scene.motion = { matches: true };
                scene.drawPeople(day);
                const bought = scene.people.get(12);
                if (!/-cup-4$/.test(bought.texture.key)) throw Error(id + ': reduced-motion cup missing');
                scene.motion = { matches: false };
                scene.drawPeople(day);
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                records.push({ id, people, png: game.canvas.toDataURL() });
                scene.drawPeople({ tick: 20, waiting: [], walking: [] });
                if (scene.people.size || scene.facings.size || scene.bubbles.size)
                    throw Error(id + ': departed customer retained ' + JSON.stringify([scene.people.size, scene.facings.size, scene.bubbles.size]));
            }
            if (scene.textures.getTextureKeys().filter(key => key.startsWith('customer-')).length !== 66)
                throw Error('Customer pool changed across redraws/maps');
            game.destroy(true);
            return { maps: records, textures: textureSamples, metrics: load('presentation/customer-art').CUSTOMER_METRICS, visuals: load('presentation/customer-art').CUSTOMER_VISUAL_FOR_PROFILE };
        }, { sources, maps });
        const result = review.maps;
        if (result.length !== 10 || errors.length) throw Error(JSON.stringify(errors));
        for (const record of result) {
            fs.writeFileSync(path.join(out, record.id + '.png'), Buffer.from(record.png.split(',')[1], 'base64'));
            delete record.png;
        }
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(result, null, 2));
        const figures = review.textures.map(f => `<figure><figcaption>${f.key}</figcaption><img width="128" height="192" src="${f.png}"></figure>`).join('');
        fs.writeFileSync(path.join(out, 'customer-textures.html'), `<!doctype html><meta charset="utf-8"><title>Actual native customer textures</title><style>body{font:14px system-ui;background:#eee9d8;color:#243a30}main{display:flex;flex-wrap:wrap;gap:10px}figure{margin:0;background:#a2b797;width:180px;padding:8px}figcaption{font-size:11px}img{display:block}</style><h1>Actual128x192 code-native frames - source inspection</h1><p>Three roles, front/rear sources mirrored into four route directions. Fixed ground anchors, four walk phases, idle, empty-hand ordering, walking cup and reduced-motion cup.</p><main>${figures}</main>`);
        fs.writeFileSync(path.join(out, 'texture-bounds.json'), JSON.stringify({ metrics: review.metrics,
            textures: review.textures.map(({ key, bounds }) => ({ key, bounds })) }, null, 2));
        fs.writeFileSync(path.join(out, 'evidence.json'), JSON.stringify({
            commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
            dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()),
            scope: 'Actual production drawing methods in controlled Phaser scenes; not full-game/package footage.',
            maps: result.length, actors: result.reduce((sum, map) => sum + map.people.length, 0), textures: review.textures.length,
        }, null, 2));
        const comparison = privateComparison(review.textures, review.metrics, review.visuals);
        if (comparison) {
            await page.setContent(comparison.html);
            await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
            await page.evaluate(async atlas => { const image = new Image(); image.src = atlas; await image.decode(); }, comparison.atlas);
            await page.screenshot({ path: path.join(out, 'private-comparison.png') });
        }
        console.log(JSON.stringify({ maps: result.length, people: result.reduce((sum, map) => sum + map.people.length, 0),
            errors, output: out }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
