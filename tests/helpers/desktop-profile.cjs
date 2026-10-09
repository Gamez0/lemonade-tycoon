const path = require('node:path');
const assert = require('node:assert/strict');
const profileArgs = (base, extra = []) => [`--user-data-dir=${path.join(base, 'Chromium')}`, ...extra];
async function verifyProfile(app, base) {
    const paths = await app.evaluate(({ app, BrowserWindow }) => ({ userData: app.getPath('userData'),
        storage: BrowserWindow.getAllWindows()[0].webContents.session.getStoragePath() }));
    const expected = path.resolve(base, 'Chromium').toLowerCase();
    for (const actual of Object.values(paths)) assert.equal(actual && path.resolve(actual).toLowerCase(), expected, 'Desktop test profile is not isolated.');
}
module.exports = { profileArgs, verifyProfile };
