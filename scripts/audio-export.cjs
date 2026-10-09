// Listening masters for the same code-authored score used at runtime.
const { AUDIO_SCORES, AUDIO_STEP_SECONDS } = require('../.test-build/content/audio-scores.js');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve('.local-m4/m7-audio'); fs.mkdirSync(out, { recursive: true });
for (const [name, notes] of Object.entries(AUDIO_SCORES)) {
    const rate = 44100, step = AUDIO_STEP_SECONDS[name];
    const samples = Math.ceil(notes.length * step * rate), data = Buffer.alloc(44 + samples * 2);
    data.write('RIFF'); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16);
    data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28);
    data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(samples * 2, 40);
    for (let sample = 0; sample < samples; sample++) {
        const seconds = sample / rate, index = Math.floor(seconds / step), t = seconds - index * step, midi = notes[index];
        let value = 0;
        if (midi && t < .32) {
            const frequency = 440 * 2 ** ((midi - 69) / 12);
            const envelope = t < .015 ? t / .015 : Math.exp(Math.log(.0001 / .12) * (t - .015) / (.32 - .015));
            value = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t)) * envelope * .12;
        }
        data.writeInt16LE(Math.round(value * 32767), 44 + sample * 2);
    }
    fs.writeFileSync(path.join(out, `${name}.wav`), data);
}
console.log(`Original score listening masters: ${out}`);
