// Preproduction study only. Shared world-space corners, not product artwork.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, '.local-m4/house-structure');
const VALUES = { light: '#d6d0c1', middle: '#999589', dark: '#55594f' };
const variants = [
    { id: 'A', title: '균형형', width: 96, depth: 46, wall: 66, rise: 27, porchWidth: 25, porchDepth: 10 },
    { id: 'B', title: '가파른 지붕', width: 96, depth: 50, wall: 62, rise: 36, porchWidth: 25, porchDepth: 10 },
    { id: 'C', title: '낮은 지붕', width: 96, depth: 42, wall: 68, rise: 22, porchWidth: 25, porchDepth: 10 },
];

function house(model, origin = [96, 193], options = {}) {
    const { width: w, depth: d, wall: h, rise: r, porchWidth: pw, porchDepth: pd } = model;
    const point = ([u, v, z]) => [origin[0] + u - v, origin[1] - (u + v) / 2 - z];
    const svgPoint = p => point(p).map(n => Number(n.toFixed(2))).join(',');
    const pieces = [];
    const face = (name, vertices, shade, extra = '') => pieces.push(
        `<polygon data-part="${name}" points="${vertices.map(svgPoint).join(' ')}" fill="${VALUES[shade]}" stroke="${VALUES.dark}" stroke-width=".7" stroke-linejoin="round" ${extra}/>`);
    const edge = (a, b, shade = 'dark', extra = '') => pieces.push(
        `<path d="M${svgPoint(a)} L${svgPoint(b)}" fill="none" stroke="${VALUES[shade]}" stroke-width=".7" ${extra}/>`);
    const box = (name, u, v, z, length, depth, height, shades = ['dark', 'middle', 'light']) => {
        face(name + '-end', [[u,v,z],[u,v+depth,z],[u,v+depth,z+height],[u,v,z+height]], shades[0]);
        face(name + '-front', [[u,v,z],[u+length,v,z],[u+length,v,z+height],[u,v,z+height]], shades[1]);
        face(name + '-top', [[u,v,z+height],[u,v+depth,z+height],[u+length,v+depth,z+height],[u+length,v,z+height]], shades[2]);
    };
    // One wall elevation supplies front and end eaves; the roof uses that height.
    const nearLeft = [0,0,h], nearRight = [w,0,h], backLeft = [0,d,h];
    const ridgeLeft = [0,d/2,h+r], ridgeRight = [w,d/2,h+r];
    face('left-wall', [[0,0,0],[0,d,0],backLeft,nearLeft], 'dark');
    face('front-wall', [[0,0,0],[w,0,0],nearRight,nearLeft], 'middle');
    face('left-gable', [nearLeft,backLeft,ridgeLeft], 'middle');
    // Hidden far slope is deliberately omitted for these steep-roof variants.
    // At this projection it faces away when rise >= depth/2.
    const overhang = 3;
    face('near-roof', [[-overhang,-overhang,h],[w+overhang,-overhang,h],
        [w+overhang,d/2,h+r],[-overhang,d/2,h+r]], 'light');
    face('front-fascia', [[-overhang,-overhang,h],[w+overhang,-overhang,h],
        [w+overhang,-overhang,h-2],[-overhang,-overhang,h-2]], 'dark');
    edge(ridgeLeft, ridgeRight, 'light');
    // Empty openings establish the two-storey rhythm, without frames/reflections.
    if (options.openings !== false) {
        const opening = (name, u, z, width, height) => face(name,
            [[u,-.05,z],[u+width,-.05,z],[u+width,-.05,z+height],[u,-.05,z+height]], 'dark', 'class="opening"');
        opening('upper-left-opening', 34, 44, 14, 16);
        opening('upper-right-opening', 74, 44, 14, 16);
        opening('lower-opening', 64, 13, 24, 20);
        opening('door-opening', 30, 3, 13, 25);
    }
    // Porch is a real projection from the front wall, with a descending roof,
    // supported outer corners and a platform/step sequence to the ground.
    const pu = 23;
    box('bottom-step', pu+3, -pd-9, 0, pw-6, 5, 1);
    box('upper-step', pu+1, -pd-5, 0, pw-2, 5, 2);
    box('porch-platform', pu, -pd, 0, pw, pd, 3);
    for (const u of [pu+1,pu+pw-3]) box('porch-post-'+u, u, -pd+1, 3, 2, 2, 24);
    face('porch-roof', [[pu-2,1,32],[pu+pw+2,1,32],[pu+pw+2,-pd-2,28],[pu-2,-pd-2,28]], 'light');
    face('porch-fascia', [[pu-2,-pd-2,28],[pu+pw+2,-pd-2,28],
        [pu+pw+2,-pd-2,26],[pu-2,-pd-2,26]], 'dark');
    if (options.wireframe) {
        const bottom = [[0,0,0],[w,0,0],[w,d,0],[0,d,0]];
        for (let i=0;i<4;i++) edge(bottom[i],bottom[(i+1)%4], 'dark', 'stroke-dasharray="2 2"');
        for (const [u,v] of [[0,0],[w,0],[w,d],[0,d]]) edge([u,v,0],[u,v,h], 'dark', 'stroke-dasharray="2 2"');
        edge([0,0,h/2],[w,0,h/2], 'dark', 'stroke-dasharray="2 2"');
    }
    return pieces.join('\n');
}

