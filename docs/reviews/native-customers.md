# Native map pedestrians

The user distinguished the approved detailed Staff catalogue portraits from
small moving map people. This change only replaces map pedestrians. Faces use
one tiny eye mark and a restrained silhouette; clothing, front/back projection
and movement carry the distinction. Staff portraits remain unchanged.

`customer-art.ts` paints independently authored Canvas2D geometry into66 cached
128x192 textures: three visual families, front/rear sources mirrored into four
directions, idle, four walk contacts, empty-hand ordering, four walking cup
contacts and a static cup pose. Named visual families have an explicit adapter
from the existing three profiles; this does not recover the eleven historical
behavior identities in #228 or assign original49 visual families to them.

Feet share a fixed ground anchor. Opposing contacts alternate their leading leg;
only upper-body bob and swing move relative to that anchor. At300px map width,
opaque bodies measure22.6..26.94px high across all poses. The private original
atlas has980 trimmed rectangles19..27px high (median24); trim rectangles and
opaque bounds are different measurements. The review preserves original trim
offsets and compares equal map widths rather than independently fitting frames.

Rendering interpolates between unchanged100ms business ticks within the existing
20fps ceiling. Ordering faces the stand, queue approach reverses the path tangent,
and departure cups retain the route direction. Reduced motion selects idle or
the static cup. Imports and close flushes suspend interpolation and wake the
renderer when released. Preparation/results retain sleeping static canvases.

Validation uses `scripts/customer-facing-review.cjs`: actual production drawing
methods in controlled Phaser scenes across ten maps/eighty actors,66 distinct
cached sources, transparent borders, opposing contact differences, pause,
reduced-motion cups, facing, depth, no model mutation, cleanup and texture reuse.
This fixture is not full-game footage. Outputs live under ignored
`.local-m4/native-customer-motion`; optional original comparison inputs and pixels
are private and must never be packaged. No new bitmap asset or original pixel is
shipped. Automated checks do not replace the human visual gate #97 or #16.

Clean Windows package from `eb22c69` passed the full native UI/relaunch suite
and `tests/desktop-customers.cjs`: real selling on all ten maps, two differing
canvas captures per map, actual opening/results transitions and no console or
renderer errors. Evidence: `.local-m4/native-customer-motion/{native,native-ui}`.
The first capture run exposed the harness's default5s results wait at4x speed;
the explicit30s transition allowance passed without changing product code.
