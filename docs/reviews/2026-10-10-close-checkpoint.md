# Native close checkpoint race

The old close callback awaited a save queue while the UI and selling ticks could
still add later work. Delayed-write reproductions left the app editable and
advanced visitors from0 to3 after close began. That later state was outside the
checkpoint already captured by close.

On native close, the renderer now becomes inert, blocks queued input/click/change
events, stops model transactions, waits for startup restore and in-flight import,
then waits for the final save queue. Import completion retains the close lock.
No model, ledger, production or save-v6 change is made.

Validation: strict typecheck/lint, targeted browser save8/8, release9/9, real Windows
packaged save/close/forced-exit/recovery/import/export/relocation suite PASS. Native
regression delays actual filesystem bridge writes, sends a late recipe event,
closes and relaunches with exactly the pre-close recipe. Normal selling close and
forced exit both preserve the paid opening without duplicate production. Preview
Chromium, installed Edge, Firefox, WebKit and both mobile emulations6/6 PASS;
emulation is not physical mobile acceptance. Earlier failed reproduction traces
remain under .local-m4/close-race-before. The first native test initializer used
require outside its Node scope; corrected through the bundled Node module loader.

Self-review: locking is native-close-only; web play/import retains its ordinary
recovery. Existing corrupted/newer save protection is unchanged. Startup and import
work precede queue capture, preventing a callback from reopening the controls. The
five-second native close fallback remains unchanged. Further error-path review is
needed for disk failure during close; passing this race test is not that evidence.
