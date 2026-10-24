// Render production route geometry over each exact shipped map image.
const fs = require('node:fs'), path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.LEMONADE_ROUTE_REVIEW_ROOT || '.local-m4/route-review');
fs.mkdirSync(out, { recursive: true });
const exportsObject = {};
new Function('exports', ts.transpileModule(fs.readFileSync(path.join(root, 'src/game/content/map-layouts.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText)(exportsObject);
const { MAP_LAYOUTS, mapPosition, queueProgress } = exportsObject;
const colors = { service: '#0080ff', through: '#ff2525', depart: '#e6b900' };
const cards = Object.entries(MAP_LAYOUTS).map(([id, layout]) => {
    const png = fs.readFileSync(path.join(root, 'src/game/assets/map-' + id + '.png')).toString('base64');
    const routes = Object.entries(colors).map(([purpose, color]) => {
        const points = Array.from({ length: 141 }, (_, i) => mapPosition(id, (purpose === 'depart' ? 286 : -20) + i / 140 * (purpose === 'depart' ? 394 : 700), purpose));
        const arrows = (purpose === 'depart' ? [330, 450, 600] : [80, 210, 390, 560]).map(at => {
            const [x, y] = mapPosition(id, at, purpose), [xx, yy] = mapPosition(id, at + 3, purpose);
            return `<path d="M-4-3L0 0L-4 3" fill="none" stroke="${color}" stroke-width="1.2" transform="translate(${x} ${y}) rotate(${Math.atan2(yy - y, xx - x) * 180 / Math.PI})"/>`;
        }).join('');
        return `<g class="${purpose}"><polyline points="${points.map(p => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.4"/>${arrows}</g>`;
    }).join('');
    const queue = Array.from({ length: 6 }, (_, i) => { const [x, y] = mapPosition(id, queueProgress(id, i));
        return `<circle cx="${x}" cy="${y}" r="4" fill="#d52eff88" stroke="#fff" stroke-width=".5"/><text x="${x + 4}" y="${y}" font-size="6" fill="#faffff">${i + 1}</text>`; }).join('');
    const service = mapPosition(id, 286);
    return `<article><h2>${id}</h2><div class="map" data-map="${id}"><img src="data:image/png;base64,${png}"><svg viewBox="0 0 300 240">${routes}<g class="queue">${queue}</g><circle cx="${layout.ground[0]}" cy="${layout.ground[1]}" r="3" fill="#20ff25"/><circle cx="${service[0]}" cy="${service[1]}" r="2.5" fill="#fff"/></svg></div></article>`;
}).join('');
const html = `<!doctype html><meta charset="utf-8"><title>Ten map route review</title><style>body{font:15px system-ui;background:#eee9d8;color:#284a3c;margin:16px}main{display:grid;grid-template-columns:repeat(2,600px);gap:20px}h2{margin:4px 0}.map{width:600px;height:480px;position:relative}.map>img,svg{position:absolute;inset:0;width:100%;height:100%}label{margin-right:18px}</style><h1>실제 맵 · 경로 검토</h1><p>빨강: 통행 / 파랑: 서비스 경로 / 노랑: 퇴장 / 보라: 대기열 / 녹색: 가판대 / 흰색: 서비스 발 위치. 실제 제품 좌표를 겹친 검토 화면이며, 보행 가능 영역 검증 자체를 대신하지 않습니다.</p><nav>${Object.keys(colors).concat('queue').map(c => `<label><input type="checkbox" checked data-layer="${c}">${c}</label>`).join('')}</nav><main>${cards}</main><script>for(const e of document.querySelectorAll('input'))e.onchange=()=>{for(const g of document.querySelectorAll('.'+e.dataset.layer))g.style.display=e.checked?'':'none';};</script>`;
fs.writeFileSync(path.join(out, 'review.html'), html);
fs.writeFileSync(path.join(out, 'layouts.json'), JSON.stringify(MAP_LAYOUTS, null, 2));
(async () => { const browser = await chromium.launch(); try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    await page.goto('file:///' + path.join(out, 'review.html').replaceAll('\\', '/'));
    await page.locator('img').evaluateAll(images => Promise.all(images.map(i => i.decode())));
    for (const id of Object.keys(MAP_LAYOUTS)) await page.locator(`[data-map="${id}"]`).screenshot({ path: path.join(out, id + '.png') });
    console.log(JSON.stringify({ output: out, maps: Object.keys(MAP_LAYOUTS).length }));
} finally { await browser.close(); } })().catch(e => { console.error(e); process.exitCode = 1; });
