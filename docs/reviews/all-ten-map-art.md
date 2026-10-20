# All ten location themes — first art pass

2026-10-20 KST. User explicitly chose all ten original location themes, extending
the earlier three-location reboot art scope. The active engineering issue remains
#229; human visual acceptance #97 remains open.

## Reviewable result

Ten individually designed static-background candidates now cover Neighborhood,
Park, Downtown, Beach, Old Square, Train Station, Shopping Mall, Marina, Stadium
and Magic Gardens. They share the observed classic palette, thin contours,
ground projection and restrained surface treatment. Each location retains its
own recognizable environment. Full original generation outputs and exact prompts
are retained under `art/studies/all-map-style/` and the earlier Neighborhood
study directory. No source-game pixels were generation inputs.

Private review atlas: `.local-m4/all-map-art/atlas.html`. It selects all ten
locations, compares retained source-resource composition research at300/600px,
supports grayscale and overlays actual game actors/cart at one shared scale.
The original research images remain outside tracked production/study assets.
These are existing composition studies, not newly captured original gameplay.

## Verification and actual limits

`node art/studies/all-map-style/atlas.cjs` decoded every candidate/reference and
verified ten unique IDs, selection10/10, 300/600 toggle, grayscale toggle and
actual sprite overlay, with no browser page errors. It wrote a contact sheet,
ten individual scale-review captures, a source SHA256/dimension manifest and
review-checks JSON. Visually inspected the contact sheet and station/marina
actor comparisons. Existing 3-location renderer captures are reproducible with
`node art/studies/neighborhood-cohesion/capture-other-maps.cjs`.

The first pond-based park and isolated-office Downtown studies were retained as
rejected directions: retained original Park is a playground, Downtown a street
square with a lawn island. New themes use those identities. The marina overlay
was moved onto the quay after checking its water boundary.

Do not describe this as ten accepted or playable maps. Candidate surface density
and human scale still vary: station doors/bench and marina furniture need scale
review; cobbles/seat rows may be too busy at300px; foliage is more illustrated
than the original. Mall escalator landing/guard and theme-park track geometry
need separate structural checks. Neighborhood door/story scale remains unresolved.
The atlas is art review only; its actor anchors are proposed placements, NOT
validated gameplay routes. All existing runtime scenes/economy/saves are unchanged.

## Next implementation units

Follow-up within this pass: station v2 widens the field and reduces train,
door/column/bench dominance; marina v2 reduces benches without redrawing the
quay/boats. Both are selected by maps.json. Their actor-overlay reviews were
re-rendered and inspected; the earlier outputs/prompts remain for comparison.
These improvements do not establish calibrated world dimensions.

Normalize door/bench/step dimensions using the common actors, quiet overly dense
surfaces, and check walkway/obstacle masks for each candidate. Then integrate
reviewed backgrounds and location-specific cart/queue/entrance/exit geometry,
including real moving actors and rent thumbnails. Existing simulation only has
three locations: seven new location progression/economy rules are not implemented
by this art pass and must not be fabricated from an illustration. Verify new
runtime content, asset-audit boundaries and Windows packaging when integration
actually occurs. Preserve the separate committed day-transition and weather work.
