# Internal Windows changes

## 0.2.0-alpha.14 — customer stages, 2026-10-13

Work-in-progress checkpoint, paused 2026-10-14. Not built or released from the
latest recovered-model changes; browser/native verification is pending.

- Today's untried recipe no longer determines whether a visitor buys or joins the
  queue. Price, customer budget, weather and existing reputation determine that
  decision; publicity/popularity bring visitors.
- Office workers have shorter individual patience and are more common Downtown.
  Neighbors/students keep different deadlines in the same line; host/service
  improvements remain effective. Rent previews show the range and office mix.
- Buyers react to watery/warm/sour/sweet drinks. Live bubbles,
  accessible feedback and daily results explain the recipe; low satisfaction
  no longer always receives a smiling report face.
- Save v7 imports v0–v6 unchanged in their accounting. Paid old openings retain
  old customer decisions/deadlines and reserved ice; the new model starts at the
  next opening, consuming ice only for sold cups. Recipe limits match the observed
  original (0–20 lemons, 0–10 sugar, 0–7 ice). Overall satisfaction includes missed
  customers; historical reports keep their original calculations.
  Export before updating: alpha13 and earlier cannot read v7, so rollback needs
  your pre-update export. The frozen alpha13 package/materials remain unchanged.
- Taste thresholds/concentration/dilution were recovered from original 1.1.6 and
  cross-checked against TEST gameplay. See the live audit for evidence and limits.
  Our economy, three places/customer abstractions and seeded random generator
  remain adaptations; this does not claim complete original parity.

This candidate does not establish original visual fidelity, human acceptance,
Steam installation/review or public release.

## 0.2.0-alpha.13 — preparation candidate, 2026-10-13

Changes since the delivered alpha10 package:

- Normal close freezes gameplay while its final checkpoint is written. Failed or
  timed-out writes retain the open game by default; explicit discard is available.
  Late acknowledgements cannot close a resumed session.
- Corrupt/unreadable display settings remain intact until explicit Apply.
- Help explains increasing pitcher yield with ice and level1 refrigerator retention.
- Internal draft reruns preserve the exact existing version/source identity.
- Steam scripts and build-cache paths reject Windows casing/junction paths into
  package content. ZIP output uses canonical paths and preserves Unicode through
  legacy PowerShell console encodings.
- Electron44.7, Playwright1.64 and updated setup-node/upload-artifact Actions are
  validated together with current storage/display/release regressions.
- Account-independent Korean handoff and content-survey draft accompany the package.

Save format remains v6. Existing v0–v5 migrations preserve historical accounting.
The delivered alpha10 stays frozen; this candidate does not retarget its release.
No new game rules, actual Steam upload, Valve approval or public sale is claimed.
Human/physical-device/media/rights acceptance is recorded separately.
