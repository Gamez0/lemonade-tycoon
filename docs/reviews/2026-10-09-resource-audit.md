# Windows resource audit — 2026-10-09

The player requested a game whose CPU/RAM costs fit its small classic simulation. Measure before optimizing; do not infer low hardware requirements from game art or language choice.

## Protocol and scope

`scripts/desktop-performance.cjs` launches an isolated real Windows package. Collect every Electron-associated process once per second, separately sum reported CPU, process working sets and private bytes; count actual main-canvas paints/draws. Preparation, muted preparation, normal/accelerated selling, settled results and minimized results are distinct windows. Record phase at both ends, actual elapsed time, build/host/GPU feature/tool identity and raw samples. Preserve any negative CPU counter samples, flooring them to zero only for nonnegative aggregate CPU. Raw earlier development runs remain available, including an initial probe error when SKIP expired and an invalid1000-stock fixture; the final probe uses legal999 stock and an atomic enabled-only SKIP.

Host: Intel Core i3-10100,8 logical CPUs,16GB RAM. Development-machine samples are not minimum-spec certification or proof of ancient-PC/OS compatibility. CPU percentages are Electron's process percentages, not relabeled Task Manager percentages. Summed working sets include shared pages and are not unique physical RAM; Windows private bytes measure private committed memory, not private resident RAM. Definitions: [app metrics](https://www.electronjs.org/docs/latest/api/app/), [CPU](https://www.electronjs.org/docs/latest/api/structures/cpu-usage), [memory](https://www.electronjs.org/docs/latest/api/structures/memory-info/).

## Findings and changes

- Static preparation/results repaint at approximately60Hz even with no changes. Sleep Phaser's loop after painting a static frame; wake on state changes and observed container resizing. An early resize regression exposed that Phaser's own size checking also sleeps, so use an external ResizeObserver with shutdown cleanup. Wake after DOM updates so geometry is current.
- Existing walking poses/simulation change at100ms ticks. Bound active rendering to20fps, retaining100ms rule ticks and fast/normal determinism rather than tying simulation to frame rate.
- Full UI refresh rebuilds unchanged text/financial rows/weather SVG and recomputes hidden rent/history screens every business tick. Update unchanged text/rows only when needed, cache weather by its source label rather than serialized DOM, and do not refresh hidden rent/history while selling.
- Muted/background audio keeps an active context. Suspend it and stop the music timer; zero music needs no scheduler. A persisted mute/zero-volume preference creates no context until explicitly unmuted. Resume/recovery remains tested.
- The package uses a small2D canvas, not WebGL. Sequential A/B on the same optimized development package: default accelerated compositor normal selling2.48%CPU/239MiB private bytes, software2.59%/147MiB. Accelerated business playback3.41%/242MiB versus software4.46%/156MiB. Software lowers private memory substantially with a small absolute CPU tradeoff; use it for the Windows package, retain sandbox/process isolation and validate all native screens/scales/audio/campaigns. Browser preview retains its normal renderer.

Initial delivered alpha8 baseline: idle4.75%CPU/344MiB summed working sets/212MiB private; selling7.20%/464MiB/252MiB; accelerated14.21%/487MiB/276MiB. Final-source/downloaded measurements follow after current-head CI. Early optimized static painting becomes0 frames; do not infer a final release result from development numbers.

## Retention and ongoing gates

Use a legal40-day campaign save, provision ingredients through pure validated purchases and finish20 additional days through actual UI. Compare live JS heap after explicit GC before/after solely to assess retention, separately from normal-play CPU/RAM. Early software run growth0.23MiB; accumulated legitimate history is expected. This short test cannot establish unlimited-session leak freedom.

Windows CI runs this probe with guards: no continuous static repaint, active painting within25fps measured elapsed time around a20fps design, post-GC JS growth below16MiB over20 days and sampled steady phase mean private memory below256MiB. Hardware-dependent CPU samples are evidence rather than brittle absolute CI thresholds. These are provisional engineering budgets, not supported-system claims.

Game ASAR is about1.5MB, while delivered ZIP is about163MB and the executable alone about246MB. Desktop asset audit excludes legacy/research/development dependencies. Removing random Chromium DLLs/locales or downgrading security is not a safe size optimization. Most footprint is the bundled runtime; there is still a material gap to a small native game. An eventual stricter RAM/download target would require evaluating a lighter native host/renderer, with save/UI/offline/update behavior preserved, rather than claiming this optimization eliminates that floor. Final minimum spec remains #161, display controls #205 and physical/clean-PC validation user-deferred.

Self-review: no model/save/schema changes; first pitcher/immediate refill/free ice and historical ledger remain intact. No disabling sandbox or renderer process isolation. Run current-head browser/native/fullscale/security checks, merge, create exact-main alpha9 draft and verify actual downloaded package before recording delivery.
