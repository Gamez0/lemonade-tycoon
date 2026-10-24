# Actual stand artwork in the upgrade catalogue

Follow-up to #257. The stand card enlarged a generic green-roof toolbar glyph
even when the owned stand was Classic, Lemon or Castle. The map used separate
native painted artwork, so the catalogue did not represent the same object.

The catalogue now reuses the current stand's native1402x1122 source and the same
crop bounds as the scene, displayed with normal filtering in a100px viewport.
The existing title identifies the owned stand; the effect and BUY price still
describe the next upgrade. At maximum level the Castle illustration remains.
Only actual level changes replace the SVG image, avoiding redraw/reload on
unrelated selling ticks. Browsing, prices, ownership and saves are unchanged.

No new bitmap or generated art was required. The existing four v2 stand assets
retain their recorded provenance and packaging boundary. Staff portraits are
unchanged, following the user's explicit positive review on2026-10-24.

Browser stand-upgrade coverage now verifies the native illustration source for
all four stages, distinct rendered previews, charges, map identity and relaunch.
Focused catalogue and all-ten-location checks passed12/12; type/lint/build pass.
Clean Windows source82581cc (dirtyfalse) passed the23-file asset audit and native
four-stage/eight-preview review at1280x1000 and800x600. Native1402x1122 image
decoding, normal filtering, picture/button containment and no root overflow
passed; screenshots inspected for Basic and Castle. The native test waits for
the actual requested client dimensions. Evidence is in
`.local-m4/customer-facing/native-catalogue`; final-head CI remains pending.
