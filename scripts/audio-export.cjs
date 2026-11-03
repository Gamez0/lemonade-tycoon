// Export the exact decoded FLAC segments used by the runtime, in playback order.
const fs = require('node:fs'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const out = path.resolve('.local-m4/m7-audio'); fs.mkdirSync(out, { recursive: true });
const executable = process.env.LEMONADE_FFMPEG || 'ffmpeg';
const directory = path.resolve('src/game/assets/music');
for (const name of ['preparation', 'selling', 'results']) {
    const files = fs.readdirSync(directory).filter(f => new RegExp(`^music-${name}-v2-part\\d{2}\\.flac$`).test(f)).sort();
    const count = name === 'results' ? 1 : 16;
    if (files.length !== count || files.some((f,i) => !f.endsWith(`part${String(i).padStart(2,'0')}.flac`))) throw new Error('Missing music segment.');
    const args = ['-hide_banner', '-loglevel', 'error', '-y'];
    for (const file of files) args.push('-i', path.join(directory, file));
    args.push('-filter_complex', files.map((_,i) => `[${i}:a]`).join('') + `concat=n=${count}:v=0:a=1[out]`,
        '-map', '[out]', '-ar', '44100', '-c:a', 'pcm_s24le', path.join(out, `${name}.wav`));
    try { execFileSync(executable, args); }
    catch { throw new Error('Music export needs FFmpeg. Install it or set LEMONADE_FFMPEG to its executable. Game runtime does not require it.'); }
}
console.log(`Bundled ensemble music PCM listening exports: ${out}`);
