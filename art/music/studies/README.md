# Music candidate v2

User priority: match the original game's atmosphere and instrument texture. The original reference's audible arrangement has **not** been verified. These newly composed ensemble studies are proposals for comparison, not accepted replacements. Keep #113's listening, fatigue, device and final musical acceptance open. No original-game recordings or unverified legacy bgm.mp3 are used.

Read [the Korean research brief](v2/brief.ko.md). Scores/MIDI describe new project compositions. Instrument recordings are pinned CC0 Meta Open Sound and VCSL selections in `v2/sample-sources.json`; original license texts are included. Meta's selected inputs are OGG previews, not lossless masters. Do not describe the entire source chain as lossless. The final runtime encoding is lossless FLAC of the rendered candidate.

From the repository root, Python 3.10 or later:

```powershell
python -m venv .local-m4/audio-venv
.local-m4/audio-venv/Scripts/python.exe -m pip install -r art/music/studies/v2/requirements.txt
.local-m4/audio-venv/Scripts/python.exe scripts/music-study.py --fetch
```

`--fetch` downloads only selected pinned CC0 samples and validates their recorded SHA256 values. Omit it when the sample cache exists. This is an offline authoring tool, not a game runtime dependency. It regenerates JSON scores, MIDI, WAV masters, OGG auditions, 33 runtime FLAC segments, hashes and the static URL manifest. The HTML template is copied into `.local-m4/music-v2-audition/index.html`. Open it locally to compare; only one audio element plays at a time. Browser HTML-media OGG looping may have a gap; runtime playback uses the separate gap-tested segment scheduler.

Export exactly the runtime recordings for listening:

```powershell
$env:LEMONADE_FFMPEG = & .local-m4/audio-venv/Scripts/python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
npm run audio:export
```

Capture and verify the actual production MusicPlayer's chunk and full-song seams (requires npm dependencies and Playwright Chromium):

```powershell
node scripts/music-loop-capture.cjs
.local-m4/audio-venv/Scripts/python.exe scripts/music-loop-check.py
```

This explicitly seeks close to each boundary for a technical capture, without altering a business or recording microphone/system audio. Decoded output correlation must exceed 0.9 and timing error must stay below 30ms. The initial HTML-media candidate failed at about 66ms; keep the threshold. Candidate segment results are approximately 0 to one 44.1kHz sample (0.023ms), not a musical judgement. The source/reference WAVs for checking come from `audio:export`, not another re-encode.

Native checks require an isolated packaged executable via LEMONADE_DESKTOP_EXE. Run test:desktop:audio and test:desktop:performance with LEMONADE_PERF_ENFORCE=1. Do not relax the existing 256MiB segment-average private-memory cap. No public release or main soundtrack replacement is implied by this candidate.

`node scripts/music-soak.cjs` exercises the production scheduler for twenty real
minutes, with ten uninterrupted minutes of each looping track. It records source,
buffer and pending-load bounds in `.local-m4/music-soak/scheduler.json`. This is a
technical continuity/resource check, not a human fatigue or device acceptance.
Its isolated Vite server disables hot reload so authoring changes cannot reset
the probe. Stop any other process using port 8083 before running it.

The runtime URL manifest belongs in `src/game/presentation/music-tracks.ts`:
its `import.meta.url` asset references are browser code, outside the CommonJS
model-test compilation. Cached samples are checked against pinned hashes on
every render. A fresh offline render on 2026-11-03 reproduced all 33 runtime
FLAC segments byte-for-byte.
