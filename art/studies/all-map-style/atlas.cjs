const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
async function main() {
    const root = path.resolve(__dirname, '../../..');
    const out = path.join(root, '.local-m4/all-map-art');
    const reference = process.env.LEMONADE_REFERENCE_DIR || 'C:/Users/dobin/Documents/Projects/lemonade-tycoon/.local/reference';
    const maps = JSON.parse(fs.readFileSync(path.join(__dirname, 'maps.json'), 'utf8'));
    const sprites = JSON.parse(fs.readFileSync('D:/lemonade-calendar-ci/.local-m4/house-structure/study-textures.json', 'utf8'));
    const data = file => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
    const manifest = [];
    for (const map of maps) {
        const file = path.resolve(__dirname, map.file), bytes = fs.readFileSync(file);
        if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error('Not PNG: ' + map.id);
        manifest.push({ id: map.id, file: path.relative(root, file).replaceAll('\\', '/'),
            width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
            sha256: crypto.createHash('sha256').update(bytes).digest('hex'), status: 'study-not-integrated' });
        map.image = data(file);
        map.original = data(path.join(reference, `expected-${map.reference}.png`));
    }
    if (maps.length !== 10 || new Set(maps.map(m => m.id)).size !== 10) throw Error('Expected ten unique maps');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
    const payload = JSON.stringify({ maps, stand: sprites.stand, person: sprites['customer-0-0'] }).replaceAll('<', '\\u003c');
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>10개 맵 미술 비교</title>
<style>body{margin:24px;background:#25292b;color:#eee;font:16px/1.6 system-ui}h1{margin-bottom:8px}h2{font-size:20px}p{max-width:1100px}.grid{display:grid;grid-template-columns:repeat(auto-fit,300px);gap:14px}.tile{background:#32383a;border:2px solid transparent;color:inherit;padding:0;text-align:left;cursor:pointer}.tile[aria-pressed=true]{border-color:#c2d770}.tile img{display:block;width:300px;height:240px;image-rendering:pixelated}.tile span{display:block;padding:5px 10px}button,select{font:inherit;padding:7px;margin:4px}.controls{margin:20px 0}.compare{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0}.scene{position:relative;width:300px;height:240px;overflow:hidden;transform-origin:top left}.scene img{position:absolute;image-rendering:pixelated}.base{width:100%;height:100%;inset:0}.actors{display:none}.show-actors .actors{display:block}.gray .base,.gray .tile img{filter:grayscale(1)}.large .scene{width:600px;height:480px}.caption{font-size:14px;color:#c7ceca}#review{border-left:3px solid #c2d770;padding:12px}.original{width:300px;height:240px;image-rendering:pixelated}.large .original{width:600px;height:480px}a{color:#d2e493}</style>
<h1>10개 맵 · 공통 미술 방향</h1><p>원작의 장소 특징을 비교하며 만든 자체 시안입니다. 아래에서 장소를 선택하면 보존된 원작 자료와 비교할 수 있습니다. 게임 적용과 동선 검증은 아직 진행 전입니다.</p><div id="grid" class="grid"></div>
<section id="detail"><div class="controls"><button id="size">300px / 600px</button><button id="gray">흑백 비교</button><button id="actors">현재 게임 사람·카트 겹치기</button></div><h2 id="title"></h2><div class="compare"><figure><figcaption>원작 · 기존 리소스 조합 연구 자료</figcaption><img id="original" class="original"></figure><figure><figcaption>자체 개선 시안</figcaption><div class="scene"><img class="base" id="candidate"><img class="actors" id="stand"><img class="actors" id="person"></div></figure></div><p id="review"></p><p class="caption">사람·카트는 모든 장소에서 같은 배율로 표시합니다. 배치는 축척 비교용이며 게임의 실제 동선이 아닙니다. 원작 자료는 비교용으로만 포함했습니다.</p></section>
<script>const data=${payload};let selected=0;const grid=document.querySelector('#grid');
data.maps.forEach((m,i)=>{const b=document.createElement('button');b.className='tile';b.dataset.id=m.id;b.setAttribute('aria-pressed','false');const img=new Image();img.src=m.image;img.alt=m.name+' 개선 시안';const s=document.createElement('span');s.textContent=m.name;b.append(img,s);b.onclick=()=>{select(i);document.querySelector('#detail').scrollIntoView({behavior:'smooth'});};grid.append(b);});
function select(i){selected=i;const m=data.maps[i];document.querySelector('#title').textContent=m.name;document.querySelector('#original').src=m.original;document.querySelector('#original').alt=m.name+' 원작 조사 자료';document.querySelector('#candidate').src=m.image;document.querySelector('#candidate').alt=m.name+' 개선 시안';document.querySelector('#review').textContent=m.review;[...grid.children].forEach((b,n)=>b.setAttribute('aria-pressed',String(i===n)));place();}
function place(){const m=data.maps[selected],k=document.body.classList.contains('large')?2:1;for(const [id,src,x,y,w,h]of[['stand',data.stand,...m.cart,27,33],['person',data.person,m.person[0]-6.5625,m.person[1]-22.3125,13.125,22.3125]]){const img=document.getElementById(id);img.src=src;img.alt=id==='stand'?'현재 게임 카트':'현재 게임 손님';Object.assign(img.style,{left:x*k+'px',top:y*k+'px',width:w*k+'px',height:h*k+'px'});}}
document.querySelector('#size').onclick=()=>{document.body.classList.toggle('large');place();};document.querySelector('#gray').onclick=()=>document.body.classList.toggle('gray');document.querySelector('#actors').onclick=()=>document.body.classList.toggle('show-actors');select(0);</script></html>`;
    fs.writeFileSync(path.join(out, 'atlas.html'), html);
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1640, height: 1100 } });
        const failures = []; page.on('pageerror', error => failures.push(error.message));
        await page.setContent(html);
        await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
        await page.locator('#grid').screenshot({ path: path.join(out, 'contact-sheet.png') });
        for (const map of maps) {
            await page.evaluate(id => document.querySelector('[data-id="' + id + '"]').click(), map.id);
            await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
            if (await page.locator('#title').textContent() !== map.name) throw Error('Selection failed: ' + map.id);
        }
        await page.locator('#size').click(); await page.locator('#gray').click(); await page.locator('#actors').click();
        if (!await page.locator('#person').isVisible()) throw Error('Actor overlay missing');
        if (await page.locator('.scene').evaluate(el => el.clientWidth) !== 600) throw Error('Scale toggle failed');
        await page.locator('#gray').click();
        for (const map of maps) {
            await page.evaluate(id => document.querySelector('[data-id="' + id + '"]').click(), map.id);
            await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
            await page.locator('#detail').screenshot({ path: path.join(out, `${map.id}-scale-review.png`) });
        }
        if (failures.length) throw Error(failures.join('\n'));
        fs.writeFileSync(path.join(out, 'review-checks.json'), JSON.stringify({ maps: maps.length, decodedImages: true, selection: '10/10', scaleToggle: true, grayscaleToggle: true, actorOverlay: true, errors: failures }, null, 2));
        console.log(path.join(out, 'atlas.html'));
    } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
