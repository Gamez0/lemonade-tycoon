# Original-style launch menu

Issue #268 restores the launch menu requested on 2026-10-24. The retained
resource UI rectangles 0–22 establish a 640×480 composition: navigation at
(8,62), Play panel (8,120,309,343), title (320,0,256,116), and eight company
cells in two columns starting at (17,269), each 146×25. The frame scales to
the available window. The private parent `.local/original/native-menu-reference.png`
is a resource-derived partial composition, not a fresh original runtime capture.
All shipped artwork is independently authored SVG/CSS and the product's own title.
No original pixels enter the package. Staff portraits are unchanged.

New Career creates an unlimited business; New Challenge ends after its thirtieth
trading day and returns to the menu without creating day 31. Eight named companies
retain independent state and mode. Replacing an occupied slot requires explicit
confirmation. Existing saves appear as Company 1 without an initial write.
Options, help, credits, import/recovery and normal desktop quit remain available.
Returning to the menu pauses trading; continuing the current business does not
repeat its opening charge. LSW and Get Game remain visibly disabled because the
online exchange and original vendor purchase service do not exist in this edition.

Save version 9 retains its existing state/history and primary/backup ordering.
Optional company identity and mode fields remain compatible with older documents.
The fixed storage key maps only to `companies.json`; a durable journal covers the
company snapshot, primary write and cleanup. Recovery reconciles the actual primary
before enabling writes. A backup from another company restores the active company's
own durable snapshot. Failed cleanup updates in-memory ownership before normal
close, preventing an old company from overwriting the new primary. Corrupt/newer
files remain protected, with review/export, retry and explicit import available.

Validation includes model fault injection at each durable transfer write,
same/different-company backup recovery, replacement and size bounds; browser
layout/keyboard/company/relaunch/challenge/pause/close checks; and a packaged
Windows menu test at 1280×1000 and 800×600 with native options, independent plans,
relaunch, both modes and normal quit. Existing game tests enter through the real
Load Game control. Human visual acceptance remains tracked separately in #97/#16.
