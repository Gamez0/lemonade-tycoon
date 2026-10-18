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
