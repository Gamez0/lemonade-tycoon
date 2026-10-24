const path = require('node:path');
const assert = require('node:assert/strict');
const profileArgs = (base, extra = []) => [`--user-data-dir=${path.join(base, 'Chromium')}`, ...extra];
async function verifyProfile(app, base, enterGame = true) {
    const paths = await app.evaluate(({ app, BrowserWindow }) => ({ userData: app.getPath('userData'),
        storage: BrowserWindow.getAllWindows()[0].webContents.session.getStoragePath() }));
    const expected = path.resolve(base, 'Chromium').toLowerCase();
    for (const actual of Object.values(paths)) assert.equal(actual && path.resolve(actual).toLowerCase(), expected, 'Desktop test profile is not isolated.');
    if (enterGame) {
        const page = await app.firstWindow();
        await page.locator('#menu-continue:enabled, #menu-inspect:not([hidden]):enabled').first().click({ timeout: 30000 });
    }
}
module.exports = { profileArgs, verifyProfile };
