# Product implementation baseline — 2026-10-16

Execution record: [#231](https://github.com/Gamez0/lemonade-tycoon/issues/231).
Live issue/Project state takes precedence over this snapshot.

| Concern | Preserved parent worktree | Product main `29135dc` | PR230 `281489b` |
|---|---|---|---|
| Entry / tooling | Phaser `src/main.ts`, Yarn | `src/reboot.ts`, npm / Node22, Electron | Same product entry/tooling |
| Persistence | Independent v1 document, automatic preparation checkpoint and three slots | reboot v6, paid-opening deterministic replay, file backup/import/export | v7; preserves old v6 opening model and historical ledger |
| Customers / places | Four interpreted visual families, 49 sprites, ten locations | Three product locations, common purchase/taste approximation | Three adapted profiles/locations, purchase before taste, profile patience |
| Ice | Full pitcher ice required before production | Full pitcher ice consumption | New model consumes ice per sold cup; old paid openings keep pitcher behavior |
| Satisfaction | Buyer-only rating | Buyer taste/price score | Distinguishes buyer response and overall denominator including price/stock/queue misses |
| Verification | `tests/regression.cjs`, original-map pixel reconstruction, browser tests | npm model/storage, browser, release and Windows packaged checks | Added customer-model, v6 replay and native taste coverage; required Windows save import currently FAILS |
| Art / sound | Extracted original research assets and six bitmap fonts | Independently authored product assets and licensed provenance | Original executable/captures remain ignored research only |

Evidence: parent `src/data/customer-profiles.ts`, `src/models/result.ts`,
`src/models/supplies.ts`, `src/persistence/game-save.ts`; product
`src/game/simulation/{game,save}.ts`, `package.json`, `docs/roadmap.md`,
`docs/research/original-116-live-audit.md`, and `docs/reviews/customer-purchase-taste.md`.
Parent HEAD is `96d7765` on `refactor/static-scene-registration`, with existing
uncommitted changes. Product main and PR head were checked against GitHub after
fetch. PR83, the parent worktree and frozen alpha13 delivery are preserved.

## Implementation workspace and next actions

`D:/lemonade-loop`, branch `fix/backlog-save-import`, was created from current
`origin/main` (`29135dcd4ae1ecb2cc6863db61fbebcdfd81946a`). Apply the PR230
commits there for diagnosis; it remains main-derived. The existing
`D:/lemonade-taste-audit` checkout and its modified handoff remain preserved.
Use npm and the committed lockfile. Product source is the reboot tree, not the
parent's reconstructed Phaser game. Never migrate the parent v1 save by assuming
it is the reboot schema with the same numeric version.

- #228 / PR230: reproduce Windows import rejection, repair its cause, verify
  model/accounting and real v6 paid-opening replay, browser and packaged Windows
  saves. Self-review and current-head required CI precede integration. Three
  adapted profiles do not satisfy the full eleven-profile checklist.
- #229 / #97 / #16: implement independently authored same-size classic UI/art
  improvements; check browser/native layout and customer orientation. User visual
  acceptance remains open.
- #232–236: research widget bindings, runtime layers, identities/time units,
  equipment unknowns and audio. Reuse existing eleven anonymous profiles, ten
  location mixtures, measured prices and recipe bounds before new investigation.
  Do not re-run the expired trial or treat inferred local tuning as original fact.

The approved M1–M11 roadmap governs product scope. Original tables and captures
are evidence, not permission to ship extracted artwork/fonts/audio. The original
1.1.6 audit supersedes older local claims that no executable evidence exists;
the parent executable's launch failure remains a separate historical observation.
Manual/physical/rights acceptance and later Steam operations stay separately
tracked. Passing local checks does not establish integrated or delivered status.
