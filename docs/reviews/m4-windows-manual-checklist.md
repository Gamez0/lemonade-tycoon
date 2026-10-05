# M4 Windows prototype acceptance checklist — 2026-10-05

M4/#105 remains open. CI checks Windows package saves, but a hosted development runner
is not a clean user PC and relocation of the same package is not an installer update.
Do not mark M2 visual or Steam acceptance complete from this checklist or CI.

## Get the exact tested prototype

Open the successful **Windows package saves** run for the PR/current commit, then download
its `windows-prototype-<full commit SHA>` artifact within three days. Extract the entire
archive to a new directory; keep the EXE, resources and DLLs together. Check `build-info.json`
`source_commit` against the run's source commit; `commit` is the tested checkout SHA
(a generated merge SHA for PR runs). If expired, use the workflow's manual Run workflow action for the
intended branch, wait for success and download its artifact. A rerun is explicit, not scheduled.

This is an unsigned unpacked prototype, not an installer or Steam build. Record any OS security
prompt as a finding; do not disable Windows protection or install Node merely to make it pass.

## Evidence to record

Record commit/run URL, Windows version, display scale/resolution, whether Node/dev tools were
absent, and the outcome of each row. Export and preserve any existing business before testing.
Native user saves live in `%LOCALAPPDATA%\Lemonade Tycoon`, separately from the package.
Use a disposable Windows account for file-corruption checks; never damage the user's own saves.

| Check | Action | Expected result |
| --- | --- | --- |
| Clean-PC/offline | Launch extracted EXE without Node/dev server; disconnect Internet | Preparation and street canvas load; full loop works offline |
| Preparation | Buy supplies, change recipe/price, close with X and reopen | Same cash, stock, date and plan |
| Selling interruption | Export opening checkpoint, open, terminate via Task Manager, reopen | Preparation for same day; opening cash/stock/seed preserved; no partial-queue resume claim |
| Results/next day | Finish day, close/reopen; then NEXT DAY and immediately close/reopen | Same results/history or next-day preparation; ice melt counted once |
| Web → PC | In production web preview export a played business; import JSON in EXE | Cash, stock, plan, day and full history match; restart persists |
| PC → web | Export in EXE; import into a separate browser profile | Same portable business; previous browser business backed up first |
| Invalid import | Import malformed JSON and unsupported version | Clear error, business and save files unchanged |
| Backup recovery | In disposable account close app; damage primary only, relaunch | Recovery message and last backup business, then normal persistence |
| Both damaged | Damage both files in disposable account; play, then cancel restart | Original damaged files preserved until valid import or confirmed new business |
| Package replacement | Export, close; delete only extracted application directory; extract intended newer package elsewhere | Same user-data business on launch; compare full exported document |
| Fresh extraction | Repeat with no existing application directory | No install-folder save dependency; user save still retained |
| M2/readability | Review classic panels at representative DPI and keyboard navigation | Record visual observations for user acceptance, not automatic approval |

CI additionally simulates a second installation directory and portable JSON round-trip through
native download/file import. Same-build directory copying establishes path independence only.
An actual newer-version update/reinstall and human clean-PC observations remain required.
Steam installation, updates, AppID/rights and optional Steam Cloud conflicts require separate
account/device verification. No public upload, sale, signing purchase or paid service is configured.

## Result template

```
Commit / run URL:
Windows version / DPI / resolution:
Clean PC without Node: yes/no; offline: yes/no
Preparation / forced exit / results / next day:
Web→PC / PC→web:
Bad import / primary recovery / both-damaged protection:
Old package SHA → new package SHA / replacement outcome:
Issues + exact reproduction / screenshots or exported comparison:
Manual acceptance: pending/pass/fail, with reviewer and date
```
