# Neighborhood art research — 2026-10-20

User again rejected the map quality and authorized research and alternative AI
models. This supersedes any implication that PR250 established visual acceptance.
Live backlog still selects #229 Running. #97 remains open.

## Evidence and diagnosis

Inspected the PR249 map and the PR250 actual-renderer study
`D:/lemonade-calendar-ci/.local-m4/house-structure/painted-context-after.png`.
The latter is a 300x240 composite with the actual cart/customer textures, not a
new live capture. PR250 improved individual building volumes but the rich roof
and foliage assets remain visibly different from flat ground and coarse actors.
The following are visual judgments, not measured user preferences:

- Roof shingle contrast competes with openings at the logical output size.
- Broad uniform lawns make the buildings look separately placed rather than
  connected by a common lighting/material treatment.
- Repeating the same cottage at different scales weakens neighborhood variety.
- A successful individual high-resolution house is insufficient evidence of a
  successful small integrated game scene.

## Research and application

Primary artist tutorial: [SLYNYRD, Pixelblog 41](https://www.slynyrd.com/blog/2022/11/28/pixelblog-41-isometric-pixel-art).
Uses a practical 2:1 pixel ground projection, consistent projected volumes and
directional plane shading. Apply to footprints, eaves, paths and foundations
together; do not let each generated asset select its own camera.

Primary artist tutorial: [cure, The Pixel Art Tutorial](https://pixeljoint.com/forum/forum_posts.asp?TID=11299).
Explains purposeful pixel clusters, noise, banding and shading based on volume.
Apply by simplifying roof/leaf accents at300x240, keeping large resting surfaces,
and making contrast serve the lemonade cart and customer route.

These sources inform technique, not permission to copy their artwork. No source
artwork was supplied to generation. Only our independently authored map is input.

## Experiment

Generate a single coherent whole-scene art-direction study using the current
composite as layout reference. Preserve the T junction, cropped houses and
service area; unify light, palette and pixel scale across ground and buildings.
This is a study, not a drop-in background: generated actors/cart must never be
baked into a production background, and approximate road geometry must not be
used as verified walk/service coordinates.

Review actual-size readability and preserved topology before integration. If
the study improves cohesion but changes geometry or sprite scale, retain it only
as direction and generate a clean environment layer against a ground mask.
Retain exact prompt and original output with a candid selected/rejected review.

## Model/settings advice boundary

[Official OpenAI configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
separates model selection and reasoning effort; supported levels depend on model
and client. The user's label “Light” alone does not identify a model or establish
image-generation quality. No account settings were changed. Higher reasoning
effort can be trialed for planning/review, but is not evidence of better map art.
The built-in image-generation tool is available without changing account setup.

## Result and next boundary

User follow-up: the whole-scene direction is much better, but road/crosswalk and
sidewalk geometry is wrong. This is positive feedback on direction, not acceptance
of the current network or final game art. The next edit specifically constrains
constant-width road arms, continuous equal-width sidewalks, correct inner corners,
and one zebra crossing connecting the opposing branch sidewalks. Buildings,
palette and atmosphere are invariants. Keep v2 for comparison rather than overwrite.

Two exact-prompt original outputs and an interactive-browser comparison are
retained in `art/studies/neighborhood-cohesion/`. Chromium review succeeded at
300/600px with the actual product sprites overlaid at existing study coordinates.
Candidate2 reduces roof noise and improves palette cohesion, but sprite/background
pixel scales still differ. It is a direction candidate, not an accepted final map.
No simulation tests were needed because no game/runtime files changed. Next:
masked-ground integration study and walk/service anchor checks; do not integrate
an approximate generated junction merely because the whole illustration looks nicer.
