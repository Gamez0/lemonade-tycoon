# Suburbs / Neighborhood composition review

Compared the existing private Suburbs map study to the rebuilt native product's
Neighborhood map, both displayed at 300×240 with nearest-neighbor scaling.
Private comparison: `.local-m4/same-location-20261018/comparison.html`.
Reference is the existing decoded map study, not a newly captured original runtime.
No source-game image is included in product assets or this review.

Confirmed differences, in implementation order:

1. The original frames the cart in the left middle lawn with a large cropped house
   to its left, upper-right houses and a large lower-right foreground roof. The
   product places its cart near the middle, between upper-left and middle-right
   houses, with the foreground house on the lower left.
2. The original junction opens from the lower left toward the right. The product's
   through road runs toward the lower right and its branch toward the upper right.
   Redrawing props on the current road cannot correct the composition.
3. The original uses visibly coarse integer raster outlines and sparse texture.
   Product geometry is rendered at640×512 with antialiased polygon/ellipse edges.
   Nearest-neighbor CSS alone does not establish a300×240 authored raster.
4. The stand stop and walking pavement share fixed coordinates across all three
   product maps. Changing just the neighborhood background would strand the cart
   and customers on the wrong ground. Update its path, stop, cart/sign and rent
   thumbnail together; keep the other maps' placement and save rules intact.

Next implementation should author a new integer raster neighborhood composition
from this observation, without importing source-game assets. Review at300×240 and
2× alongside this baseline, then verify live arrivals, queue, service and exits,
location switching/thumbnails and native containment. This review identifies the
remaining mismatch; it does not complete #229 art work or #97 visual acceptance.

## Authored raster candidate

`neighborhood-raster.ts` now draws a new300×240 scene using integer rectangle,
scanline-polygon and Bresenham outlines, then scales it without smoothing for the
existing640×512 world. The left house, upper houses, lower-right foreground roof,
left lawn cart and reversed branch replace the previous composition. No reference
pixels are read by the renderer. Park/Downtown retain their own prior artwork.

The cart/sign move with location changes; neighborhood pedestrians follow the
branch, cross at its marked mouth and continue along the upper sidewalk, avoiding
the foreground roof. Simulation arrival/service timing, rules and saves stay
unchanged. The existing rent thumbnail comes from the same generated texture.

Initial actual-browser capture inspected at native displayed size:
`.local-m4/same-location-20261018/raster-draft.png`. Typecheck/lint pass; complete
browser38/38 and rebuilt Windows UI/management checks pass. Six actual live
walking frames were captured and inspected around the service stop, marked
crossing and upper sidewalk; no renderer errors occurred. Remote current-head
CI remains required. This is an authored adaptation,
not full original visual parity; sprites and full customer identity remain open.

Compared the actual original Suburbs selling capture `reaction-early.png` (not
just the static decoded map) to live authored selling frames. Its pedestrian is
about24px tall at a300px map width; the old product34px sprite rendered at that
width was only16px tall. Neighborhood sprites now render at1.4× (about22px at the
same displayed width), with reaction panels raised to clear their heads. This
keeps Park/Downtown unchanged. The three authored profiles still do not reproduce
all eleven original identities or their detailed costumes/directions.
