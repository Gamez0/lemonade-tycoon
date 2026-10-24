# Ten-map pedestrian route audit — 2026-10-24 KST

The user reported strange through traffic after the customer art rework. Review
uses each exact shipped map image with production feet/routes overlaid, followed
by actual packaged gameplay. This is independently authored navigation, not a
claim to have recovered original NPC pathfinding.

## Reproduced causes

- Nine maps silently reused their service path for noncustomers and departures.
  Passers therefore visited counter bends and scenery instead of a transit lane.
- Route progress was independent of physical segment length, so speed changed
  sharply at arbitrary waypoints. A branch on the service route also became an
  unintended bend for passers.
- Waiting actors interpolated from at least progress660 in three business ticks;
  promoted/abandoning customers could jump to the counter. Short service durations
  could also finish before a rendered buyer reached it.
- The flattened Neighborhood background had no foreground house layer. People
  on the far sidewalk painted over the roof instead of being occluded by it.
- Downtown's service feet were too close to the near-road curb.

## Per-map changes

| Map | Transit and service review |
| --- | --- |
| Neighborhood | Keep the far sidewalk transit lane; restore owned-house occlusion. Buyers/queue use the near sidewalk; departures return along it. |
| Park | Pass through the broad path junction, then stay on the upper portion of the southeast trail, clear of the overhanging tree. Queue uses that trail; buyers leave west. |
| Downtown | Transit uses the far street sidewalk. Service floor moves from138,173 to138,165, feet126,177; queue stays inside the plaza pavement. Departures reach the painted crossing. |
| Beach | Through traffic uses the promenade between railings. Buyers approach/leave through clear sand on the right, clear of lifeguard tower, towels and volleyball net. |
| Old Square | Enter from the right frontage and cross open paving toward the bottom exit, bypassing the statue planting and foreground building. Service/queue use the central paved lane. |
| Train Station | Transit follows the tactile-path corridor below the bench, then the open station frontage. Service queue uses the right side; buyers leave southwest on paving. |
| Mall | Transit goes around the sign/escalator opening and above the planter. Queue/departures use the lower inner aisle, not the glass edge. |
| Marina | Transit remains on the promenade, clear of water/jetty routing. The narrow promenade shares circulation space; passers do not stop at the counter. |
| Stadium | Keep transit inside the concrete concourse, alongside seats/rails. The counter's queue corridor and westbound departures remain separate route definitions. |
| Magic Gardens | Use the paved lower avenue around fountain/hedges and playground, avoiding the old shortcut across the fountain island. Queue/buyers connect through the paved southwest lane. |

All transit/departure routes are explicit and parameterized by walked ground
distance. Service progress286 remains fixed as a presentation anchor. Queue
movement is bounded by ground distance, and rejected/abandoning visitors leave
from their last rendered place. Rapidly served buyers retain a continuous
lead-in to the counter before following their departure route. No business
arrival/service/patience clocks, decisions, fees or save/RNG behavior changed.
The visualization does not add economic travel delays or claim a collision
simulation between every pair of pedestrians.

## Verification boundary

`node scripts/map-route-review.cjs` emits ten exact-image route overlays with
transit/service/departure/queue toggles. Only progress286 onward is shown for
departures; extrapolated pre-service lines must not be mistaken for real exits.
Before and revised captures remain in ignored `.local-m4/routes-before`,
`routes-v1/v2/v3` and `routes-final`.

Model/storage93 pass, including explicit lanes, route joins, distance-uniform
steps, queue spacing and observed obstacle footprints. The station bench test
uses its ground polygon, not a bounding rectangle that also contains free floor.
Facing tests honor the existing stationary-axis tolerance. These bounded checks
do not certify every scenery pixel as walkable.

The controlled actual renderer checks all ten maps/eighty actors plus queue to
serving, queue abandonment and rapid buyer departure continuity. It checks
bounded movement, cleanup, pause/reduced motion and no model mutation. Full
native gameplay, house occlusion, UI/performance and final-head CI are required
before integration. #97/#16 human visual acceptance remain open.
