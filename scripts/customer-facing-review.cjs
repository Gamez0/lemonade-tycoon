// Exercise the actual production drawPeople and createArt methods in Phaser.
// This deterministic scene review is separate from full-game/native acceptance.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.local-m4/customer-facing');
fs.mkdirSync(out, { recursive: true });
const sources = Object.fromEntries([
    'content/map-layouts', 'content/customer-facing', 'presentation/art', 'presentation/street-scene',
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
        const result = await page.evaluate(async ({ sources, maps }) => {
            const cache = {};
            function load(name) {
                if (cache[name]) return cache[name];
                const exports = cache[name] = {};
                const require = id => {
                    if (id === 'phaser') return { default: Phaser };
                    if (id.endsWith('map-layouts')) return load('content/map-layouts');
                    if (id.endsWith('customer-facing')) return load('content/customer-facing');
                    if (id === './art') return load('presentation/art');
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
                        ({ visitor: visitor(index + 10), kind, startedAt: 0, until: 10 })) };
                scene.motion = { matches: false };
                scene.drawPeople(day);
                const people = [...scene.people].map(([key, sprite]) => ({
                    id: key, texture: sprite.texture.key, flip: sprite.flipX, depth: sprite.depth,
                    x: sprite.x, y: sprite.y, facing: scene.facings.get(key),
                }));
                if (!people.find(person => person.id === 1).texture.endsWith('-2'))
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
                if (!/-(3|5)$/.test(bought.texture.key)) throw Error(id + ': reduced-motion cup missing');
                scene.motion = { matches: false };
                scene.drawPeople(day);
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                records.push({ id, people, png: game.canvas.toDataURL() });
                scene.drawPeople({ tick: 20, waiting: [], walking: [] });
                if (scene.people.size || scene.facings.size || scene.bubbles.size)
                    throw Error(id + ': departed customer retained ' + JSON.stringify([scene.people.size, scene.facings.size, scene.bubbles.size]));
            }
            game.destroy(true);
            return records;
        }, { sources, maps });
        if (result.length !== 10 || errors.length) throw Error(JSON.stringify(errors));
        for (const record of result) {
            fs.writeFileSync(path.join(out, record.id + '.png'), Buffer.from(record.png.split(',')[1], 'base64'));
            delete record.png;
        }
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(result, null, 2));
        console.log(JSON.stringify({ maps: result.length, people: result.reduce((sum, map) => sum + map.people.length, 0),
            errors, output: out }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
