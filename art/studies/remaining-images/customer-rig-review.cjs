// Code-native articulation study, separate from generated PNGs and product code.
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const out = path.resolve(__dirname, '../../../.local-m4/customer-art/rig');
fs.mkdirSync(out, { recursive: true });
const directions = { se: [1, 0], ne: [0, -1], nw: [-1, 0], sw: [0, 1] };
function frame(direction, pose) {
    const [fx, fy] = directions[direction], lx = -fy, ly = fx;
    const near = lx + ly > 0 ? 1 : -1, rear = direction.startsWith('n');
    const walking = pose < 4, theta = pose * Math.PI / 2;
    const stride = walking ? Math.cos(theta) : 0;
    const bob = walking ? Math.abs(Math.sin(theta)) * .6 : 0;
    const project = (x, f, z) => {
        const xx = lx * x + fx * f, yy = ly * x + fy * f;
        return [32 + (xx - yy) * .866, 87 + (xx + yy) * .45 - z - bob * Math.min(1, Math.max(0, z) / 25)];
    };
    const point = p => p.map(n => n.toFixed(2)).join(',');
    const ink = '#354036', skin = '#d9b18a', hair = '#594432';
    const parts = [];
    const pathShape = (points, fill) => parts.push(`<path fill="${fill}" d="M${points.map(point).join('L')}Z"/>`);
    const limb = (points, color, width) => {
        const d = 'M' + points.map(point).join('L');
        parts.push(`<path fill="none" stroke="${ink}" stroke-width="${width + 1.2}" stroke-linecap="round" stroke-linejoin="round" d="${d}"/><path fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`);
    };
    const arm = side => {
        const raised = pose === 5 && side === near;
        const swing = -side * stride * 4;
        const shoulder = project(side * 6, 0, 46);
        const elbow = project(side * 7, raised ? 1 : swing * .5, raised ? 43 : 37);
        const hand = project(side * (raised ? 2 : 7), raised ? 4 : swing, raised ? 54 : 28);
        limb([shoulder, elbow, hand], skin, 2.8);
        limb([shoulder, project(side * 6.7, swing * .2, 42)], '#b9654c', 4);
    };
    arm(-near);
    const feet = [];
    for (const side of [-near, near]) {
        const forward = side * stride * 7;
        const lift = walking ? Math.max(0, -side * Math.sin(theta)) * 5 : 0;
        const foot = project(side * 3, forward, lift + 1);
        feet.push({ side, forward, lift, foot });
        limb([project(side * 3, 0, 27), project(side * 3.5, forward * .55 + lift * .3, 14 + lift * .35), foot],
            side === near ? '#485361' : '#354250', 4.8);
        pathShape([project(side * 3 - 1.8, forward - 1, lift),
            project(side * 3 + 1.8, forward - 1, lift), project(side * 3 + 1.8, forward + 3, lift),
            project(side * 3 - 1.8, forward + 3, lift)], '#514735');
    }
    limb([project(0, 0, 49), project(0, 0, 53)], skin, 3);
    pathShape([project(-6, 1, 48), project(6, 1, 48), project(4.5, 1, 27), project(-4.5, 1, 27)], '#bb684e');
    pathShape([project(2, 1, 47), project(6, 1, 48), project(4.5, 1, 27), project(2, 1, 28)], '#a95843');
    if (!rear) limb([project(-2, 1.2, 48), project(0, 1.5, 46.5), project(2, 1.2, 48)], '#e1b894', .7);
    arm(near);
    const cup = () => {
        if (pose !== 5) return;
        const [x, y] = project(near * 2, 4, 55);
        parts.push(`<path fill="#f5edcd" d="M${x-2},${y-2}h4l-.5,5h-3Z"/><path stroke="#e6cb4e" stroke-width="1.5" d="M${x-1},${y+1}h2"/>`);
    };
    if (rear) cup();
    const [hx, hy] = project(0, 0, 56), faceRight = direction.endsWith('e');
    parts.push(`<ellipse fill="${rear ? hair : skin}" cx="${hx}" cy="${hy}" rx="3.7" ry="5.1"/>`);
    if (!rear) {
        const sign = faceRight ? 1 : -1;
        parts.push(`<path fill="${skin}" d="M${hx+sign*3},${hy-1}l${sign*1.5},2l${-sign*1.5},1"/>`);
        parts.push(`<path fill="${hair}" d="M${hx-3.5},${hy-1}q-1,-5 3.5,-5q5,0 3.5,4l-4,1Z"/>`);
        parts.push(`<circle stroke="none" fill="${ink}" cx="${hx+sign*2.2}" cy="${hy+.2}" r=".3"/>`);
    }
    if (!rear) cup();
    return { direction, pose, feet, anchor: [32, 87],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><g stroke="${ink}" stroke-width=".75" stroke-linejoin="round">${parts.join('')}</g></svg>` };
}
const frames = Object.keys(directions).flatMap(direction => Array.from({ length: 6 }, (_, pose) => frame(direction, pose)));
const root = path.resolve(__dirname, '../../..');
const map = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'src/game/assets/map-neighborhood.png')).toString('base64');
const stand = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'src/game/assets/stand-basic-v2.png')).toString('base64');
const html = `<!doctype html><meta charset="utf-8"><title>Articulated customer study</title><style>
body{font:16px system-ui;background:#eee9d8;color:#243a30;margin:24px}
section{display:flex;gap:24px}.actor{position:relative;width:100px;height:80px;background:#a2b797;border-bottom:1px solid #546b50}
.actor svg{position:absolute;left:36.67px;top:43.75px;width:26.67px;height:40px}
.map{position:relative;width:300px;height:240px;background-size:300px 240px}.map .stand{position:absolute;z-index:142;left:94.38px;top:107.44px;width:30px;height:39.33px}.map-actor{position:absolute}.contexts{display:flex;gap:24px;margin:20px 0}.sheet{display:grid;grid-template-columns:repeat(6,80px);gap:10px}.sheet svg{width:64px;height:96px;background:#a2b797}
button{font:inherit;margin:12px}
</style><h1>Articulated Neighbor study - NOT integrated</h1><p>Code-native SVG articulation with fixed32,87 ground anchors, minimal faces and four opposing walk phases, idle and drinking. Nominal26px body at the same300px map normalization; inspect phase contact and anatomy before any product integration.</p>
<button id="play">Pause / play</button><button id="step">Step all six poses</button><section>${Object.keys(directions).map(direction => `<figure><figcaption>${direction.toUpperCase()}</figcaption><div class="actor" id="${direction}"></div></figure>`).join('')}</section>
<p id="pose"></p><h2>Map context only - not gameplay</h2><div class="contexts">${[22,26,30].map(size=>`<figure><figcaption>Nominal body ${size}px / map300px</figcaption><div class="map" style="background-image:url('${map}')"><svg class="stand" viewBox="382 84 730 957"><image href="${stand}" width="1402" height="1122"/></svg><span class="map-actor" data-size="${size}" data-role="service" style="left:123px;top:150px;z-index:150"></span><span class="map-actor" data-size="${size}" data-role="through" style="left:190px;top:128px;z-index:128"></span></div></figure>`).join('')}</div><div class="sheet">${frames.map(f => f.svg).join('')}</div><script>
const frames=${JSON.stringify(frames).replaceAll('<','\\u003c')};let phase=0,playing=true;
function show(){for(const direction of ['se','ne','nw','sw'])document.getElementById(direction).innerHTML=frames.find(f=>f.direction===direction&&f.pose===phase).svg;for(const actor of document.querySelectorAll('.map-actor')){const scale=Number(actor.dataset.size)/62;const f=frames.find(f=>f.direction===(actor.dataset.role==='service'?'nw':'se')&&f.pose===(actor.dataset.role==='service'?4:phase));actor.innerHTML=f.svg;const svg=actor.firstElementChild;svg.style.cssText='position:absolute;width:'+64*scale+'px;height:'+96*scale+'px;left:'+(-32*scale)+'px;top:'+(-87*scale)+'px';}document.getElementById('pose').textContent='Pose '+phase+' (0..3 walk,4 idle,5 drink)';}
document.getElementById('play').onclick=()=>playing=!playing;
document.getElementById('step').onclick=()=>{playing=false;phase=(phase+1)%6;show();};
setInterval(()=>{if(playing){phase=(phase+1)%4;show();}},150);show();</script>`;
fs.writeFileSync(path.join(out, 'review.html'), html);
fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify(frames, null, 2));
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.setContent(html);
        const bounds = await page.locator('.sheet svg g').evaluateAll(groups => groups.map(group => {
            const b = group.getBBox(); return { x: b.x, y: b.y, width: b.width, height: b.height };
        }));
        if (bounds.some(b => b.x < 1 || b.y < 1 || b.x + b.width > 63 || b.y + b.height > 95))
            throw Error('Study frame clips its native viewBox');
        fs.writeFileSync(path.join(out, 'bounds.json'), JSON.stringify(bounds, null, 2));
        await page.screenshot({ path: path.join(out, 'review.png'), fullPage: true });
        if (errors.length) throw Error(errors.join(';'));
        console.log('24 articulated direction/pose vectors rendered; study only: ' + out);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
