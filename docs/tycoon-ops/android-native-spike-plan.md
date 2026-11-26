# Android native packaging spike — not release approval

Baseline: web payload CI 45775681350, smoke script on android-spike. Native packaging is a separate gate. Compare Capacitor (existing Vite payload, native bridge) with plain Android WebView (manual lifecycle and storage handling). Prefer a reversible Capacitor experiment only after checking current dependency compatibility and license; do not publish or sign with production keys.

Acceptance: isolated Android project, pinned dependencies and lockfile, debug APK assembled by CI, artifact checksum, no deploy, existing PC/web tests unchanged. Emulator/device smoke must launch offline, display canvas, purchase, persist across process restart, and report no fatal logcat errors. Browser localStorage reload is not evidence of native process persistence. Test back navigation, rotation, safe areas and touch. AAB release/signing and Play identity remain separate gates. If dependency or SDK provisioning fails, capture exact error and evaluate WebView fallback. No paid runner or external account required by this plan.

Next worker: inspect existing native files and dependency lock, implement isolated debug build only if no conflicting work; request independent review of exact SHA and CI artifact. No native build has been performed by this document.
