# Map viewport fit - 2026-10-25

The user reported unused horizontal/vertical map space at different resolutions.
The renderer is1280x1024 (5:4), while desktop stretched its containing rectangle
to fill a half-width/full-height column. object-fit:contain preserved the map
but introduced visible letterboxing. Checking only that the map was inside
the box missed this defect.

Desktop now derives the right column from the available layout height and
the measured location heading/description/ratings. The map viewport keeps5:4
inside its border. Spare horizontal width goes to management; when controls
need their minimum width, the right frame uses its natural height instead
of stretching the map box. The header follows the same column boundary.
The complete authored map, customer routes and stand remain visible, with
no cover crop, bitmap stretch, camera change or resource replacement.

A ResizeObserver follows layout/details and font readiness. Changes are
coalesced through requestAnimationFrame and identical styles are not rewritten.
The management minimum width preserves usable controls. Native report row
padding decreases by1px without changing font size so the existing complete
report still fits the narrower column at800x600.

Existing native UI/DPI and display-mode tests now measure both horizontal
and vertical unused map area, requiring at most1px rounding error, in addition
to full-map containment, complete reports and page/action bounds. This covers
five forced renderer scales, small clients, fullscreen and display restore.
Browser layout is unchanged.

scripts/map-viewport-review.cjs provides an additional actual-package audit:
ten maps, six window sizes800x600 through2560x1080, five forced scales,
300 measurements/captures and five contact sheets. It records old behavior
with LEMONADE_MAP_BASELINE=1; normal mode asserts fit and catches page errors.
Final native/visual results and exact-head CI are recorded in the PR before
integration. Forced renderer scales are not physical-monitor acceptance.
