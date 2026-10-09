# Reviewed dependency integration — 2026-10-09

Combine Dependabot proposals #177–183 into one tested change after the M4–M10
implementation integration. Vite updates to 6.4.4; terser to 5.51.2 and
typescript-eslint to 8.71.1. ESLint 10.12.0 and @eslint/js 10.0.1 are updated together:
the separate #183 proposal failed because ESLint 9 did not satisfy its peer range.
Targeted lock updates include patched nanoid, PostCSS, source-map-js, Rollup and
esbuild. No `--force` or `--legacy-peer-deps` bypass is used. npm remains authoritative.

TypeScript #184 is not adopted: registry metadata and its actual failed install
show typescript-eslint supports >=4.8.4 <6.1.0, not TypeScript 7. Keep the current
working compiler and suppress only incompatible >=6.1 proposals; reconsider when
lint tooling supports them. This is a documented compatibility decision, not a
claim that TypeScript 7 itself is defective or that its proposed update succeeded.

Official checkout/setup-node/upload-artifact action updates from reviewed #181
replace deprecated action runtimes. New Dependency review runs on every PR with
read-only permissions, blocking newly introduced moderate-or-higher vulnerabilities.
Public-repository availability and configuration were verified in GitHub Docs:
https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review
https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action
After observing a successful run, add its real check name to branch protection.

Local checks so far: unit 41/41, release 5/5, strict typecheck, zero-warning lint,
web and desktop builds/six-file asset audit PASS. `npm audit` reports zero known
vulnerabilities across runtime and development dependencies for this lockfile.
Full browser, exact-head remote Windows and security-alert closure are tracked in
the PR and continuation journal; do not count proposed updates as remediation.

Review covers peer compatibility, unchanged game/runtime save rules, bundling,
targeted lock changes, action permissions and preservation of required test names.
Final source/CI evidence must be current before merging. Old Dependabot PRs are
closed as superseded only after the combined update actually reaches main.
