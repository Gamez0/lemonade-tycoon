# Equipment catalogue illustrations

Follow-up to #257. The existing refrigerator, ice maker and blender cards enlarge
26px toolbar drawings to88px. Replace the large catalogue drawings with native
independent illustrations; retain small shared vector glyphs where still used.
Staff portraits retain their current detailed art, following the user's positive
review. The minimal-face requirement concerns only map pedestrians.

Original references were inspected privately: a near-cubic pale single-door
fridge, an aqua commercial ice machine with an open collection bin, and citrus/
power juicers. The reboot has a Blender role rather than those exact juicer
models; preserve its glass-pitcher illustration and existing service effects,
without claiming recovery of original equipment identities or mechanics.

Each built-in image-generation call uses only our own Basic stand v2 as a
rendering/material reference. Original pixels were never supplied. Exact
`equipment-*-v1-prompt.txt` files and unchanged source PNGs are retained in
`art/studies/remaining-images`. Selection, transparency, actual-size and native
checks are still in progress. Preserve equipment IDs, prices, ownership levels,
effects, save schema and all purchasing behavior.

Selected all three v1 images after inspection. Each native1402x1122 RGBA PNG has
four fully transparent corners; unchanged copies are used in product assets.
Combined PNG size is2675209 bytes. Cards use normal filtering at100x100 without
a26px intermediary. Small vectors remain available for navigation/status roles.
Only the three explicitly named equipment-v1 filenames are allowed by the
shared build/ASAR asset boundary; an unapproved equipment name is rejected.

Validation so far: typecheck, reboot lint, production build, release15/15
(including positive/negative equipment boundary) and focused browser7/7
(native decoding, catalogue browsing, purchasing/hiring/replay, save reload)
passed. The private original/current/native board regenerates26 baseline glyphs
and18 reference matches, with new equipment normalized to the same88px comparison
boxes and their actual100px usage stated. Windows native six equipment/eight
stand cards and isolated enforced performance checks are pending.
