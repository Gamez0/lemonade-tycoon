# M6-M10 development and preparation

2026-10-08 user authorization: continue through M10. This supersedes milestone
stop conditions for runnable development. Physical disconnect, DPI and clean
Windows checks remain deferred release gates. No parallel agents were used.

## Implemented

M6: seven real tabs, two levels each for refrigerator/ice maker/blender, two staff
roles plus dismissal, two ads plus none, direct Marketing price entry. Capital,
wages and ads are accounted separately. Ice production charges normal purchase
cost, refrigerator retains exact ice fractions. Ads increase visitor counts and
arrival pressure; staff/equipment affect service/patience. Paid opening locks
management and prevents repeated charges. Save v4 migrates v0-v3 and validates
known choices, fixed costs and lifetime capital purchases against the ledger.

M7: Help / Sound explains the complete loop, recipe/weather and progression;
English is the initial supported language. Original pentatonic preparation and
selling melodies plus result cadence use Web Audio, with independent volumes,
mute, persisted preferences, gesture activation and focus/visibility suspension.
Tone envelopes avoid abrupt boundaries; events are throttled and SKIP drops burst
effects. Source scores and WAV listening exports are maintained. Reduced motion
holds pedestrian poses/positions while preserving simulation. Fullscreen and
native Save and quit are exposed in help. Music taste/20-minute human listening,
M2 visual and clean-PC/DPI acceptance remain open; #113 is not closed.

M8: four-seed thirty-day management save/replay and existing location campaigns;
browser engine/emulation checks, keyboard/help/mute and narrow screen regressions.
Human testers: 0/5. Real mobile/hardware minimum/long play/Alt-Tab checks pending.

M9: candidate version0.2.0-alpha.1, Windows package, preserved compatibility
save directory/executable, credits/license copies, bounded sanitized diagnostics,
export/rollback procedure. Proposed independent title Willow Lane Lemonade;
identity/distribution-rights confirmation remains pending. Capsule/library art
generated from original code artwork, actual gameplay screenshots and a raw silent
1920x1080 WebM are drafts. Final edited trailer/audio mix remains pending.

M10: official Steam documents rechecked; app/depot templates, launch mapping,
checksum-gated preview-only VDF generator, private-branch/upload/install/update
checklist. No real IDs/partner role, upload, Steam installation or review evidence.

## Verification and review

Latest completed run before final source checkpoint: unit36/36, release5/5,
typecheck and zero-warning reboot lint; production browser17/17; Windows native
save suite and UI21 tab/size combinations. Final reruns and source provenance are
recorded in cloud-work after the remaining source changes are committed.

Corrections: update save-version expectations to4; preserve pre-M6 accounting on
migration; assert lifetime equipment expenses; include ads in forecast and opening
bill; allow ice-maker production to satisfy opening capacity; lock paid settings.
The initial old Rent-error expectation failed after broader opening-cost wording
and was updated. Initial native migration expected v3 and is updated to4. Neither
failure is counted as a final pass before rerun. Fullscreen UI/native management
suite is new and must pass on the final built package.

M6 balance reproduction: npm test then node scripts/m6-balance.cjs. 3 locations x
3 blender levels x3 staff x3 ads x4 seeds x30days =9,720 business days. Bounded
forecast recipes/stock, prices$1.75 Neighborhood/Park and$2.75 Downtown. Without a
blender, server/flyers leads the sampled operating profit; level1 shifts Neighborhood/
Park to server/radio and level2 shifts Downtown too. Park level2 none/flyers beats
server/flyers when comparing that ad alone. This is a finite operating-profit
comparison, excludes capital amortization and does not replace human balancing.

Engine preview evidence at .local-m4/m8-engines/results.json: Chromium153,
Edge154, Firefox155 and WebKit26.6, plus390x844 Chromium/WebKit emulation, all core
loop/reload passes. 120 frame samples each: P95~16.7/16.8/16.68/60ms; mobile
~16.7/25ms. Target development native-engine P95<=33.3ms, preview WebKit<=80ms;
no minimum-hardware claim from this short measurement. Real Safari is not tested.

Remaining release gates are maintained in docs/release/playtest.md and
steam-readiness.md. M7-M10 are not marked fully accepted from these local artifacts.

## Final source validation

8a0a28184f648a2065043dd29160e508d556b98c: all36 unit tests,5 release tests,
strict typecheck/lint, full17browser tests, Windows save/UI21/locations/management
suites pass. New native management also verifies actual Help fullscreen and Save
and quit, no-double-fee replay after a real sale, persisted mute and diagnostics.
Clean native package metadata names8a0a281 as both source and checkout;74file
manifest passes. PR132 has4/4 exact-source CI successes. Full evidence/ZIP hash is
in cloud-work. Later docs/launcher/media-tool checkpoints do not change runtime.

Store-video follow-up produces a14.68-second1920x1080 H264/AAC MP4 from the actual
captured gameplay with separately mixed original music; decoded playback is checked.
It is an editable/listening-review draft, not a certified final trailer. Original
WAV/raw WebM/PNG inputs and metadata remain local alongside the MP4.
