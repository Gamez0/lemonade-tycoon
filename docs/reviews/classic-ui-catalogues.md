# Classic UI readability and illustrated catalogues — 2026-10-16

Increment for #229. User visual acceptance #97 stays open.

Body text used the same 300-weight condensed face as display headings. At the
same 960px app width this compressed product descriptions and prices. Body and
ordinary controls now use normal-weight system Tahoma/Arial; condensed headings,
numeric displays and existing decorative tab labels retain their roles. No
original bitmap font is shipped. Same-size screenshots were inspected locally;
this is a readability improvement, not proof of original font parity.

Upgrades and Staff now have independently authored SVG product illustrations and
portraits, name/effect/wage information, explicit BUY/HIRE/CURRENT actions and
previous/next catalogue navigation. Browsing never purchases or hires. Existing
price, ownership, full-level, paid-opening lock and persistence rules remain.
Native fit checks now inspect each of the three cards at every tested window
size, excluding cards clipped outside the current catalogue viewport.

The wider body face exposed a 4px forecast overflow at 768px. The top-level
control grid now permits each track to shrink instead of enforcing a min-content
width. The body establishes its own formatting context so app margins cannot
collapse outside a viewport-height body and introduce a needless page scrollbar.

The user additionally reported a horizontal scrollbar in Staff at a small window.
The catalogue previously used overflow:auto, which could show a platform
scrollbar in addition to its explicit arrows. It now clips user scrolling while
retaining programmatic/focus navigation. The root clips horizontal overflow as a
final boundary, and catalogue min/max widths constrain the content itself.
Regression coverage browses every employee at 800x600, 683x465, 640x480,
512x350 and 375x667, checking the active hire button fits, no horizontal bar is
allocated and the document remains within the viewport. Portrait web pages can
still scroll vertically; native game-window containment is checked separately.

Initial typography browser run:34/35; the 768px overflow was the sole failure.
After correcting track sizing, focused catalogue/purchase/hire/paid replay and
breakpoint checks passed4/4. Rebuilt Windows UI checks passed every preparation
tab/card at five window sizes and selling/results containment; native management
passed. Those native runs preceded the final scrollbar correction. Final focused
scrollbar and current-head CI results are recorded in the PR and cloud handoff.

Remaining #229 scope includes Recipe/Supplies composition, selling equipment/ads,
report presentation, same-location original comparison and neighborhood art.
The authored illustrations are adaptations of our existing three upgrades and
staff roster; they do not add the original thirteen equipment cards or establish
full visual fidelity.
