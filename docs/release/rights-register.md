# Distribution source and notice register

Reviewed 2026-10-09 KST against clean Windows candidate source d1fb1ae,
its actual app.asar and checked-in source. This is a factual inventory; final name
and contributor-rights acceptance remain open in issue167.

| Content | Maintained source | Included evidence | Remaining acceptance |
| --- | --- | --- | --- |
| Simulation/interface | src/game/simulation, src/reboot.ts, src/game/presentation | Source history and compiled reboot bundle | Contributor distribution authority |
| Location/customer art | src/game/presentation/art.ts and street-scene.ts | Code-authored geometry in bundle | Visual/contributor acceptance |
| UI/application icons | icons.ts, src/desktop/icon.svg and icon.ico | SVG source and packaged ICO | Visual/contributor acceptance |
| Music/effects | src/game/content/audio-scores.ts and presentation/audio.ts | Score/synthesis source and WAV listening exports | Human listening/contributor acceptance |
| Store images/video | scripts/store-capture.cjs and store-video.cjs | Actual scene/gameplay captures with source/hash records | Final media acceptance; title pending |
| Repository template | LICENSE | Unaltered license inside app.asar | Retain notice |
| Phaser3.88.2 | node_modules/phaser/LICENSE.md | LICENSE-Phaser.txt inside app.asar | Retain notice |
| Oswald | public/fonts/Oswald-wght.ttf and OFL-Oswald.txt | Font and dist/licenses/OFL-Oswald.txt inside app.asar | Retain notice |
| Electron44.5.1 | Packaged runtime | LICENSE at package root | Retain notice |
| Chromium/runtime components | Packaged runtime | LICENSES.chromium.html at package root | Retain complete notice file |
| Reference screenshots/legacy assets | docs/research and public/assets | Excluded from PC inputs and archive | Keep excluded from PC/store distribution |

The reviewed candidate's fifteen archive files were inspected. Three project/font
notices match source bytes; both runtime notices are present. No separate reference
or legacy image/audio files are included. Desktop builds use publicDir=false and
one reboot entry. Artwork and sound use the code sources above; git author records
alone do not establish distribution authority.

Repeat with node scripts/audit-package.cjs VERIFIED_PACKAGE. Windows CI runs this
after packaging and rejects missing/altered notices, unexpected archive content,
links and unpacked files. Failure-injection release tests cover omitted notices,
changed font terms and embedded research. The manifest separately checks the whole
distribution's bytes and build identity.

Before commercial distribution, confirm the proposed Willow Lane Lemonade name
and intended markets; contributor authority for code/art/icons/music; and final
visuals, sound and store materials. Preserve accepted sources/checksums. Retain
every license/credit in ZIP and Steam depot. Notice completeness does not establish
final rights or Steam approval.
