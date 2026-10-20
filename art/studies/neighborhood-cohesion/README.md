# Whole-scene cohesion studies

Latest: user requested retained-original color/texture comparison. V5 corrects
the warm palette; v6 lightens mauve/teal roofs and reduces surface detail.
See `reference-color-review.md` and exact `.prompt.txt` files. Only our own
images were supplied to generation; original retained capture remains private
comparison evidence. `reference-preview.cjs` makes a self-contained private
original/v4/v5/v6 board with actual-size/2x and grayscale views. House scale,
pixel-grid conformity and runtime route integration remain unverified.

User preferred the new direction but identified unequal road/sidewalk widths,
disconnected pavement and bad crossings. `environment-v3-streets.png` is a targeted
edit retaining buildings/palette while rebuilding a parallel-edged T junction,
continuous sidewalk corners and one six-bar crossing between branch sidewalks.
Visual review finds the connection substantially clearer. Constant widths are
an art-direction constraint, not a numeric validation of this generated bitmap.
The foreground house occludes part of the far corner; existing walk/service
anchors must be checked against this new footprint before runtime adoption.

2026-10-20 KST. Built-in image-generation tool; exact prompts retained alongside
original unmodified output. Input is our own PR250 map composite; no original
game screenshot, artist tutorial image or decoded resource was provided.

`whole-scene-v1.png` is a direction study, not a production background. It
improves ground/building palette cohesion and contact shadows, but roof patterns
remain repetitive. It also redraws the people/cart and approximate boundaries;
it must not be shipped with those baked into a static environment.

Next controlled edit removes actors/cart and crossing marks and suppresses
roof/grass noise. Compare both at300x240 and600x480 before selecting anything.
Existing product art stays intact; this folder is not imported by the renderer.
User acceptance remains open in #97. Research and diagnosis are in
`docs/reviews/neighborhood-art-research-20261020.md`.

`environment-v2.png` removes generated people/cart and reduces roof texture.
Inspected both at300px and600px in Chromium, including the actual existing cart
and customer textures at identical study positions/scales. The quieter roofs
read better; original actors remain noticeably coarser than the illustrated
background. The whole generated image still contains finer-than-logical detail:
CSS downscaling is a review, not proof of a clean authored300x240 pixel grid.
Do not claim the pixel-scale mismatch is solved or production integration done.

Run `node art/studies/neighborhood-cohesion/preview.cjs` from the product root.
It uses the retained private PR250 `study-textures.json` and writes a screenshot
and self-contained HTML in `.local-m4/neighborhood-cohesion/`. No game rules or
production renderer were changed. Next implementation unit is a masked-ground
integration experiment, checking every pedestrian/service anchor against the
generated boundaries before considering a background replacement.
