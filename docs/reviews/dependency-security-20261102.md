# Dependency security candidate - 2026-11-02

Actual GitHub alerts and npm audit identified affected development dependencies.
Undici7.30.1 is integrated by PR277. Expanded PR278 retains Electron44.9.1 and
adds Vite6.4.5 plus patched glob/minimatch overrides. Product game rules and save
schema12 remain unchanged; package label advances to alpha21 for the new runtime.

Vite stays on the existing6.x line. The separate Vite8/Phaser4 migration PRs are
not adopted. Electron stays on44.x and includes certificate mitigation and
Chromium/Node fixes described in the existing Dependabot PR.

There is no patched minimatch10.x in the current npm registry. Override
minimatch to^11.0.1 (resolved11.0.4), and glob to^14.0.2 (resolved14.0.2).
These are deliberate major-version overrides, not routine patch claims.
Minimatch consumers are @electron/asar, @eslint/config-array, typescript-estree,
eslint and glob; asar consumes glob. Current package engine declarations support
Node22. Lint, typecheck, production browser build, asar/native Windows packaging
and all required desktop suites must pass with the combined dependency tree.
An override should be removed when supported parent releases select patched
versions themselves; do not downgrade packaging tooling merely to satisfy audit.

Maintainer evidence:
- [Minimatch amplification advisory](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249)
- [Glob cancellation advisory](https://github.com/isaacs/node-glob/security/advisories/GHSA-3g3m-2fjr-6pw4)
- [Vite deny-query advisory](https://github.com/advisories/GHSA-8g5g-mxqh-grgj)
- Electron/Undici release evidence is linked in PR278/277.

Fresh npm audit of the candidate reports zero known vulnerabilities, including
development dependencies. This is a dated registry result, not a permanent
security guarantee or a replacement for human/physical release acceptance.
Final exact-head CI, combined package verification and evidence belong in PR278
before integration. Existing paid saves and original resources are preserved.
