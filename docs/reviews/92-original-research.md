# M2 original-game research review

The user made original PC visual and interaction fidelity the second MVP, replacing save/load as the immediate milestone. Closed the accepted, fully completed M1 milestone and created M2 with research #92 and implementation/acceptance #93–97.

Inspected twelve original-game screenshots (ten consistent English screenshots, one Spanish selling reference and one advertising/price variant). Read the PC FAQ for role/flow corroboration. Version differences are explicit; no mobile or sequel material is used as a baseline. Two video candidates were found but could not be played/verified; no motion timing or frame claims are fabricated.

The study separates visual observation, approximate measurement, our proposed implementation contract and unresolved evidence. Reference dimensions are approximate hand measurements; current dimensions came from browser DOM bounds at 1280×1000. Purchase commit/cancel semantics are clearly our specified contract rather than claimed observed clicks. Per-cup versus pitcher rules remain explicit. M2 is not a promise to implement every original subsystem.

The board links externally hosted reference images, supplies a source link/failure notice, and embeds only our own current-game capture. It supports ten reference selections and approximate region overlays. Source screenshots are not added to production assets. Current runtime is unchanged; the unvalidated layout draft is preserved separately at `d0b4ef1`.

Validation completed: manually inspected the board screenshot; exercised all ten reference selections, previous/next and overlay state in Chromium; verified reference/current image display and no horizontal overflow at 375px; reviewed source links, issue mappings and milestone scope. Browser reported no uncaught errors. This is documentation/research; no new game test suite is warranted. Existing PR CI remains required before merge.
