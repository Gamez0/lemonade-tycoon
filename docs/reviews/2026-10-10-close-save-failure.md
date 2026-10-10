# Save failure during normal close

The preceding close-race fix froze the checkpoint but still silently closed after
an I/O failure: the renderer queue swallowed the rejection and preload always
acknowledged success. A pre-fix browser reproduction returned success with the
old recipe still on disk. Five-second timeouts also closed without a decision.

Record the last successfully written or restored checkpoint. After startup,
import and queued writes settle, retry only an unsaved current checkpoint; reject
failed writes and protected corrupt/future saves. Selling still stores its paid
opening; results store the completed business and ledger. A failed import does
not replace the current business. No save-format or economic-rule change.

Preload reports success/failure with the main process request id. The close
controller cancels its deadline and opens a native warning on failure/timeout.
Keep playing is the default and Escape choice; it resumes editing/selling for
retry or export. Only successful durability or explicit Close without saving
closes. Repeated close clicks, late acknowledgements after cancellation and late
success while deciding cannot silently discard work. Unavailable renderer/dialog
paths retain the same explicit-discard/default-retention rule. Diagnostics use
fixed event names and never save raw errors, business data or file paths.

Validation: simulation/storage58/58 including controller4/4, typecheck/lint,
release9/9 and browser saves9/9 PASS. Actual Windows package save suite PASS with
injected disk failures for keep/retry/discard and delayed IPC for the real five-
second timeout, followed by a late acknowledgement and a successful second close.
Existing normal/forced selling replay, result/history, recovery, imports, exports
and relocation pass. Added renderer-unavailable controller case subsequently
passes5/5. Current-head remote checks are still required before integration.

Self-review: the close comparison selects the opening checkpoint only while
selling; a retained opening object must not replace completed results. Packaging
explicitly includes the new controller. Shipped-content audit initially rejected
the added controller; updated its required-file allowlist and archive fixture and
reran the audit/release checks. Future/corrupt files are never overwritten
to make close succeed; their test chooses explicit discard. The fault tests use
isolated profiles and bundled file storage and do not establish clean-PC or human
acceptance. Forced OS termination still cannot guarantee unsaved progress.
