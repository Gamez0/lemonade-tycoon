# Unreadable display preference preservation

The existing preference test claimed corrupt and newer files were retained until
Apply, but only exercised automatic updates for newer versions. Extending that
same assertion to corrupt data reproduced an implicit overwrite. The native
leave-full-screen callback uses this automatic update path.

Protect every existing unreadable preference file, keeping session defaults and
the original bytes until an explicit Apply. The warning now explains that Apply
replaces the file. Normal missing-file initialization and valid mode persistence
remain unchanged; business saves are separate.

Local preference2/2 PASS after the pre-fix failure. Native display53/53 PASS across
100–200% in the alpha13 candidate. The regression emits
the native leave-full-screen event with a corrupt preference file and verifies
the file before and after normal close at every existing100–200% scale. Actual
delivered alpha10 to local alpha13 upgrade5/5 PASS, preserving ledgers, opening
replay, corruption protection, web/native transfers and network-disabled play.
The upgrade helper now selects explicit discard only for its protected corrupt
session, matching alpha12's failure-aware close rather than waiting for silent
exit. Current-head CI remains required before integration. This event
injection is automatic coverage, not physical-DPI/human acceptance.

Self-review: all non-ENOENT read failures are protected; explicit Apply is already
the controller's intentional replacement path. No new settings or game rules.
