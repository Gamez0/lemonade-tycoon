# Steam preparation output boundary

Windows reproduction: content root `Content` and output `content/generated` pass
the old case-sensitive string-prefix check, then write VDFs inside the verified
depot and invalidate its inventory. Directory junctions/symlinks also bypass that
lexical boundary.

Resolve the existing content root and nearest existing output ancestor through
the filesystem, append any not-yet-created output segments, and use the native
relative-path containment rule before creating directories. Write using those
same resolved paths. An external sibling with a shared name prefix stays allowed.
IDs, Preview=1 and empty SetLive behavior remain unchanged; no Steam upload.

Validation: Windows pre-fix case regression failed with a missing expected
exception. Final release11/11 and Node syntax PASS, including case differences,
directory aliases with nonexistent child paths, legitimate sibling output and
unchanged depot inventory. Windows-only casing case is skipped on case-sensitive
non-Windows CI; the alias case runs on both platforms.

Self-review: validation occurs before mkdir/VDF writes, output resolves aliases
and casing rather than lowering path strings, and the package checksum gate still
runs. This addresses ordinary path selection; it does not claim protection against
another process changing junctions during execution. Real Steam access remains an
external acceptance gate.
