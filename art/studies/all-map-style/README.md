# All ten original-location themes — art overhaul

Selected follow-up revisions: train-station-theme-v2.png (wider field, smaller
architecture/furniture) and marina-theme-v2.png (smaller benches). All original
v1s and exact v2 prompts remain. `maps.json` selects the reviewed versions.

2026-10-20 KST. User explicitly confirmed all TEN original location themes,
not only the three currently playable reboot locations. This expands the prior
M5 three-location art coverage. #229 is the active tracking issue; #97 remains open.

Shared direction: orthographic2:1 ground axes, common human door/step/bench scale,
emerald foliage, neutral light-gray paving, quiet roof/material planes, thin
contours and economical texture at300x240. Compare actual-size/2x and with real
cart/customers. Source original resources are read-only research, not assets to ship.

Retained original-theme research images inspected: parent worktree
`.local/reference/expected-{park,downtown,beach,old-square,train-station,mall,marina,stadium,magic-gardens}.png`
and the retained Neighborhood crop in the product `.local-m4/`. The `expected-*`
files are existing resource-composition research, NOT fresh original live captures.
No original image was supplied to generation. Only our own Neighborhood study
and our own current renderer captures were used as image references.

The first `park-v1.png` retained the current Riverside pond and has a foreground
tree intruding into the path. It is a rejected direction for the original Park
theme. `downtown-layout-v1.png` improves existing office forms but retains sparse
unrelated placement. New Park and Downtown theme studies replace those directions
with playground and pocket-square identities found in retained research.

Ten-theme checklist: Neighborhood, Park, Downtown, Beach, Old Square,
Train Station, Shopping Mall, Marina, Stadium, Magic Gardens (theme park).
Exact prompts and unmodified original generated outputs are retained here.
Generated candidates are studies, not verified runtime content or acceptance.
Seven extra themes currently have no playable reboot economy/route implementation;
do not claim that a completed art board adds seven working game locations.

Review: `docs/reviews/all-ten-map-art.md`. Reproduce the self-contained private
atlas with `node art/studies/all-map-style/atlas.cjs`. It reads the preserved
source-reference folder (override with `LEMONADE_REFERENCE_DIR`) and retained
own sprite textures. Output: `.local-m4/all-map-art/atlas.html`, a300px contact
sheet, ten600px sprite-overlay reviews, PNG size/hash manifest and browser checks.
All ten original/reference image pairs decoded, selection10/10 and size/gray/
sprite controls passed without page errors. Both art-study script directories
passed ESLint with zero warnings. No runtime files or save rules were changed.
