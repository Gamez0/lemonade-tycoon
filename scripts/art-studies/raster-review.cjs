const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname,'../..');
const out = path.join(root,'.local-m4/house-structure');
async function main(){
    const browser = await chromium.launch();
    try{
        const page = await browser.newPage({viewport:{width:1100,height:1000}});
        const version = process.argv[2] || 'v2';
        const image = 'data:image/png;base64,'+fs.readFileSync(path.join(root,`art/studies/neighborhood/left-house-painted-${version}.png`)).toString('base64');
        const result = await page.evaluate(async data=>{
            const img = new Image();img.src=data;await img.decode();
            const source = document.createElement('canvas');source.width=img.width;source.height=img.height;
            const context=source.getContext('2d');context.drawImage(img,0,0);
            const pixels=context.getImageData(0,0,img.width,img.height).data;
            let minX=img.width,minY=img.height,maxX=-1,maxY=-1,transparent=0;
            for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){
                const alpha=pixels[(y*img.width+x)*4+3];
                if(alpha<16){transparent++;continue;}
                minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
            }
            const w=maxX-minX+1,h=maxY-minY+1;
            const canvas=document.createElement('canvas');canvas.width=300;canvas.height=240;
            const ctx=canvas.getContext('2d');ctx.fillStyle='#eeeae0';ctx.fillRect(0,0,300,240);ctx.imageSmoothingEnabled=false;
            ctx.drawImage(img,minX,minY,w,h,75,30,150,150*h/w);
            return {image:canvas.toDataURL(),width:img.width,height:img.height,bounds:{minX,minY,maxX,maxY},transparent,visibleWidth:150,visibleHeight:150*h/w};
        },image);
        fs.writeFileSync(path.join(out,`raster-metadata-${version}.json`),JSON.stringify({...result,image:undefined},null,2));
        fs.writeFileSync(path.join(out,`raster-review-${version}.html`),`<!doctype html><meta charset="utf-8"><title>집 래스터 후보 검토</title><style>body{margin:24px;background:#202823;color:#eee;font:15px/1.7 system-ui}main{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0;width:300px}img{width:300px;height:240px;image-rendering:pixelated}.large img,.large figure{width:600px}.large img{height:480px}button{padding:9px;margin:8px}h1{font-size:24px}p{max-width:1000px}</style><h1>왼쪽 집: 구조 시안과 래스터 후보</h1><p>원본 생성 이미지를 고치지 않고, 투명 여백의 경계를 구해 집 폭150px로 표시했습니다. 그림의 완성도와 별개로 평행선·현관 위치·표시 크기·배경 합성이 맞아야 제품에 사용할 수 있습니다.</p><button onclick="document.body.classList.toggle('large')">300px / 600px</button><main><figure><figcaption>공유 꼭짓점 구조</figcaption><img src="A.svg"></figure><figure><figcaption>래스터 미술 후보 ${version}</figcaption><img src="${result.image}"></figure></main>`);
        await page.goto(pathToFileURL(path.join(out,`raster-review-${version}.html`)).href);
        await page.screenshot({path:path.join(out,`raster-review-board-${version}.png`),fullPage:true});
        console.log(JSON.stringify({...result,image:undefined}));
    }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
