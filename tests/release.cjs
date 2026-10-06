const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeManifest, verifyManifest } = require('../scripts/release-manifest.cjs');
const { auditDesktop } = require('../scripts/audit-desktop.cjs');
function temporary(run) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-release-'));
    try { run(directory); } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}
function fixture(directory) {
    fs.mkdirSync(path.join(directory, 'resources'));
    for (const file of ['Lemonade Tycoon.exe', 'resources/app.asar', 'LICENSE', 'LICENSES.chromium.html'])
        fs.writeFileSync(path.join(directory, file), 'fixture');
    fs.writeFileSync(path.join(directory, 'build-info.json'), JSON.stringify({
        source_commit: 'a'.repeat(40), commit: 'b'.repeat(40), prototype: true }));
}
test('manifest detects changed, added and missing distribution files', () => temporary(directory => {
    fixture(directory); const initial = writeManifest(directory);
    assert.deepEqual(verifyManifest(directory), initial);
    fs.writeFileSync(path.join(directory, 'extra.txt'), 'unexpected');
    assert.throws(() => verifyManifest(directory), /mismatch/);
    fs.unlinkSync(path.join(directory, 'extra.txt'));
    fs.writeFileSync(path.join(directory, 'Lemonade Tycoon.exe'), 'changed');
    assert.throws(() => verifyManifest(directory), /mismatch/);
    fs.writeFileSync(path.join(directory, 'Lemonade Tycoon.exe'), 'fixture');
    fs.unlinkSync(path.join(directory, 'resources/app.asar'));
    assert.throws(() => verifyManifest(directory), /mismatch/);
    assert.throws(() => writeManifest(directory), /Missing package/);
}));
test('manifest distinguishes source from synthetic merge checkout', () => temporary(directory => {
    fixture(directory); const document = writeManifest(directory);
    assert.notEqual(document.source_commit, document.checkout_commit);
    document.source_commit = 'c'.repeat(40);
    fs.writeFileSync(path.join(directory, 'release-manifest.json'), JSON.stringify(document));
    assert.throws(() => verifyManifest(directory), /metadata mismatch/);
}));
test('desktop audit rejects legacy and research content', () => temporary(directory => {
    fs.mkdirSync(path.join(directory, 'assets')); fs.mkdirSync(path.join(directory, 'licenses'));
    for (const file of ['index.html', 'licenses/OFL-Oswald.txt', 'assets/font.ttf', 'assets/game.js'])
        fs.writeFileSync(path.join(directory, file), 'fixture');
    assert.equal(auditDesktop(directory).length, 4);
    fs.writeFileSync(path.join(directory, 'legacy.html'), 'legacy');
    assert.throws(() => auditDesktop(directory), /Unapproved/);
    fs.unlinkSync(path.join(directory, 'legacy.html'));
    fs.writeFileSync(path.join(directory, 'assets/reference.png'), 'research');
    assert.throws(() => auditDesktop(directory), /Unapproved/);
}));
