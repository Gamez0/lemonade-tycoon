# Neighborhood houses and small props - 2026-10-19 KST

## Subsequent user rejection

After PR249 integrated as56ddb48, the user again rejected the map's visual
quality and requested thorough analysis and planning before further drawing.
The technical validation below does not establish acceptable house design.
Use `neighborhood-redesign-plan.md` as the next art workflow: isolated house
structure and proportions before material lines and small decorations. #229
art work and #97 visual acceptance remain open.

The user accepted the broad neighborhood composition but identified poor house
design and smaller objects. This increment preserves the road, lawn, cart,
walking route and 300x240 authored grid while repairing local construction.

The left roof ridge/eaves now follow the facade direction; windows sit below
the eave, with frames, panes, sills and a flower box. The entrance has an awning,
supports and a step. The upper bungalow gains siding, a framed door and porch.
The foreground roof is one plane with a supported gable, roof seams, a dormer
and an open brick chimney. Small props include rounded integer-span foliage,
trunk/ground shadow, hedge end faces and texture, a separately placed mailbox
and an oval recessed road cover. No source-game pixels are loaded or sampled.

Visual review at the displayed game size and isolated640x512 texture found the
previous floating roof/window junctions removed. Four live walking frames have
no renderer errors. Private evidence: .local-m4/house-design/map.png and live-0
through live-3.png. These are implementation review evidence, not user visual
acceptance; #97 remains open. Remaining fine detail and customer art are not
claimed complete. Prices, customer behavior and saves are unchanged.

TypeScript, reboot lint and production build passed. Focused browser15/15 passed (location changes, three-day books, route activity,
idle rendering and narrow layouts). Rebuilt actual Windows UI checks passed
across preparation, selling, reports, established saves and resize/relaunch.
Self-review found no rule/save/route changes. Current-head CI remains required
before integration. Side-by-side private review: .local-m4/house-design/comparison.html.
