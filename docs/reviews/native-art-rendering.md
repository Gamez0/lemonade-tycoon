# Native art in the actual game

The user praised the source drawings but rejected their degraded game rendering.
Retaining native textures was insufficient while the final canvas was640x512 and
Phaser/CSS forced nearest-neighbor pixel rendering. The authored300x240 coordinate
grid is unrelated to the native image resolution and must never become a bitmap
intermediate for the world or stand.

The world remains640x512, rendered into a1280x1024 backing canvas by a2x camera.
Antialiasing and normal browser downscaling replace forced pixelation. Map images
remain1402x1122; stand alpha crops retain their native resolution. The rental
thumbnail alone is300x240 and is never reused as a world texture. Native map image
aliases share their source bitmap; temporary thumbnail canvases are released.

The first actual moving Neighborhood check at the new backing size passed before
the final stand redraws. Validate the complete final asset set on all ten venues,
all four stand tiers, resized/high-DPI windows and the rebuilt Windows package.
Compare source and actual game at equal displayed dimensions; a large source
preview is not evidence of small-window integration. Weather tint is intentional
scene state and must be identified when comparing colors with an untinted source.
Keep the20fps ceiling, zero idle redraws and existing memory/retention checks.

This is render-quality engineering, not human visual acceptance. #97 remains open.

## Completed integration evidence

Model/storage77/77, typecheck, reboot lint and release15/15 passed. The rebuilt
Windows package at3b461a9 passed all40 map/tier combinations and40 relaunches,
schema9 ownership, exact upgrade charges and unchanged background thumbnails.
The native UI suite now checks1280x1024 backing pixels and actively navigates
every rental card at every tested window size, distinguishing clipped carousel
cards from out-of-window controls. Native UI and paid-location migration/replay
passed. Enforced performance passed: idle canvas draws0, after20 days about214MiB
mean private memory, active rendering below the20fps design ceiling.

Full browser run passed66/67; the remaining import/close test sampled a180ms
read delay after it could already have elapsed under load. Replace that timing
window with an explicitly released file-read gate, keeping the same inert/close/
serialization assertions; focused repeated verification passed3/3. Require the
final-head full CI result rather than reporting the earlier run as67/67.

`node art/studies/stand-upgrades-v2/runtime-review.cjs` produces the private
source/actual Windows comparison at identical display dimensions, with optional
matched weather tint and all40 combinations. All40 dimension/selection checks
passed. Default evidence location: `.local-m4/redrawn-stands/`; source-runtime
review HTML and equal-size Neighborhood PNG are self-contained private artifacts.
