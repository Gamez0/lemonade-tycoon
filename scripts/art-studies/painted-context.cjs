const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const ts = require('typescript');
const root = path.resolve(__dirname,'../..');
const out = path.join(root,'.local-m4/house-structure');
const data = file => 'data:image/png;base64,'+fs.readFileSync(path.join(root,'art/studies/neighborhood',file)).toString('base64');

async function main(){
    const textures=JSON.parse(fs.readFileSync(path.join(out,'study-textures.json'),'utf8'));
    const compile = file => ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {
        compilerOptions: { target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext },
    }).outputText.replace(/^import .*;\r?\n/gm,'').replace(/\bexport /g,'');
    const renderer=compile('src/game/presentation/painted-neighborhood.ts')+
        compile('src/game/presentation/neighborhood-raster.ts').replaceAll('return displayCanvas();','return canvas;');
    const browser=await chromium.launch();
    try{
        const page=await browser.newPage({viewport:{width:1350,height:1050}});
        const result=await page.evaluate(async ({textures,left,cottage,tree,hedge,renderer})=>{
            const load=async src=>{const img=new Image();img.src=src;await img.decode();return img;};
            const imageBounds=img=>{
                const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
                const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
                const rgba=ctx.getImageData(0,0,c.width,c.height).data;
                let minX=c.width,minY=c.height,maxX=-1,maxY=-1,transparent=0;
                for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
                    if(rgba[(y*c.width+x)*4+3]<16){transparent++;continue;}
                    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
                }
                return {x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,transparent};
            };
            const [leftImg,cottageImg,treeImg,hedgeImg,current,stand,person0,person1]=await Promise.all(
                [left,cottage,tree,hedge,textures.current,textures.stand,textures['customer-0-0'],textures['customer-1-0']].map(load));
            const leftBounds=imageBounds(leftImg),cottageBounds=imageBounds(cottageImg),treeBounds=imageBounds(treeImg),hedgeBounds=imageBounds(hedgeImg);
            const make=()=>{const c=document.createElement('canvas');c.width=300;c.height=240;return c;};
            const actors=ctx=>{
                ctx.drawImage(stand,93.75,112.5,27,33);
                ctx.drawImage(person0,127.5,147,13.125,22.3125);
                ctx.drawImage(person1,154,134,13.125,22.3125);
            };
            const before=make(),old=before.getContext('2d');old.imageSmoothingEnabled=false;
            old.drawImage(current,0,0);actors(old);
            const after=make(),ctx=after.getContext('2d');ctx.imageSmoothingEnabled=false;
            const raster = new Function(renderer+';return neighborhoodRaster;')();
            ctx.drawImage(raster({left:leftImg,cottage:cottageImg,tree:treeImg,hedge:hedgeImg}),0,0);
            actors(ctx);
            return {before:before.toDataURL(),after:after.toDataURL(),leftBounds,cottageBounds,treeBounds,hedgeBounds,placementSource:"src/game/presentation/painted-neighborhood.ts"};
        },{textures,left:data('left-house-painted-v2.png'),cottage:data('foreground-cottage-v1.png'),tree:data('yard-tree-v1.png'),hedge:data('garden-hedge-v1.png'),renderer});
        fs.writeFileSync(path.join(out,'painted-placement.json'),JSON.stringify({leftBounds:result.leftBounds,cottageBounds:result.cottageBounds,treeBounds:result.treeBounds,hedgeBounds:result.hedgeBounds,placementSource:result.placementSource},null,2));
        fs.writeFileSync(path.join(out,'painted-context.html'),`<!doctype html><html lang="ko"><meta charset="utf-8"><title>주택 래스터 시안 · 지도 합성 검토</title><style>body{margin:24px;background:#202823;color:#eee;font:15px/1.7 system-ui}h1{font-size:24px}main{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0;width:600px}img{display:block;width:600px;height:480px;image-rendering:pixelated}.small figure,.small img{width:300px}.small img{height:240px}.gray img{filter:grayscale(1)}button{padding:9px;margin:8px}figcaption{font-weight:bold;margin:8px 0}p{max-width:1200px}</style><h1>주택 래스터 후보 · 같은 크기의 지도 합성</h1><p>왼쪽은 기존 배경(PR249), 오른쪽은 구조 시안을 바탕으로 제작한 래스터 건물입니다. 도로 형상·카트·사람의 위치와 크기는 같습니다. 오른쪽은 건물·진입로·초점 검토 단계로, 나무와 생울타리도 같은 화풍으로 맞춘 통합 후보입니다. 현재 작업 브랜치의 게임 렌더러와 같은 합성 구현을 사용합니다.</p><button onclick="document.body.classList.toggle('small')">300px / 600px</button><button onclick="document.body.classList.toggle('gray')">흑백 보기</button><main><figure><figcaption>기존 배경(PR249)</figcaption><img src="${result.before}"></figure><figure><figcaption>래스터 주택 합성 후보</figcaption><img src="${result.after}"></figure></main><p>검토 항목: 처마와 기초선의 평행 · 현관 계단의 접지 · 위쪽 집 진입로의 연결 · 전경 지붕과 보행자의 분리 · 사람 대비 문 크기 · 건물 창이 카트보다 눈에 띄는지.</p></html>`);
        await page.goto(pathToFileURL(path.join(out,'painted-context.html')).href);
        await page.screenshot({path:path.join(out,'painted-context-board.png'),fullPage:true});
        for(const name of ['before','after']) fs.writeFileSync(path.join(out,`painted-context-${name}.png`),Buffer.from(result[name].split(',')[1],'base64'));
        console.log(JSON.stringify({leftBounds:result.leftBounds,cottageBounds:result.cottageBounds,placementSource:result.placementSource}));
    }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
