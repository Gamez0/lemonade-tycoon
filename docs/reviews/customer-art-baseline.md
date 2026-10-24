# Customer art baseline and next replacement contract

Follow-up to #257; simulation identities remain #228 and behavioral facing #16.
This research records the next required art change, not a completed sprite pass.

## Evidence and equal scale

The retained private original atlas has980 frame entries:49 visual characters,
four groups and five frames per group. Each restored source cell is22×34. The
parent legacy renderer interprets groups as SE, NE, NW, SW. That interpretation
is useful comparison context; it is not newly measured original movement logic.
Forty-nine visual families must not be described as49 simulation profiles, and
their order must not be silently assigned to the eleven decoded behavior types.

The47e4376 reboot baseline has three adapted profiles (Neighbor, Office worker, Student), each
with four20×34 code-generated textures. The actual scene draws them at1.4× in
a640×512 world. Thus their whole source cell is13.125×22.3125 when normalized to
the same300px map width as the original. Comparing the original22×34 cell with
the current28×47.6 world-space cell without normalizing map width is misleading.
The body occupies less than the source cell because of transparent margins.

`node art/studies/remaining-images/customers-review.cjs <legacy-parent-root>`
creates a private contact sheet with all980 restored original frames and12 actual
current textures. It executes the unchanged current production drawing function
inside Phaser, stubbing only background creation, rather than redrawing a mock
baseline. It restores atlas trim offsets before displaying original cells and
uses equal300px map width for both families. Original source pixels and generated
comparison HTML remain in ignored `.local-m4/customer-art`.

## Problems visible in the47e4376 baseline

- Current poses0/1 provide only two stride states; pose3 raises a cup. Pose2 draws
  a rear view but `street-scene.ts` never selects it. Horizontal mirroring cannot
  turn a front torso into a rear torso on a path leading away from the viewer.
- Current walking departures generally use the unmirrored front texture even
  when the authored route segment runs left. Waiting/serving face the stand using
  a horizontal relation, which alone does not select a correct front/back group.
- The three current silhouettes repeat the same short-haired adult body. Their
  profile color change is insufficient to convey the original range of age,
  clothing, hats, skirts, body proportions and direction-dependent occlusion.
- Normalized bodies are smaller and less detailed than the original reference;
  increasing source PNG resolution alone would preserve that scale mismatch.

## Replacement contract

1. Record the intended visual family separately from simulation profile ID. Start
   with the existing three roles and an explicit adapter; coordinate later eleven
   behavior types with #228 without changing old paid-opening replay or saves.
2. Independently create four consistent diagonal directions per visual family,
   a coherent five-frame walk cycle, an idle/queue pose and a cup/drinking pose.
   Review front/back clothing and matching anatomy before integration. Original
   sprites are private observational references, never generation image inputs.
3. Set a measured foot anchor for every frame. Preserve the anchor through crop,
   pose changes and mirroring; keep shadow and body dimensions documented. Judge
   body height relative to the same displayed map width and the stand's service
   counter, rather than selecting a scale from a large isolated preview.
4. Use the local route tangent to select walking direction; face the actual
   stand/service point while waiting and buying. Handle zero-length/near-stationary
   segments without flickering. Reduced motion retains a correctly oriented idle
   pose. Keep routes, business timing and transactions independent from art.
5. Retain native transparent frames with normal filtering through the1280×1024
   backing canvas. Do not crush frames back into20×34 intermediates. Use a bounded
   atlas and reuse textures; measure decode/storage size and20-day retention.
6. Compare old/current/revised at equal map width and inspect real moving scenes
   on all ten routes, including queue depth, stand occlusion, turns, sold-out exits
   and purchased-cup departures. Confirm package provenance, normal Windows and
   small-window rendering. A sharp sprite sheet does not prove good animation.

No new customer art or directional behavior is shipped by this research commit.
The staff portrait pass is separate; remaining equipment, ingredients, weather,
report and navigation illustrations are still open in #257. #97 remains the human
visual acceptance gate.

## First generated Neighbor sheet studies

`customer-neighbor-sheet-v1.png` and `v2.png` are independently generated studies,
not product imports. The first input was our own Neighborhood map; the edit input
was our ownv1 sheet. Exact prompts are adjacent. Each1254px square has20 nominal
cells (four direction rows, five walk phases). Four front/back directions read
clearly, but the cycle repeats similar leading-leg positions and does not yet
establish a coherent complete alternating gait. Adult proportions and matching
body height also need review against the normalized original board. Neither
candidate is selected for production; idle, queue and drinking poses are missing.

The large preview initially appeared to have bright colored cutout fringes.
Read-only alpha inspection corrects that interpretation: v1 has9469 andv2 has8397
saturated-red pixels with nonzero alpha, but **none has alpha16 or higher**; their
maximum alpha is5/255. RGB-only counts are not evidence of a visible red outline.
Inspect the composite on green/white/dark backgrounds before altering alpha.

`customer-sheet-review.cjs [candidate-path]` measures all20 cell bounds and alpha,
and builds private `.local-m4/customer-art/candidate-motion.html` with four
directions at8fps, fixed foot baseline,48/64px sizes and background switching.
It clips the selected source cell while retaining native pixels; it is a study
player, not actual game footage. Candidate playback needs reviewer inspection
before any route/pose adapter or production asset is introduced. Keep #257 open.

## Resumed study - 2026-10-24 KST

