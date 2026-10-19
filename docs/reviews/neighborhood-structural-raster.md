# Neighborhood structural studies and raster candidate

2026-10-20 KST. Follows the user's rejection of PR249 and the recorded
`neighborhood-redesign-plan.md`. This is a new implementation candidate; prior
technical success did not establish acceptable art.

## What was examined before surface work

The reproducible three-value board compares three complete left houses with the
same footprint width and different wall/depth/roof proportions. Their floor,
wall, roof, porch posts, platform and steps share world-space definitions.
The same houses are then shown cropped at the actual left edge. Initial review
found the door outside the visible crop; opening/porch positions were moved
before material work. Candidate A became the structural reference.

Two complete foreground roofs were compared without dormers: a gable and a hip.
Actual projected face visibility replaced the previous independent screen-space
triangle. An incorrect face winding in the study was caught in its first render
and corrected. The gabled cottage became the material reference. These studies
are geometry evidence, not finished illustration or recovered original rules.

The whole blockout includes the existing road and the actual product's cart and
customer textures at their existing display scales. Upper houses and their
entrance paths were designed together. The first painted composition exposed
overlapping upper roofs, so the right-hand house moved14 logical pixels right.

## Production method and self-review

The bare geometry remained schematic. Instead of decorating that model further,
the built-in image-generation tool produced independent transparent house,
cottage, tree and hedge candidates from our own structural/style references.
The first house's eave/foundation angles drifted; it was rejected and a targeted
orthographic correction produced v2. No original-game pixels were input.
Exact prompts, original alpha PNGs, selected/rejected roles and reproduction
commands are retained in `art/studies/neighborhood/README.md`.

Review at300px and600px found the porch/steps, inset windows and supported roofs
readable together. Canopy masses and a forked trunk replace the nested circles;
hedges now share their foliage palette. Door-to-pavement paths follow the ground
projection. The camera crop is evaluated with the complete building, not only
its visible fragment. Openings and material planes remain quiet enough to read
at the intended size; roof detail is still a future refinement opportunity.

The first nearest-neighbor reduction of the large source introduced roof noise.
Selected images are now averaged onto the logical map once; enlargement of that
finished grid remains nearest-neighbor. Grass noise was withheld. Review also
found pavement seams outside the concrete; the seams are clipped to the exact
existing pavement polygon minus asphalt. Road boundaries and service/walk routes
have not been redrawn to hide that error.

Private review boards:

- `.local-m4/house-structure/index.html`: whole/cropped three-value studies.
- `.local-m4/house-structure/blockout.html`: two whole-map massing candidates.
- `.local-m4/house-structure/raster-review-v2.html`: structural/material pair.
- `.local-m4/house-structure/painted-context.html`: baseline/candidate,300/600px,
  grayscale, identical cart/customer overlays. Uses the actual candidate renderer.

## Integration and validation

Four selected PNGs are preloaded before scene creation and composited once into
the existing640x512 Neighborhood texture. Thumbnail generation uses that same
texture. The asset audit permits only the four named, hashed Neighborhood PNG
families; arbitrary reference PNGs are still rejected. Credits record generation
provenance. Cart/customer behavior, state and save schema are not changed here.

TypeScript, reboot/study lint, production build, release audit15/15 and the full
browser suite47/47 passed. Rebuilt actual Windows UI, location and performance
checks passed; idle scenes had zero continuous redraws and the20-day retention
sample stayed below the provisional private-memory budget. Actual selling UI
review then caught the left tree's base on the pavement, so it moved12 logical
pixels onto the lawn. The final placement is being rebuilt and visually checked;
require current-head remote CI before integration. #229 remains open and #97 user visual
acceptance remains open. This candidate does not claim all original art,
customer identities, other locations or exact pixel parity.

Final-position Windows UI and six actual walking frames subsequently passed.
The first remote Windows run39276256958 caught the shipped-ASAR allowlist still
rejecting PNGs even though the build-directory audit accepted them. Both audits
now share the same narrow asset predicate; the release fixture includes a valid
Neighborhood PNG while arbitrary reference PNGs remain rejected. Verify the
actual packaged archive locally and require the repaired final-head remote run.
