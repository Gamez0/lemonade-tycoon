const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
async function main() {
    const items = [
        ['원작 · 보존된 조사 캡처', 'D:/lemonade-loop/.local-m4/same-location-20261018/reference-study.png'],
        ['이전 시안 · v4', path.join(__dirname, 'environment-v4-house-scale.png')],
        ['색·질감 수정 · v5', path.join(__dirname, 'environment-v5-reference-color.png')],
        ['지붕 밝기·질감 정리 · v6', path.join(__dirname, 'environment-v6-reference-texture.png')],
    ];
    const figures = items.map(([title, file]) => {
        const src = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
        return `<figure><h2>${title}</h2><img class="small" src="${src}"><img class="large" src="${src}"></figure>`;
    }).join('');
    const out = path.resolve(__dirname, '../../../.local-m4/neighborhood-cohesion');
    fs.mkdirSync(out, { recursive: true });
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>원작 색·질감 비교</title><style>body{margin:24px;background:#25292b;color:#eee;font:16px/1.6 system-ui}main{display:flex;gap:20px;flex-wrap:wrap}figure{width:600px;margin:0}h2{font-size:20px}img{display:block;margin:12px 0;image-rendering:pixelated}.small{width:300px;height:240px}.large{width:600px;height:480px}.gray img{filter:grayscale(1)}button{padding:8px}</style><h1>원작과 색·질감 비교 · 2026-10-20</h1><p>동일한 300×240 크기와 2배 확대입니다. 원작은 기존 조사 캡처이며 제품 자산이 아닙니다. v5는 자체 시안을 문장 지시로 수정했습니다. 축척·동선·최종 미술 수용은 아직 검증하지 않았습니다.</p><button onclick="document.body.classList.toggle('gray')">흑백 명암 비교</button><main>${figures}</main></html>`;
    fs.writeFileSync(path.join(out, 'reference-comparison.html'), html);
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1900, height: 1150 } });
        await page.setContent(html);
        await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
        await page.screenshot({ path: path.join(out, 'reference-comparison.png'), fullPage: true });
        console.log(path.join(out, 'reference-comparison.html'));
    } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
