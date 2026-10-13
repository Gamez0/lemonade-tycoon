# Internal Windows changes

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
