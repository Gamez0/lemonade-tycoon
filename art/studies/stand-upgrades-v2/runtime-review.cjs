const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
const { LOCATIONS } = require(path.join(root, '.test-build/content/locations.js'));
const { fundedStandBusiness } = require(path.join(root, 'tests/helpers/stand-business.cjs'));
const evidence = path.resolve(root, process.argv[2] || '.local-m4/redrawn-stands');
const out = path.join(evidence, 'source-runtime-review.html');
const png = file => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
const report = JSON.parse(fs.readFileSync(path.join(evidence, 'native-stands/result.json'), 'utf8'));
if (report.locations !== 10 || report.relaunches !== 40) throw Error('Complete native40 evidence is required.');
const maps = Object.entries(LOCATIONS).map(([id, location]) => ({ id, name: location.name,
    source: png(path.join(root, `src/game/assets/map-${id}.png`)),
    weather: fundedStandBusiness(id).state.weather,
    frames: Array.from({ length: 4 }, (_, level) => png(path.join(evidence, `native-stands/${id}-${level}.png`))) }));
const build = JSON.parse(fs.readFileSync(path.join(evidence, 'package/release/Lemonade Tycoon-win32-x64/build-info.json'), 'utf8'));
const payload = JSON.stringify({ maps, build }).replaceAll('<', '\\u003c');
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>원본과 Windows 게임 · 같은 크기 비교</title>
<style>body{background:#25292b;color:#eee;margin:24px;font:16px/1.6 system-ui}h1{font-size:24px}button,select{font:inherit;padding:6px;margin:6px}.row{display:flex;gap:20px;flex-wrap:wrap}figure{margin:0}#raw-box{display:flex;align-items:center;justify-content:center}#raw-region{position:relative;width:100%;aspect-ratio:5/4}#raw{display:block;width:100%;height:100%}#tint{position:absolute;inset:0;background:#536b83;pointer-events:none}#actual{display:block}p{max-width:1200px}</style>
<h1>원본 배경과 실제 Windows 게임 · 동일 표시 크기</h1>
<p>왼쪽은 자체 생성 원본을 같은 크기로 표시한 기준 이미지, 오른쪽은 재패키징한 Windows 실행파일에서 캡처한 실제 화면입니다. 네 단계 가판대는 배경과 별개입니다. 비 오는 날의 게임 색조는 비교 기준에도 동일하게 적용하며 끄고 확인할 수 있습니다.</p>
<select id="map"></select><select id="tier"><option value="0">Basic</option><option value="1">Classic</option><option value="2">Lemon</option><option value="3">Castle</option></select>
<label><input id="weather" type="checkbox" checked> 날씨 색조 맞추기</label><button id="zoom">표시 크기 1× / 2×</button><p id="state"></p>
<div class="row"><figure><figcaption>생성 원본 · 배경 기준</figcaption><div id="raw-box"><div id="raw-region"><img id="raw" alt="원본 배경"><div id="tint"></div></div></div></figure>
<figure><figcaption>실제 Windows 게임 · 가판대 포함</figcaption><img id="actual" alt="Windows 게임 화면"></figure></div><p id="build"></p>
<script>const data=${payload};let selected=0,tier=0,zoom=1;const selector=document.getElementById('map');for(const [index,map]of data.maps.entries())selector.add(new Option(map.name,index));
async function show(){const map=data.maps[selected],actual=document.getElementById('actual'),raw=document.getElementById('raw'),box=document.getElementById('raw-box');actual.src=map.frames[tier];raw.src=map.source;await Promise.all([actual.decode(),raw.decode()]);const width=actual.naturalWidth*zoom,height=actual.naturalHeight*zoom;Object.assign(actual.style,{width:width+'px',height:height+'px'});Object.assign(box.style,{width:width+'px',height:height+'px'});const c=document.createElement('canvas');c.width=c.height=1;c.getContext('2d').drawImage(actual,0,0);const pixel=c.getContext('2d').getImageData(0,0,1,1).data;box.style.background='rgb('+[...pixel].slice(0,3).join(',')+')';document.getElementById('tint').style.opacity=document.getElementById('weather').checked?(map.weather.label==='Rainy'?.19:map.weather.label==='Cloudy'?.08:0):0;document.getElementById('state').textContent=map.name+' · '+map.weather.label+' '+map.weather.temperature+'°C · '+width+' × '+height+' CSS px';}
selector.onchange=()=>{selected=Number(selector.value);show();};document.getElementById('tier').onchange=e=>{tier=Number(e.target.value);show();};document.getElementById('weather').onchange=show;document.getElementById('zoom').onclick=()=>{zoom=zoom===1?2:1;show();};document.getElementById('build').textContent='Windows source commit: '+data.build.source_commit+' · render backing 1280×1024';show();</script></html>`;
fs.writeFileSync(out, html);
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.goto('file:///' + out.replaceAll('\\', '/'));
        for (const [index] of maps.entries()) {
            await page.locator('#map').selectOption(String(index));
            for (let level = 0; level < 4; level++) {
                await page.locator('#tier').selectOption(String(level));
                await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
                const sizes = await page.evaluate(() => ['#raw-box', '#actual'].map(selector => {
                    const r = document.querySelector(selector).getBoundingClientRect(); return [r.width, r.height];
                }));
                if (JSON.stringify(sizes[0]) !== JSON.stringify(sizes[1])) throw Error('Unequal comparison dimensions.');
            }
        }
        if (errors.length) throw Error(errors.join('\n'));
        await page.locator('#map').selectOption('0'); await page.locator('#tier').selectOption('3');
        await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
        await page.screenshot({ path: path.join(evidence, 'equal-size-neighborhood.png'), fullPage: true });
        fs.writeFileSync(path.join(evidence, 'source-runtime-review.json'), JSON.stringify({ combinations: 40,
            equalDisplayDimensions: true, sourceCommit: build.source_commit, errors }, null, 2));
        console.log(out);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
