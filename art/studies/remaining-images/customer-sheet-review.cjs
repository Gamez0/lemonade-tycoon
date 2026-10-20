// Inspect a generated candidate before importing any sprite into the game.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
const file = path.resolve(root, process.argv[2] || 'art/studies/remaining-images/customer-neighbor-sheet-v1.png');
const out = path.join(root, '.local-m4/customer-art');
fs.mkdirSync(out, { recursive: true });
const source = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
        await page.setContent('<!doctype html>');
        const measurements = await page.evaluate(async src => {
            const image = new Image(); image.src = src; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
            const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
            const pixels = context.getImageData(0, 0, image.width, image.height).data;
            const cells = [];
            for (let row = 0; row < 4; row++) for (let column = 0; column < 5; column++) {
                const left = Math.round(column * image.width / 5), right = Math.round((column + 1) * image.width / 5);
                const top = Math.round(row * image.height / 4), bottom = Math.round((row + 1) * image.height / 4);
                let x1 = right, y1 = bottom, x2 = left, y2 = top, redFringe = 0, visibleRedFringe = 0, maxRedAlpha = 0;
                for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
                    const offset = (y * image.width + x) * 4, alpha = pixels[offset + 3];
                    if (alpha >= 128) { x1 = Math.min(x1, x); x2 = Math.max(x2, x); y1 = Math.min(y1, y); y2 = Math.max(y2, y); }
                    if (alpha > 0 && pixels[offset] > 200 && pixels[offset + 1] < 60 && pixels[offset + 2] < 60) { redFringe++; maxRedAlpha = Math.max(maxRedAlpha, alpha); if (alpha >= 16) visibleRedFringe++; }
                }
                cells.push({ row, column, cell: [left, top, right - left, bottom - top], bounds: [x1, y1, x2 - x1 + 1, y2 - y1 + 1], redFringe, visibleRedFringe, maxRedAlpha });
            }
            return { width: image.width, height: image.height, cells };
        }, source);
        const data = JSON.stringify({ ...measurements, source }).replaceAll('<', '\\u003c');
        const html = `<!doctype html><meta charset="utf-8"><title>Neighbor walk candidate review</title><style>body{font:16px system-ui;background:#e9e4d2;color:#243a30;margin:24px}section{display:flex;gap:30px}figure{margin:0;padding:16px;background:#a2b797}.sprite{position:relative;width:100px;height:90px;overflow:hidden;border-bottom:1px solid #233522}.sprite .clip{position:absolute;overflow:hidden}.sprite img{position:absolute;max-width:none}button{font:inherit;margin:12px}p{max-width:1100px}</style><h1>Neighbor walk candidate · NOT integrated</h1><p>Generated study, four directions and five phases. Foot anchoring below uses measured alpha bounds for inspection only. Watch for duplicated stride, body-size drift, edge fringes and front/back consistency. This is a study playback, not actual game footage. Use the full source to inspect alpha against different backgrounds.</p><button id="play">Pause</button><button id="size">Body48px /64px</button><button id="bg">Green /white /dark</button><section>${['SE','NE','NW','SW'].map((direction,row)=>`<figure><figcaption>${direction}</figcaption><div class="sprite" id="row${row}"><div class="clip"><img></div></div></figure>`).join('')}</section><p id="frame"></p><p>Original/baseline comparison is separate in original-current-customers.html. Do not infer that49 visual families equal11 simulation profiles. No original pixels were used to generate this candidate.</p><script>const data=${data};let frame=0,playing=true,height=48,bg=0;const median=data.cells.map(c=>c.bounds[3]).sort((a,b)=>a-b)[10];function show(){const scale=height/median;for(let row=0;row<4;row++){const c=data.cells[row*5+frame],image=document.querySelector('#row'+row+' img');image.src=data.source;image.style.width=data.width*scale+'px';image.style.height=data.height*scale+'px';const clip=image.parentElement;clip.style.width=c.cell[2]*scale+'px';clip.style.height=c.cell[3]*scale+'px';clip.style.left=(50-c.cell[2]*scale/2)+'px';clip.style.top=(85-(c.bounds[1]+c.bounds[3]-c.cell[1])*scale)+'px';image.style.left=-c.cell[0]*scale+'px';image.style.top=-c.cell[1]*scale+'px';}document.getElementById('frame').textContent='Phase '+(frame+1)+'/5 · nominal body '+height+'px';}document.getElementById('play').onclick=()=>{playing=!playing;document.getElementById('play').textContent=playing?'Pause':'Play';};document.getElementById('size').onclick=()=>{height=height===48?64:48;show();};document.getElementById('bg').onclick=()=>{bg=(bg+1)%3;for(const figure of document.querySelectorAll('figure'))figure.style.background=['#a2b797','#fff','#25292b'][bg];};setInterval(()=>{if(playing){frame=(frame+1)%5;show();}},125);show();</script>`;
        fs.writeFileSync(path.join(out, 'candidate-measurements.json'), JSON.stringify(measurements, null, 2));
        fs.writeFileSync(path.join(out, 'candidate-motion.html'), html);
        await page.setContent(html); await page.screenshot({ path: path.join(out, 'candidate-motion.png') });
        console.log(JSON.stringify({ dimensions: [measurements.width, measurements.height], frames: measurements.cells.length, saturatedRedPixels: measurements.cells.reduce((sum, cell) => sum + cell.redFringe, 0), visibleRedPixels: measurements.cells.reduce((sum, cell) => sum + cell.visibleRedFringe, 0), maxRedAlpha: Math.max(...measurements.cells.map(cell => cell.maxRedAlpha)), output: out }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
