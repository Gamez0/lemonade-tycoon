# First cloud batch: M4 audit — 2026-10-05

Starting checkout: `/workspace/lemonade-tycoon`, `chore/codex-cloud-handoff`,
`e4dd6b8819afaf8d3e98dd2e4a70b4501af4b3b4`. Clean worktree; no parent/local changes used.
Managed environment status reported cloud provider, running and connected. Git fetch and
ls-remote succeeded. Main remained `0ddf7aa3111dc2623167c0834cee4908bc31cb78` (#120).
Public GitHub PR page payloads reported #121 and #122 OPEN; their heads were f5ce10f and e4dd6b8.
The current branch intentionally retains that preparation/gameplay ancestry.

## Demonstrated defect and correction

Both writeSave and writeSaveAsync caught backup storage errors together with invalid JSON.
With a valid primary and an injected disk-full failure on BACKUP_KEY, each incorrectly
replaced the primary and returned success. Two new regressions failed before the fix
(`Missing expected exception` / `Missing expected rejection`). Decode failures alone now
preserve the old backup; a backup write failure propagates before primary replacement.
The renderer's existing error handling presents export advice and can retry later.
No save version, pitcher, ice, old cup accounting or art behavior changed.

## Acceptance evidence and remaining limits

| M4 condition | Current evidence | Remaining gate |
| --- | --- | --- |
| Preparation/results/next day and ledger | Unit multi-day round-trip, browser reload/results/cancel tests | Windows package run |
| Interrupted selling | Opening checkpoint policy, deterministic simulation replay, browser reload | Forced Windows process termination run |
| Import/export | Browser validates bad data without replacing protected primary; portable JSON export/import | Web→Windows manual transfer |
| Versions/accounting | v0 normalization and v1 cup→v2 pitcher regression, result/history equality | M5 v3 design only |
| Missing/corrupt primary and backup | Sync and async regression paths, file adapter recovery | Windows damaged-file run |
| Serialized writes/close flush | Browser async bridge with delayed writes verifies no overlap and latest checkpoint after flush | Native IPC close handshake on Windows |
| Per-user files/atomic replacement | File adapter tests and fsync/temp/rename review | Actual Windows replacement, clean PC, update/reinstall |

The five-second native close fallback and failed-write warning are not a guarantee of
successful disk writes during OS termination or hung renderer shutdown. A forced exit
replays the last persisted opening checkpoint; it does not resume a partly served queue.
M4/#105 stays open, and M5 gameplay stays deferred. M2 still needs user visual acceptance.

## Windows repeatability

`.github/workflows/windows-package.yml` uses Node 22/npm ci, unit/file tests,
Windows x64 packaging and `test:desktop`, on push, pull_request and workflow_dispatch.
Playwright's Electron driver uses the installed package, not a dev server or browser binary.
No Chromium download is needed for that job. The package test now uses BrowserWindow.close
and waits for application shutdown, checks exact results preservation, and closes immediately
after NEXT DAY to exercise queued native writes. Force termination still uses taskkill.
YAML and JavaScript syntax are checked locally; Linux cannot execute this Windows EXE test.
GitHub API requests returned Forbidden, but public Actions pages subsequently confirmed
Windows run 37282655364 passed (1m30s) and Reboot run 37282655187 passed (2m09s),
both for implementation commit 24a5ef2. The Windows packaged test is therefore verified
on the Windows runner; clean-PC, update/reinstall and Steam/manual gates remain open.

## Self-review

- Scope limited to demonstrated backup-error behavior, relevant regressions, Windows CI
  and independent M5 design. No speculative persistence rewrite or dependency changes.
- Valid corrupt-primary recovery still skips replacing its good backup. Backup errors
  now abort before writing the primary; both sync/async contracts covered.
- Async renderer test exercises production renderer queuing/flush rather than duplicating it.
  It uses a simulated bridge and does not establish native IPC or Windows acceptance.
- Windows job has contents-read permissions, bounded runtime and no publication/signing/Steam step.
- New desktop test's normal close exercises the actual window close event; final cleanup
  retains app.close for failures. Requires first successful Windows runner result.
- M5 explicitly separates rent from purchase/material cost, preserves old ledger values,
  freezes opening economics and avoids double fees on replay. Values need balance evidence.

Actual final command counts and exact checked commit are recorded in `docs/cloud-work.md`.

## Remote verification addendum

The Windows package job completed successfully on implementation commit 24a5ef2.
This resolves the table’s automated Windows package/forced-exit/IPC-flush run gates,
not clean-PC/manual transfer/update acceptance. No PR or merge occurred because API access
remained Forbidden. The documentation-only successor CI must be checked separately.
