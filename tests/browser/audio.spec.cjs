const { test } = require('@playwright/test');
const { observeAudio, verifyRecovery } = require('../helpers/audio-recovery.cjs');

test('previously activated music resumes after audio suspension and focus return', async ({ page }) => {
    await page.addInitScript(observeAudio);
    await page.goto('/');
    await verifyRecovery(page);
});
