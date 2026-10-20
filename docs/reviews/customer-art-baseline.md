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

The reboot has three adapted profiles (Neighbor, Office worker, Student), each
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

## Problems visible in code and comparison

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
