const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const { house, foreground, variants, cottages } = require('./house-structure.cjs');
const ROOT = path.resolve(__dirname,'../..');
const OUT = path.join(ROOT,'.local-m4/house-structure');
const transpile = text => ts.transpileModule(text, { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
} }).outputText.replace(/^import .*;\r?\n/gm,'').replace(/\bexport /g,'');

async function main() {
    fs.mkdirSync(OUT,{recursive:true});
    const baseline = file => execFileSync('git',['show',`56ddb48:${file}`],{cwd:ROOT,encoding:'utf8'});
    const source = baseline('src/game/presentation/neighborhood-raster.ts');
    // Use the unchanged road geometry, with foliage/buildings/texture withheld.
    let road = source.slice(0,source.indexOf('    const hedge =')) + '\nreturn canvas;\n}';
    road = road.replace(/ {4}for \(let i = 0; i < 1750;[\s\S]*?(?= {4}\/\/ Continuous)/,'');
    road = road.replace('#258d45','#c5c9bb').replace('#494d4d','#55594f');
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({viewport:{width:1380,height:1080}});
        await page.setContent('<html><body></body></html>');
        await page.addScriptTag({path:path.join(ROOT,'node_modules/phaser/dist/phaser.min.js')});
        const assets = await page.evaluate(async ({road,raster,art}) => {
            const roadCanvas = new Function(road+';return neighborhoodRaster();')();
            const colorRoad = new Function(road.replace('#c5c9bb','#328b48')+';return neighborhoodRaster();')();
            const currentCanvas = new Function(raster.replace('return display;', 'return canvas;')+';return neighborhoodRaster();')();
            const createArt = new Function(raster+art+';return createArt;')();
            const textures = await new Promise(resolve => {
                new window.Phaser.Game({ type:window.Phaser.CANVAS,width:640,height:512,
                    audio:{noAudio:true},banner:false,scene:{create(){
                        createArt(this);
                        const data = Object.fromEntries(['stand','customer-0-0','customer-1-0'].map(id=>
                            [id,this.textures.get(id).getSourceImage().toDataURL()]));
                        this.game.loop.sleep();
                        resolve({game:this.game,data});
                    }} });
            });
            const data = {road:roadCanvas.toDataURL(),colorRoad:colorRoad.toDataURL(),current:currentCanvas.toDataURL(),...textures.data};
            textures.game.destroy(true);
            return data;
        }, { road:transpile(road),raster:transpile(source),art:transpile(baseline('src/game/presentation/art.ts')) });
        fs.writeFileSync(path.join(OUT,'study-textures.json'),JSON.stringify(assets));
        // The three original-product sprite textures are study overlays only.
        const actors = `<g data-study="actual-product-actors"><image href="${assets.stand}" x="93.75" y="112.5" width="27" height="33"/><image href="${assets['customer-0-0']}" x="127.5" y="147" width="13.125" height="22.3125"/><image href="${assets['customer-1-0']}" x="154" y="134" width="13.125" height="22.3125"/></g>`;
        const paths = '<g fill="#d6d0c1" stroke="#55594f" stroke-width=".5"><path d="M201 45l10 5-15 7-10-5z"/><path d="M282 75l10 5-17 8-10-5z"/></g>';
        const buildings = house(variants[0],[-18,173])+
            foreground({width:58,depth:36,wall:33,rise:23,hip:0},[205,3])+
            foreground({width:52,depth:38,wall:34,rise:24,hip:0},[294,34]);
        const models = [
            {id:'block-D',title:'박공지붕 전경 집',model:cottages[0]},
            {id:'block-E',title:'모임지붕 전경 집',model:cottages[1]},
        ];
        for (const candidate of models) {
            const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240" shape-rendering="crispEdges"><image href="${assets.road}" width="300" height="240"/>${paths}${buildings}${foreground(candidate.model,[239,205])}${actors}</svg>`;
            fs.writeFileSync(path.join(OUT,candidate.id+'.svg'),markup);
        }
        fs.writeFileSync(path.join(OUT,'blockout.html'),`<!doctype html><html lang="ko"><meta charset="utf-8"><title>동네 맵 덩어리 검토</title><style>body{margin:24px;background:#202823;color:#eee;font:15px/1.7 system-ui}h1{font-size:24px}h2{font-size:18px}main{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0;width:600px}img{display:block;width:600px;height:480px;image-rendering:pixelated}button{padding:9px;margin:8px}.small figure,.small img{width:300px}.small img{height:240px}.gray img{filter:grayscale(1)}p{max-width:1150px}</style><h1>동네 맵: 주택 부피와 서비스 지점</h1><p>질감 없는 구조 시안입니다. 기존 도로와 카트 위치는 유지했고, 위쪽 주택군·집 진입로를 함께 배치했습니다. 카트와 사람은 현재 제품에서 생성한 실제 텍스처를 합성했습니다. 원작 픽셀은 포함하지 않았습니다. 이 시안을 최종 미술로 평가하거나 제품에 적용한 것은 아닙니다.</p><button onclick="document.body.classList.toggle('small')">300px / 600px</button><button onclick="document.body.classList.toggle('gray')">합성물 흑백 보기</button><main>${models.map(m=>`<figure><h2>${m.title}</h2><img src="${m.id}.svg" alt="${m.title} 전체 배치"></figure>`).join('')}</main><p>검토: 현관이 잘림 밖으로 나와 있는가 · 위쪽 주택군이 거리를 만드는가 · 전경 지붕이 보행/서비스 지점을 덮는가 · 사람과 문·카트 크기가 맞는가. 나무와 소품은 이 배치 검토 후 설계합니다.</p></html>`);
        await page.goto(pathToFileURL(path.join(OUT,'blockout.html')).href);
        await page.screenshot({path:path.join(OUT,'blockout-board.png'),fullPage:true});
        for(const model of models){
            await page.goto(pathToFileURL(path.join(OUT,model.id+'.svg')).href);
            await page.locator('svg').screenshot({path:path.join(OUT,model.id+'.png')});
        }
    } finally { await browser.close(); }
    console.log(`Blockout studies: ${OUT}`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
