// Render a local gameplay preview with an original score; no upload or publication.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('.local-m4/m9-store');
const videoRoot = path.join(root, 'video');
const input = fs.readdirSync(videoRoot).filter(name => name.endsWith('.webm')).map(name => path.join(videoRoot, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
if (!input) throw new Error('Run npm run store:capture first.');
const wave = fs.readFileSync(path.resolve('.local-m4/m7-audio/selling.wav')).toString('base64');
let browser;
(async () => {
    try {
        browser = await chromium.launch(); const page = await browser.newPage();
        const result = await page.evaluate(async ({ videoBytes, wave }) => {
            const bytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
            const video = document.createElement('video'); video.muted = true;
            const inputUrl = URL.createObjectURL(new Blob([bytes(videoBytes)], { type: 'video/webm' }));
            video.src = inputUrl;
            await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; });
            const canvas = document.createElement('canvas'); canvas.width = 1920; canvas.height = 1080;
            const c = canvas.getContext('2d');
            const audio = new AudioContext({ sampleRate: 48000 });
            const source = audio.createBufferSource(); source.buffer = await audio.decodeAudioData(bytes(wave).buffer); source.loop = true;
            const gain = audio.createGain(); gain.gain.value = .25;
            const destination = audio.createMediaStreamDestination(); source.connect(gain); gain.connect(destination);
            const stream = canvas.captureStream(30); for (const track of destination.stream.getAudioTracks()) stream.addTrack(track);
            const mimeType = 'video/mp4;codecs=avc1.640028,mp4a.40.2';
            if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('This browser cannot render MP4.');
            const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
            const chunks = [];
            const stopped = new Promise((resolve, reject) => { recorder.ondataavailable = event => chunks.push(event.data); recorder.onstop = resolve; recorder.onerror = event => reject(new Error(String(event.error))); });
            let frame;
            function draw() { c.drawImage(video, 0, 0, 1920, 1080); frame = requestAnimationFrame(draw); }
            c.drawImage(video, 0, 0, 1920, 1080); recorder.start(); source.start(); await audio.resume();
            const finished = new Promise(resolve => { video.onended = resolve; });
            await video.play(); draw(); await finished;
            cancelAnimationFrame(frame); recorder.stop(); await stopped;
            source.stop(); for (const track of stream.getTracks()) track.stop(); await audio.close(); URL.revokeObjectURL(inputUrl);
            const blob = new Blob(chunks, { type: mimeType });
            const base64 = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(blob); });
            return { base64, mimeType: recorder.mimeType, duration: video.duration, bytes: blob.size };
        }, { videoBytes: fs.readFileSync(input).toString('base64'), wave });
        fs.writeFileSync(path.join(root, 'gameplay-preview.mp4'), Buffer.from(result.base64, 'base64'));
        delete result.base64;
        fs.writeFileSync(path.join(root, 'video-info.json'), JSON.stringify({ ...result, scope: 'Actual gameplay recording with separately mixed original selling music; development trailer draft, editing/listening review pending', input: path.basename(input) }, null, 2));
        console.log(JSON.stringify(result));
    } finally { await browser?.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
