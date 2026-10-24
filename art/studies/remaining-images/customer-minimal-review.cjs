const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
const out = path.join(root, '.local-m4/customer-art/minimal-v1');
fs.mkdirSync(out, { recursive: true });
const source = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,
    'customer-neighbor-minimal-v1.png')).toString('base64');
const map = 'data:image/png;base64,' + fs.readFileSync(path.join(root,
    'src/game/assets/map-neighborhood.png')).toString('base64');
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1400, height: 1050 } });
        const cells = await page.evaluate(async source => {
            const image = new Image(); image.src = source; await image.decode();
            const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
            const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0);
            const data = ctx.getImageData(0, 0, c.width, c.height).data;
            return Array.from({ length: 4 }, (_, column) => {
                const start = Math.round(column * c.width / 4), end = Math.round((column + 1) * c.width / 4);
                let x1 = end, y1 = c.height, x2 = start, y2 = 0;
                for (let y = 0; y < c.height; y++) for (let x = start; x < end; x++) {
                    if (data[(y * c.width + x) * 4 + 3] < 128) continue;
                    x1 = Math.min(x1, x); x2 = Math.max(x2, x);
                    y1 = Math.min(y1, y); y2 = Math.max(y2, y);
                }
                if (x2 <= x1 || y2 <= y1) throw Error('Empty direction');
                return { x: x1, y: y1, width: x2 - x1 + 1, height: y2 - y1 + 1,
                    sourceWidth: c.width, sourceHeight: c.height };
            });
        }, source);
        function sprite(cell, height) {
            const scale = height / cell.height;
            return `<span class="sprite" style="width:${cell.width * scale}px;height:${height}px"><img src="${source}" style="width:${cell.sourceWidth * scale}px;height:${cell.sourceHeight * scale}px;left:${-cell.x * scale}px;top:${-cell.y * scale}px"></span>`;
        }
        const html = `<!doctype html><meta charset="utf-8"><title>Minimal face study</title><style>
body{font:16px system-ui;background:#e9e4d2;color:#243a30;margin:24px}
section{display:flex;gap:24px;margin:16px 0}.card{background:#a2b797;padding:16px}
.sprite{display:inline-block;position:relative;overflow:hidden;vertical-align:bottom}
.sprite img{position:absolute;max-width:none}.directions{display:flex;gap:24px;align-items:end;height:85px}
.map{width:300px;height:240px;position:relative;background-size:300px 240px}
.map .actor{position:absolute;left:123px;top:150px;transform:translate(-50%,-100%)}
p{max-width:1100px}
</style><h1>Minimal face / adult silhouette study - NOT integrated</h1>
<p>User correction: faces should remain understated. Independently generated with the built-in tool from text only. No previous detailed-face sheet or original pixels supplied. Idle only: no animation/production acceptance.</p>
<p>Map width is300px in every panel. Heights below are opaque-body heights, not whole-cell heights. Compare the private native22x34 original cells in <a href="../original-current-customers.html">original/current board</a>; do not infer simulation identities from visual families.</p>
<section>${[22, 26, 30].map(height => `<div class="card"><b>Body ${height}px</b><div class="directions">${cells.map(cell => sprite(cell, height)).join('')}</div><div class="map" style="background-image:url('${map}')"><span class="actor">${sprite(cells[0], height)}</span></div></div>`).join('')}</section>
<p>Large inspection only (body68px):</p><div class="directions">${cells.map(cell => sprite(cell, 68)).join('')}</div>`;
        fs.writeFileSync(path.join(out, 'review.html'), html);
        fs.writeFileSync(path.join(out, 'measurements.json'), JSON.stringify(cells, null, 2));
        await page.setContent(html);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        await page.screenshot({ path: path.join(out, 'review.png') });
        console.log(JSON.stringify({ directions: cells.length, dimensions: [cells[0].sourceWidth, cells[0].sourceHeight], output: out }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
