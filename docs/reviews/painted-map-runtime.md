# Painted map runtime

The Neighborhood, The Park and Downtown now use the selected independently
generated backgrounds. Their logical 300x240 raster is averaged once on load,
then enlarged with nearest-neighbor sampling. The ten-map asset catalogue also
contains the remaining seven themes; those seven are not yet playable locations.

The stand is an independent bottom-anchored sprite selected by saved ownership.
Backgrounds and rent thumbnails contain no stand. Customer progress follows an
authored piecewise route instead of treating simulation progress as screen X.
Simulation arrival, patience, queue and sales rules remain unchanged. Routes put
the counter beside usable ground and take the neighborhood crossing to the far
sidewalk; Downtown avoids the lawn and foreground office. Park describes the
playground background rather than the superseded pond design.

The comparison atlas uses the actual runtime raster and canonical anchors for
all ten themes, with four independently composited stand stages. The frozen
previous procedural background is read from commit 17b3c4d for reproducibility.

Validation: 72 model/storage tests and all 53 browser tests passed, including
eight moving-people captures per playable map, positive sales and Castle Stand
persistence. Typecheck and lint passed. Native package verification follows.
Geometric checks are approximate authored clearances, not collision detection
or proof of human visual acceptance. Retained original references are private
resource compositions, not newly captured original gameplay. Issue #97 remains
open. Remaining work: activate and validate the other seven locations, review
their routes and scale, and complete visual comparison with the user.
