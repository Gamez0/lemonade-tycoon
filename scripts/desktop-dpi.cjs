// Baseline 100% is covered by test:desktop:ui; include the reported 175% scale.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const evidenceRoot = path.resolve(process.env.LEMONADE_UI_EVIDENCE_ROOT || 'test-results/desktop-dpi');
for (const scale of [1.25, 1.5, 1.75, 2]) {
    const result = spawnSync(process.execPath, [path.resolve('tests/desktop-ui.cjs')], {
        env: { ...process.env, LEMONADE_UI_SCALE: String(scale), LEMONADE_UI_EVIDENCE_ROOT: path.join(evidenceRoot, String(scale)) },
        stdio: 'inherit',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Desktop UI scale ${scale} failed (${result.status ?? result.signal}).`);
}
