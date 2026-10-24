// Private visual review. Original references never enter production assets.
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const [before, after, legacy] = process.argv.slice(2);
if (!before || !after || !legacy) throw Error('Usage: node scripts/customer-motion-review.cjs <baseline-review> <candidate-review> <private-legacy-root>');
const out = path.resolve(process.env.LEMONADE_MOTION_REVIEW_ROOT || '.local-m4/motion-review');
fs.mkdirSync(out, { recursive: true });
function samples(dir) {
    const text = fs.readFileSync(path.join(dir, 'customer-textures.html'), 'utf8');
    const metrics = JSON.parse(fs.readFileSync(path.join(dir, 'texture-bounds.json'), 'utf8')).metrics;
    return { frames: Object.fromEntries([...text.matchAll(/<figcaption>([^<]+)<\/figcaption><img[^>]+src="([^"]+)"/g)].map(m => [m[1], m[2]])), metrics };
}
const baseline = samples(before), candidate = samples(after);
const original = JSON.parse(fs.readFileSync(path.join(legacy, 'public/assets/original/customers.json'), 'utf8')).frames;
const atlas = 'data:image/png;base64,' + fs.readFileSync(path.join(legacy, 'public/assets/original/customers.png')).toString('base64');
const map = 'data:image/png;base64,' + fs.readFileSync('src/game/assets/map-neighborhood.png').toString('base64');
function role(data, visual, rear, flip, action = 'walk') {
    const scale = data.metrics.scale * 300 / 640;
    const frames = Array.from({ length: action === 'walk' || action === 'cup' ? 4 : 1 }, (_, i) => data.frames[`customer-${visual}-${rear ? 'rear' : 'front'}-${action}-${i}`]);
    if (frames.some(f => !f)) throw Error('Missing review frames');
    return `<span class="anchor"><img class="motion" data-frames='${JSON.stringify(frames)}' style="width:${128 * scale}px;height:${192 * scale}px;left:${-128 * scale / 2}px;top:${-192 * scale * data.metrics.originY}px;transform:scaleX(${flip ? -1 : 1})" src="${frames[0]}"></span>`;
}
function reference(family, direction) {
    const frames = Array.from({ length: 5 }, (_, i) => original[String(family * 20 + direction * 5 + i)]);
    return `<span class="original motion" data-atlas='${JSON.stringify(frames)}' style="left:0;top:0"><span class="trim"></span></span>`;
}
const views = [[false, false, 'SE'], [true, false, 'NE'], [true, true, 'NW'], [false, true, 'SW']];
const rows = ['neighbor', 'office', 'student'].flatMap((visual, profile) => views.map(([rear, flip, direction], index) =>
    `<tr><th>${visual} / ${direction}</th><td>${reference([9, 8, 6][profile], index)}</td><td>${role(baseline, visual, rear, flip)}</td><td>${role(candidate, visual, rear, flip)}</td><td>${role(candidate, visual, rear, flip, 'cup')}</td></tr>`)).join('');
const html = `<!doctype html><meta charset="utf-8"><title>PRIVATE customer motion analysis</title><style>
body{font:15px system-ui;background:#eee9d8;color:#243a30;margin:24px}button,label{margin-right:16px}table{border-collapse:collapse}td,th{border:1px solid #9aab8c;padding:10px}td{background:#a2b797;width:100px;height:110px;position:relative}.anchor{position:absolute;left:50%;top:85%;width:0;height:0}.anchor img{position:absolute;image-rendering:pixelated}.original{position:absolute!important;left:calc(50% - 33px)!important;top:calc(85% - 99px)!important;width:22px;height:34px;transform:scale(3);transform-origin:top left}.trim{position:absolute;background-image:url('${atlas}');image-rendering:pixelated}.anchor{transform:scale(3)}.scene{display:inline-block;position:relative;width:300px;height:240px;background:url('${map}') 0 0/300px 240px;margin-right:20px}.scene .anchor{transform:none;left:123px;top:150px}.scene b{background:#fff9e7;position:absolute;top:0}.note{max-width:1000px}</style>
<h1>원작 / 변경 전 / 수정 후보 — 움직임 비교</h1><p class="note">PRIVATE 원작 자료 포함. 표는 모두 동일한300px 맵 폭 기준을3배 확대한 것입니다. 원작5프레임과 후보4프레임을125ms 간격으로 비교 재생하며, 원작의 실제 재생 속도를 측정했다는 뜻은 아닙니다. 아래 장면은 실제 제품 프레임을 사용한 비교 합성입니다. 실제 게임 실행 영상은 별도 native 결과를 확인합니다.</p>
<button id="pause">Pause / resume</button><button id="next">Next frame</button><label>표 확대 <input id="zoom" type="range" min="1" max="4" value="3"></label>
<div><div class="scene"><b>변경 전 / 같은 맵300px</b>${role(baseline, 'neighbor', true, true)}</div><div class="scene"><b>수정 후보 / 같은 맵300px</b>${role(candidate, 'neighbor', true, true)}</div></div>
<table><thead><tr><th>시각 계열 / 방향</th><th>원작 참고</th><th>변경 전</th><th>수정 후보</th><th>컵을 든 보행</th></tr></thead><tbody>${rows}</tbody></table>
<script>let frame=0,paused=false;function draw(){for(const e of document.querySelectorAll('.motion')){if(e.dataset.frames){const a=JSON.parse(e.dataset.frames);e.src=a[frame%a.length];}else{const a=JSON.parse(e.dataset.atlas),f=a[frame%a.length],r=f.frame,t=f.spriteSourceSize,c=e.firstElementChild;c.style.cssText='left:'+t.x+'px;top:'+t.y+'px;width:'+r.w+'px;height:'+r.h+'px;background-position:-'+r.x+'px -'+r.y+'px';}}}setInterval(()=>{if(!paused){frame++;draw();}},125);document.querySelector('#pause').onclick=()=>paused=!paused;document.querySelector('#next').onclick=()=>{paused=true;frame++;draw();};document.querySelector('#zoom').oninput=e=>{for(const a of document.querySelectorAll('td .anchor'))a.style.transform='scale('+e.target.value+')';};draw();</script>`;
fs.writeFileSync(path.join(out, 'review.html'), html);
(async () => { const browser = await chromium.launch(); try {
    const page = await browser.newPage({ viewport: { width: 1350, height: 1250 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('file:///' + path.join(out, 'review.html').replaceAll('\\', '/'));
    await page.waitForTimeout(250); await page.locator('#pause').click();
    await page.screenshot({ path: path.join(out, 'comparison.png') });
    await page.locator('#next').click(); if (errors.length) throw Error(errors.join('\n'));
    console.log(JSON.stringify({ output: out, animatedRows: 12, errors }));
} finally { await browser.close(); } })().catch(e => { console.error(e); process.exitCode = 1; });
