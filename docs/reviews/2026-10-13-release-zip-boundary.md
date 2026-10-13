# ZIP output boundary — 2026-10-13

The PowerShell ZIP tool compared lexical paths. An external directory junction
pointing into the verified package bypassed its output exclusion, allowing pending
ZIPs and sidecars inside package content. Reproduced using the actual PowerShell
entrypoint: an alias with a nonexistent child reached metadata loading instead of
the required boundary rejection. The regression failed before this correction.

Resolve the package and the nearest existing output ancestor with Node's native
realpath, append nonexistent children and reject same/child output before reading
metadata or creating files. PowerShell uses these resolved paths for every write.
External siblings and package aliases remain supported. No package/version/game
change. Release tests 11/11, syntax and whitespace pass on local Windows; the
actual PowerShell junction regression runs in Windows CI and helper coverage runs
on both platforms. Full real-package ZIP generation remains in required CI.

Self-review: validation uses the script directory, captures failure before JSON
parsing, and retains all original checksum/no-overwrite checks. No recursive delete
or link mutation is added. Concurrent external junction changes are outside this
ordinary path-selection guard; human/clean-PC/Steam acceptance remains open.
