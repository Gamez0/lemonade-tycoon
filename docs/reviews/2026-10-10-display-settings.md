# Windows display settings (#205)

The user requested window size/fullscreen selection and continued delivery.
Windows Help / Settings now offers Windowed and Fullscreen with Apply. Window
sizes are logical client pixels under Windows scaling, not monitor mode changes.
Fullscreen fills the current monitor. The web preview retains DOM fullscreen.

Preferences live in `%LOCALAPPDATA%/Lemonade Tycoon/display.json`, separate from
business save/backup and Chromium audio settings. Version 1 stores mode and the
selected window size. Apply validates a currently available size and atomically
writes preferences. Read/write failures use a safe window or session-only setting
with visible feedback. Corrupt and future-version preferences are preserved on
startup; Apply explicitly replaces them. Business save v6 is unchanged.

Only presets fitting the current monitor work area are offered, plus fitted
default/maximum sizes. A stable 32x64 logical-pixel frame reserve avoids fractional
DPI frame rounding changing the largest option. Minimum outer bounds must not
force the requested fitted client off-screen. Startup explicitly centers on the
primary work area: Windows' default placement on a differently scaled secondary
monitor reproduced an oversized/off-screen restore during the 200% test. Windows
can deliver initial monitor DPI after construction, so the selected size is also
reapplied at ready-to-show using the settled native frame. A former
larger-monitor preference is fitted safely; monitor removal/metrics changes fit
and recenter an ordinary window. Leaving native fullscreen restores the chosen
window size; maximizing/minimizing does not rewrite it. Actual client bounds can
round by a few logical pixels; preferences retain the selection without drift.

The native bridge accepts only this window's IPC and validates mode/size. No
filesystem path or arbitrary Electron API is exposed. Context isolation, sandbox,
navigation restrictions and software compositing remain enabled. Package staging
and shipped-file allowlist include the new controller, with license audit intact.

Local validation:54 unit/save rules,8 release tests,29 browser tests, strict
typecheck/reboot lint and shipped-file/license audit PASS. Actual Windows display
suite53 mode/size/restore/fallback checks across100-200% PASS. Existing175%97 UI
geometry cases and native management/fullscreen/save-and-quit PASS. Resource
guards retain zero static draws, bounded active painting,256MiB sampled mean
private-memory budget and20-day live-heap retention. Final exact-head CI and
downloaded release outcomes are recorded in the PR/issue rather than inferred
from these local results.

Coverage: pure fitting across 100-200%/smaller monitor, preference corruption/future
protection and business-file isolation; actual Windows all available sizes, both
modes, normal close/relaunch, invalid IPC sizes, prior-large-monitor/corrupt-file
fallback, whole map and no panel scroll at every supported scale. Existing native
management asserts BrowserWindow fullscreen rather than DOM fullscreen. CI retains
display evidence with the UI/resource/campaign evidence. Full current-head CI,
exact-main draft and downloaded upgrade are required before delivery is recorded
in the PR/issue. These automated checks do not certify physical DPI changes,
clean-PC acceptance, minimum hardware or human playtests.

API basis: [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
and [screen](https://www.electronjs.org/docs/latest/api/screen), checked 2026-10-10.
