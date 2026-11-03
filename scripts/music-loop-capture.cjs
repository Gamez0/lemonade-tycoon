// Capture the production MusicPlayer's output, with an explicit test-only seek.
// No microphone, system audio or original-game recording is used.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs'), path = require('node:path');
const out=path.resolve('.local-m4/music-segment-qa');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--config','vite/config.dev.mjs','--host','127.0.0.1','--port','8082','--strictPort'],{stdio:'ignore',windowsHide:true});
let browser;
(async()=>{
 try {
  for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:8082')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch();const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8082');await page.locator('#menu-continue').click();
  const records=[];
  for(const cue of ['preparation','selling'])for(const seam of ['chunk','wrap']){
   const result=await page.evaluate(async({cue,seam})=>{
    const {MusicPlayer}=await import('/src/game/presentation/music-player.ts');
    const {MUSIC_TRACKS}=await import('/src/game/presentation/music-tracks.ts');
    const context=new AudioContext({sampleRate:44100});await context.resume();
    const destination=context.createMediaStreamDestination();
    const player=new MusicPlayer(context,()=>{});
    player.output.disconnect();player.output.connect(destination);player.volume(1);
    const track=MUSIC_TRACKS[cue],boundary=seam==='wrap'?track.seconds:track.segmentSeconds;
    const startTime=boundary-2.5;player.positions[cue]=startTime;
    const recorder=new MediaRecorder(destination.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:128000});
    const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
    const stopped=new Promise(resolve=>recorder.onstop=resolve);
    recorder.start();player.play(cue);await new Promise(r=>setTimeout(r,7000));recorder.stop();await stopped;
    player.pause();await context.close();
    const buffer=new Uint8Array(await new Blob(chunks).arrayBuffer());
    let binary='';for(let i=0;i<buffer.length;i+=8192)binary+=String.fromCharCode(...buffer.subarray(i,i+8192));
    return{duration:track.seconds,startTime,boundary,audio:btoa(binary)};
   },{cue,seam});
   fs.writeFileSync(path.join(out,`${cue}-${seam}.webm`),Buffer.from(result.audio,'base64'));delete result.audio;
   records.push({cue,seam,...result});console.log('Captured MusicPlayer seam:',cue,seam);
  }
  fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify(records,null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
