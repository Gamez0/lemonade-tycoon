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