User correction: the original does not describe faces at this level of detail.
User clarified this applies to people moving on the map. Staff catalogue
portraits were described positively and should retain their current detail.
Do not extend the pedestrian simplification to staff portrait illustrations.
v1-v3 overstate eyes, nose, mouth and expression, with a large cartoon head.
Reject this visual direction, including the v3 idle/drink designs. Future work
must start at equal displayed map width: small restrained head, minimal facial
marks, and identity conveyed by clothing, silhouette and body direction.
Do not preserve the detailed generated face as the next edit's identity target.
The private original board was inspected again at its native22x34 cell size.

Main47e4376 post-merge CI39433213062 and draft259 headf0b74a0 CI39433641620
completed successfully, including Windows packaged saves. The draft remains a
study; those checks do not establish animation quality.

v3 is a built-in image-generation edit of our ownv2 only. Exact prompt is
`art/studies/remaining-images/customer-neighbor-sheet-v3-prompt.txt`.
The unchanged native1254-square output now has24 cells: four directions and
four requested walk phases, idle and drinking. Idle and cup-to-mouth poses are
present. Visual inspection still finds the same leading leg across the walk
columns, with only small limb changes: **reject its walk cycle for production**.
Do not describe this as a completed alternating gait or ship the sheet.
All14644 saturated-red nonzero-alpha pixels remain at alpha5 or lower;
none reaches16. Preserve alpha rather than deleting pixels by RGB.

The reviewer accepts an optional column count:
`node art/studies/remaining-images/customer-sheet-review.cjs art/studies/remaining-images/customer-neighbor-sheet-v3.png 6`.
It loops only the first four columns; Next pose pauses and steps all six.
v1/v2 still default to five walking columns. Each input now gets a separate
ignored output folder, preserving earlier evidence. v2 and v3 regenerated
successfully (20 and24 measured cells). Next independent implementation is
route-tangent/stand-facing selection with the current art, while native
replacement gait remains unresolved. Keep #97 and #16 manual acceptance open.

## Minimal-face restart

`customer-neighbor-minimal-v1.png` is a new text-only built-in generation,
not an edit of v1-v3. Its exact adjacent prompt explicitly removes large eyes,
smiles and detailed facial features. Four standing directions have smaller
heads, plain skin shapes and understated eye marks. This addresses the excessive
facial detail, but remains a study: no walk cycle, idle/drink set or final scale
has been accepted or shipped.

Native output1774x887 is preserved unchanged. The private reviewer measures
four opaque body bounds and shows22/26/30px body heights against the same300px
Neighborhood map, plus68px inspection views. All four measured/decode checks
passed. `node art/studies/remaining-images/customer-minimal-review.cjs` writes
ignored `.local-m4/customer-art/minimal-v1/review.html`, PNG and measurements.
Compare native original22x34 cells before selecting a body scale; whole-cell
height is not opaque-body height. No original pixels were generation inputs.
Read-only atlas metadata measurement of196 first-phase frames (49 visual
families x4 directions) gives median trimmed frame10x26, height range21-27.
These are atlas rectangle bounds, not claimed pixel-exact opaque-body bounds.

The follow-up `customer-neighbor-minimal-walk-v1.png` edits only our own
minimal-face idle study. Exact prompt is adjacent. It requests two opposing
contacts in four direction columns. Output1536x1024 still repeats the leading
leg across both rows, so it is rejected as a walk cycle. Keep the simpler face
direction, but do not integrate this animation. Do not infer an opaque brown
background from the tool preview: inspected between-figure samples have alpha0
despite colored RGB; the PNG has1046443 fully transparent pixels.
No generation remains pending. Need a controllable coherent gait, not additional
nearly identical full-sheet attempts. Staff portraits retain their current detail.

## Code-native articulation study

Production PR260 has since integrated route/counter direction selection and
rear stride/cup combinations in main334f052. The private twelve-texture board
above intentionally retains the pre-change47e4376 baseline; its unused-rear
observation is historical. Replacement art still needs its own route validation.

`node art/studies/remaining-images/customer-rig-review.cjs` creates a separate
code-native SVG study for Neighbor. Four isometric directions each have four
opposing walk phases, idle and drinking (24 vectors). Limb positions are
controlled directly, with small heads, minimal facial marks and fixed32,87
ground anchors. Body bob applies to upper anatomy rather than lifting grounded
feet. The6-column contact sheet and nominal26px body playback expose leg/arm
alternation, silhouette and occlusion. Frames/keypoints and measured bounds are
written only to ignored `.local-m4/customer-art/rig`.

Node syntax and Chromium rendering of all24 poses pass, with no console/page
errors and no viewBox clipping. An initial west-facing SVG nose path error was
corrected and the whole study rerun. This proves controllable distinct phases,
not final animation quality. Thin limb shapes, shirt volume/material density,
three-role variation and walking-with-cup poses remain unresolved. No procedural
candidate is selected or imported into the game. Compare against the private
original and minimal-face study at the same map width before proceeding.

The rig reviewer also provides nominal22/26/30px body comparisons on our own
300px Neighborhood map, with the actual native Basic stand crop/floor anchor,
an idle NW-facing service figure and SE-facing through figure. Ground-depth
ordering is explicit. These are labelled context composites, not game footage.
The torso/sleeve shapes were widened after the first thin-body inspection.
All24 bounds/console checks reran successfully. Final body scale and production
material/anatomy quality remain unaccepted.
