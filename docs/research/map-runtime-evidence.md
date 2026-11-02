# Retained original map/runtime audit - 2026-11-02

This #233 follow-up reuses the existing reconstruction and legitimate1.1.6
session captures. No original executable is launched. The prior2,880,000-pixel,
10-map/four-stand browser comparison is a **resource-composition** result; it is
not silently reused as runtime equality.

New artifacts are the [ten-scene ledger](map-runtime-evidence/map-runtime-ledger.csv)
and [full numeric comparisons/provenance](map-runtime-evidence/map-runtime-evidence.json).
They contain filenames, metadata, hashes and measurements, not original pixels.

## Actual capture inventory and a corrected assumption

The private original-runtime directory contains745 PNG captures. Ten selected
scenes were visually rechecked against the right viewport/title, not just their
filenames or selected location card:

| Rendered location | Retained capture | Actual state |
| --- | --- | --- |
| Suburbs | `animation-frame-00.png` | Day11 selling, actual40 C/cloudy, before the first sale |
| Park | `map-park.png` | Day11 preparation, forecast37-40 C |
| Downtown | `map-scene-2.png` | Day11 preparation, forecast37-40 C |
| Train Station | `map-scene-3.png` | Day11 preparation, forecast37-40 C |
| Beach | `map-scene-4.png` | Day11 preparation, forecast37-40 C |
| Mall | `map-scene-5.png` | Day11 preparation, outdoor forecast37-40 C |
| Marina | `map-scene-6.png` | Day11 preparation, forecast37-40 C |
| Old Square | `map-scene-7.png` | Day11 preparation, forecast37-40 C |
| Magic Gardens | `map-scene-8.png` | Day11 preparation, forecast37-40 C |
| Hexa-Stad | `stadium-full-scene.png` | Day18 preparation, forecast27-29 C |

Two misleading filename/card inferences are rejected: `return-suburbs.png`
selects the Suburbs card while the right viewport still shows Magic Gardens;
`map-scene-9.png` selects Hexa-Stad while that viewport also remains Magic
Gardens. They cannot count as Suburbs/Stadium scene evidence. These observations
explain why a location-selection click is insufficient to label a capture.

All selected windows are646x509 including chrome. The measured map rectangle is
300x240 at(333,151). These are the same retained session's original1.1.6 captures
by session provenance, not a version string read from the titlebar. The parent
archive has its own pinned hash and **unverified release version**. Prior1.1.5
screenshots remain a separate source. Preparation forecasts do not establish the
actual lighting/weather used by a preview.

## Strict resource-to-runtime measurement

For each of the ten scenes, compare the existing base-stand composition using
both exported background roles and stand-shadow inclusion/exclusion:40 candidate
comparisons in total, **not four stand levels**. Scenery/atlas coordinates and
bottom-edge composition order reuse the existing reconstruction. Compare raw RGB
with zero tolerance; there is no resize, color normalization or fitted lighting
transform. No actor, rain, control or border pixel is masked.

Even the lowest-mean-error candidate has60,647-70,684 differing pixels out of
72,000 per scene. None is an exact runtime match. Suburbs' best candidate has
69,612 differing pixels, mean absolute RGB-channel difference14.659935. The
ledger records every result and the JSON retains all four candidates for each
scene, rather than promoting the closest candidate into a confirmed layer rule.

This does **not** establish that all those differences are geometry errors.
Original color/lighting transforms, unknown archive-version differences,
runtime layer selection, clipping and, for selling captures, actors/native
controls can contribute. It also does not identify a new original compositing
constant. The limited crop/candidate method is reproducible evidence of a
nonzero comparison, not a new acceptance threshold. Product alpha20 uses its
own artwork and is not the target of this pixel-equality measurement.

## What the existing runtime evidence does establish

| Question | Confirmed evidence | Remaining limit |
| --- | --- | --- |
| Intraday rain | `animation-frame-16.png` is Day11/40 C without rain; frame23 is the same day/temperature with diagonal rain and a changed weather icon | Screenshots are not evenly timed; they do not establish a real-time period boundary |
| Indoor climate | `mall-high-live.png` is Day19 selling at20 C while the weather icon shows outside rain; no diagonal precipitation is visible inside | Not all indoor equipment/stand/weather combinations were captured |
| Shadows/reflections | Existing metadata has distinct background/shadow resources for eight maps; Mall57/57 and Station105/105 share them. Four per-stand shadow/reflection frame slots are retained | Native selector, opacity, color transform and all four runtime stand levels are not established by the40 browser compositions |
| Depth and customer facing | Retained Suburbs/Station movement and the49-character/20-pose gallery exist; source front/back/mirror groups are documented | A static preparation scene cannot prove every runtime occlusion, queue facing or original path for all ten maps |
| Props | Visible Park swings and Magic Gardens fountain/ride art are present in native scenes and the resource frame inventory | No additional frame sequence is proven. Duplicate image5 is not a new frame; group7's19 fill levels belong to the pitcher |

Product pedestrian routes/occlusion and its compact map figures have separate
native evidence in [route review](../reviews/map-pedestrian-routes.md) and
[customer review](../reviews/classic-map-customers.md). Those are independently
authored behavior/art and do not recover the original49 identities or original
pathfinder. #97/#16 remains the human visual acceptance gate.

## Reproduce and next capture conditions

```powershell
python scripts/map-runtime-evidence.py --legacy-root C:/Users/dobin/Documents/Projects/lemonade-tycoon --captures-root D:/lemonade-taste-audit/.local-m4/original-runtime --output .local-m4/map-runtime-check
```

The script reuses the existing stdlib PNG decoder and already-extracted PNGs;
it does not re-extract the archive or save composed/cropped images. It records
decoder/extractor/map-metadata and every input PNG hash, disables Python bytecode
writes while loading that helper, and refuses output in either preserved input
tree. Two independent runs produce identical CSV/JSON reports.

To resolve the remaining runtime matrix, retain a licensed unexpired execution
environment with the matching archive. Capture the same named location, stand
level0..3, preparation/selling state, actual weather/temperature and normal/fast
setting before each comparison. Hold the camera/map size fixed; record a timed
sequence for weather transitions, queue approaches, foreground occlusion and
fountain/ride movement. Confirm a real additional frame sequence before adding
animation. Do not bypass the expired trial or substitute resource/browser
equality for missing runtime observations.

This audit supplies the requested scene-by-scene confirmed/difference/next-capture
table and reproducible procedure. Unverified runtime selectors/units remain
explicit evidence gaps, not implicit product work or original-asset permission.
