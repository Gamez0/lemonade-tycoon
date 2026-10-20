# Reference color/material comparison — 2026-10-20

User authorized comparison against retained original captures and asked to bring
color and texture closer while continuing the improved direction. The prior
house-size correction remains incomplete; do not claim equal scale is established.

Reference inspected: existing private
`D:/lemonade-loop/.local-m4/same-location-20261018/reference-study.png`.
This is a retained research crop, not a new original-game capture. It is not a
production asset and was NOT supplied to the image-generation model. Only our
own v4 study was supplied; the observed color/material differences were described
in words. No source-game pixels are incorporated into the candidate asset.

Observed relative to v4:

| Surface | Retained reference | v4 | Requested change |
| --- | --- | --- | --- |
| Lawn | Saturated mid emerald with sparse fine flecks | Olive with large yellow grass tufts | Cooler emerald, much finer sparse marks |
| Sidewalk | Light neutral gray | Warm cream | Remove golden cast, quieter seams |
| Road | Deep neutral charcoal, broad quiet plane | Blue-gray gradients | Neutralize and flatten |
| Left roof | Quiet dusty pink/mauve | Strong terracotta red | Muted mauve, minimal texture |
| Upper houses | Brown walls, green roofs | Yellow walls, navy roofs | Tan/brown and deep green |
| Foreground roof | Pale muted cyan/teal | Dark navy | Lighter blue-green |
| Rendering | Thin contours and economical flat shading | Rich trims, foliage highlights and soft gradients | Limit shading and surface noise |

These are visual observations, not calibrated source-color measurements.
Preserve corrected street topology, continue shared door/story scale work and
compare reference/v4/new study at300x240 and600x480. Reference stays private.
Runtime integration and #97 visual acceptance remain open.

First result `environment-v5-reference-color.png` improves the neutral sidewalk,
emerald lawn and plum/brown/green house palette relative to v4. Chromium board
compares retained reference/v4/v5 at300x240 and600x480. Self-review still finds
leaves/trim overrendered and the foreground teal roof darker than the reference.
A controlled follow-up lightens quiet roof planes and simplifies foliage/window
clusters. No numeric color matching, grid conformity or correct house scale is
claimed. Existing house-scale and street-boundary checks remain outstanding.

Reproduce private source comparison:
`node art/studies/neighborhood-cohesion/reference-preview.cjs`.
The resulting self-contained HTML remains under ignored `.local-m4/`; original
reference pixels must not be moved into the product or public study assets.

Second result `environment-v6-reference-texture.png` lightens the mauve/teal
roofs and groups foliage shading, removes most shingle marks and simplifies
windows. It is closer in broad palette and quiet roof treatment, but foliage
still reads more like outlined illustration than the reference's small sprite
clusters. This is progress in direction, not a claim of visual equivalence.
Both outputs and exact prompts retained. Actual Chromium reference/v4/v5/v6
board is the review deliverable; no runtime game files changed.