function figure(x, y) {
    return `<g fill="${VALUES.dark}"><circle cx="${x}" cy="${y-20}" r="2.4"/><path d="M${x-3},${y-17}h6l1,10h-2v7h-2v-7h-1v7h-2v-7h-2z"/></g>`;
}

function svg(model, options = {}) {
    const body = house(model, options.origin, options);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240" shape-rendering="crispEdges"><rect width="300" height="240" fill="#eeeae0"/>${body}${figure(223,189)}<text x="213" y="204" fill="${VALUES.dark}" font-family="sans-serif" font-size="8">H ≈22</text></svg>`;
}

// The foreground cottage is viewed from the other street direction. Cull faces
// against the actual view vector: a hidden gable cannot become a visible wall
// merely because its screen-space triangle would fill a convenient gap.
function foreground(model, origin = [130,145], wireframe = false) {
    const { width: w, depth: d, wall: h, rise: r, hip = 0 } = model;
    const point = ([u,v,z]) => [origin[0]+u-v,origin[1]+(u+v)/2-z];
    const faces = [];
    function face(name, vertices, shade) {
        const [a,b,c] = vertices;
        const ab = b.map((v,i)=>v-a[i]), ac = c.map((v,i)=>v-a[i]);
        const normal = [ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
        if (normal.reduce((sum,n)=>sum+n,0) <= 0) return;
        faces.push({ name, vertices, shade, depth: vertices.reduce((sum,p)=>sum+p.reduce((a,b)=>a+b,0),0)/vertices.length });
    }
    face('cottage-end-wall', [[w,0,0],[w,d,0],[w,d,h],[w,0,h]], 'middle');
    face('cottage-front-wall', [[w,d,0],[0,d,0],[0,d,h],[w,d,h]], 'middle');
    const a=[0,0,h], b=[w,0,h], c=[w,d,h], e=[0,d,h];
    const rl=[hip,d/2,h+r], rr=[w-hip,d/2,h+r];
    face('cottage-near-roof', [e,rl,rr,c], 'light');
    face('cottage-far-roof', [b,rr,rl,a], 'middle');
    if (hip) {
        face('cottage-left-hip', [a,rl,e], 'middle');
        face('cottage-right-hip', [c,rr,b], 'dark');
    } else {
        face('cottage-left-gable', [a,rl,e], 'dark');
        face('cottage-right-gable', [c,rr,b], 'dark');
    }
    // Painter order is along the same camera vector as back-face culling.
    faces.sort((a,b)=>a.depth-b.depth);
    const polygons = faces.map(f=>`<polygon data-part="${f.name}" points="${f.vertices.map(p=>point(p).join(',')).join(' ')}" fill="${VALUES[f.shade]}" stroke="${VALUES.dark}" stroke-width=".7" stroke-linejoin="round"/>`).join('');
    const edge = (p,q)=>`<path d="M${point(p).join(',')} L${point(q).join(',')}" fill="none" stroke="${VALUES.dark}" stroke-width=".7" stroke-dasharray="2 2"/>`;
    const structure = wireframe ? [edge([0,0,0],[w,0,0]),edge([0,0,0],[0,d,0]),edge([0,0,0],a),edge(a,e),edge(b,c)].join('') : '';
    return polygons + structure;
}

const cottages = [
    { id:'D', title:'전경 집 · 박공지붕', width:112, depth:64, wall:43, rise:27, hip:0 },
    { id:'E', title:'전경 집 · 모임지붕', width:112, depth:64, wall:43, rise:27, hip:34 },
];

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    for (const model of variants) {
        fs.writeFileSync(path.join(OUT, `${model.id}.svg`), svg(model));
        fs.writeFileSync(path.join(OUT, `${model.id}-structure.svg`), svg(model, { openings: false, wireframe: true }));
        fs.writeFileSync(path.join(OUT, `${model.id}-crop.svg`), svg(model, { origin: [-18,173] }));
    }
    for (const model of cottages) {
        for (const wireframe of [false,true]) {
            const source = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240" shape-rendering="crispEdges"><rect width="300" height="240" fill="#eeeae0"/>${foreground(model,[115,132],wireframe)}${figure(251,206)}</svg>`;
            fs.writeFileSync(path.join(OUT,`${model.id}${wireframe?'-structure':''}.svg`),source);
        }
    }
    fs.writeFileSync(path.join(OUT,'hedge-structure.svg'),
        '<svg xmlns="http://www.w3.org/2000/svg" width="70" height="48" viewBox="0 0 70 48"><path d="M0 15L64 47V35L0 3Z" fill="#55594f"/><path d="M64 47L70 44V32L64 35Z" fill="#999589"/><path d="M0 3L6 0L70 32L64 35Z" fill="#d6d0c1"/></svg>');
    const cards = variants.map(m => `<article><h2>${m.id} · ${m.title}</h2><img src="${m.id}.svg" alt="${m.title} 전체 입체"><p>벽 ${m.wall} / 깊이 ${m.depth} / 지붕 높이 ${m.rise}</p><img src="${m.id}-structure.svg" alt="${m.title} 공통 모서리 구조"><img src="${m.id}-crop.svg" alt="${m.title} 기존 지도 위치에서의 잘림"></article>`).join('');
    fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>주택 구조·비례 시안</title><style>body{background:#202823;color:#eee;font:15px/1.6 system-ui;margin:24px}h1{font-size:24px}h2{font-size:18px}main{display:flex;gap:24px;flex-wrap:wrap}article{width:300px}img{display:block;width:300px;height:240px;image-rendering:pixelated;margin-bottom:16px}button{padding:9px;margin-bottom:12px}.large article,.large img{width:600px}.large img{height:480px}p{max-width:1000px}</style><h1>왼쪽 집: 질감 없는 구조·비례 시안</h1><p>같은 평면 폭에 벽 높이·건물 깊이·지붕 경사를 달리한 세 후보입니다. 전체 입체 → 장식 없는 구조 → 지도 위치의 잘림 순서입니다. 사람 표시는 약22px의 크기 기준이며 제품 스프라이트가 아닙니다. 제품에는 적용하지 않았습니다.</p><button onclick="document.body.classList.toggle('large')">300px / 600px</button><main>${cards}</main><h1>전경 집: 보이는 면과 가려지는 면</h1><p>같은 바닥 위에 박공지붕과 모임지붕을 비교합니다. 돌출창과 재질 선을 넣지 않았습니다. 투영 방향에서 보이지 않는 박공벽은 그리지 않습니다.</p><main>${cottages.map(m=>`<article><h2>${m.id} · ${m.title}</h2><img src="${m.id}.svg" alt="${m.title}"><img src="${m.id}-structure.svg" alt="${m.title} 구조선"></article>`).join('')}</main>`);
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1100, height: 1250 } });
        await page.goto(require('node:url').pathToFileURL(path.join(OUT,'index.html')).href);
        await page.screenshot({ path: path.join(OUT,'board.png'), fullPage: true });
        for (const model of [...variants,...cottages,{id:'hedge-structure'}]) {
            await page.goto(require('node:url').pathToFileURL(path.join(OUT,`${model.id}.svg`)).href);
            await page.locator('svg').screenshot({ path: path.join(OUT,`${model.id}.png`), omitBackground: true });
        }
    } finally { await browser.close(); }
    fs.writeFileSync(path.join(OUT,'models.json'), JSON.stringify({ projection: 'left:x=u-v,y=-(u+v)/2-z; cottage:x=u-v,y=(u+v)/2-z', values: VALUES, variants, cottages },null,2));
    console.log(`House studies: ${OUT}`);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { house, foreground, svg, figure, variants, cottages };
