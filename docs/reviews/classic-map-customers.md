# Map customer rework after user rejection — 2026-10-24 KST

The user describes the moving map customers as uncanny and asks for analysis
and an original-style replacement. This supersedes any visual-acceptance
implication from PR265. Its technical passing evidence remains valid for its
technical scope. Detailed Staff portraits remain untouched; #97/#16 stay open.

## Equal-scale diagnosis

Compared all retained original direction groups with the actual production
frames on mainf5866a5. Restored atlas offsets and a shared300px map width avoid
independently fitting the sprites. Original source cells22x34 have trimmed
rectangles19–27px high (median24); these rectangles are not opaque-body measures.

The previous art has long thin articulated limbs, widely separated shoes in
contact poses, arms held away from the trunk and round outlined limb ends.
Those are visible anatomical/style problems even though opposing frame hashes,
foot anchors and route-facing checks pass. Three similar tall silhouettes also
give the crowd a mannequin-like repetition. Staff catalogue detail is unrelated.

Original reference people read as compact clothed masses: short natural steps,
arms overlapping the torso, fuller trouser/shirt shapes and small, plain faces.
Their clothing and held items distinguish silhouettes at the actual map scale.
This is a visual diagnosis, not a recovered original skeleton or gait timing.

## Change

Replace the map-only figure drawing with independently authored32x48 pixel
clusters expanded to the existing128x192 cached textures. Resolve source alpha
coverage before nearest sampling so small joints do not become rounded beads.
Use compact layered clothing, short opposing steps/passing poses, restrained
head shading, office coat/tie/briefcase and a student backpack. No original pixel
or atlas is imported into product code, assets, generation or packaging.

At300px map width, source height targets24px; observed candidate alpha128
body heights are23.2–25.6px including pose changes. Preserve the66-frame cache,
front/rear/mirrored four directions, fixed foot origin, reduced motion and
existing queue/service/exit paths. Cup poses remain distinct from ordering.
Profile-to-visual mapping and all business rules/saves stay unchanged. This
does not implement the original49 visual families or eleven behavior profiles.

## Review and verification

`scripts/customer-facing-review.cjs <private-legacy-root>` exercises actual
production rendering across ten maps/eighty actors, frame bounds, facing,
texture reuse, pause and reduced-motion cups. It keeps original input/output
private. `scripts/customer-motion-review.cjs <baseline-review> <candidate-review>
<private-legacy-root>` generates an animated original/before/candidate/cup board
at equal map width, with pause/step controls. Its125ms comparison interval is
explicitly not a measurement of original playback speed. Scene thumbnails are
labelled composites, not actual game footage.

Private local evidence: `.local-m4/review-v1`, `review-v2`, `review-v3` and
`motion-review`. Earlier failed candidates/evidence remain available. Model91
passes; type/lint passed after removing a stale unused visual type. Native
package, full required current-head CI and actual visual capture checks follow
before integration. Native customer review now records six timestamped moving
captures per map, and uses the current immediate-preparation completion flow.

The change aims to match the original's silhouette and movement language;
pixel-identical art or user acceptance is not claimed. Human review stays open.
