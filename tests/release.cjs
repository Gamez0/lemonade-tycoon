const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeManifest, verifyManifest } = require('../scripts/release-manifest.cjs');
const { auditDesktop } = require('../scripts/audit-desktop.cjs');
const { prepare } = require('../scripts/steam-prepare.cjs');
const { createDiagnostics } = require('../src/desktop/diagnostics.cjs');
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

test('Steam preparation rejects invalid targets, detects package changes and stays preview only', () => temporary(directory => {
    const content = path.join(directory, 'content'); fs.mkdirSync(content); fixture(content); writeManifest(content);
    const output = path.join(directory, 'scripts');
    assert.throws(() => prepare({ appId: 480, depotId: 481, contentRoot: content, output }), /real/);
    assert.throws(() => prepare({ appId: 12345, depotId: 12345, contentRoot: content, output }), /real/);
    assert.throws(() => prepare({ appId: 12345, depotId: 12346, contentRoot: content, output: content }), /outside/);
    assert.equal(prepare({ appId: 12345, depotId: 12346, contentRoot: content, output }).previewOnly, true);
    const app = fs.readFileSync(path.join(output, 'app_build_12345.vdf'), 'utf8');
    assert.match(app, /"Preview" "1"/); assert.match(app, /"SetLive" ""/);
    fs.writeFileSync(path.join(content, 'Lemonade Tycoon.exe'), 'changed');
    assert.throws(() => prepare({ appId: 12345, depotId: 12346, contentRoot: content, output }), /checksum/);
}));

test('diagnostics allow fixed events only and keep bounded logs without raw errors or saves', () => temporary(directory => {
    const diagnostics = createDiagnostics(directory);
    diagnostics.record('startup'); diagnostics.record('save-failed');
    assert.throws(() => diagnostics.record('secret path or save data'), /Unknown/);
    const lines = diagnostics.read().trim().split('\n').map(line => JSON.parse(line));
    assert.deepEqual(lines.map(line => line.event), ['startup', 'save-failed']);
    assert.deepEqual(Object.keys(lines[0]).sort(), ['event', 'time']);
    fs.writeFileSync(path.join(directory, 'diagnostics.jsonl'), 'x'.repeat(70000));
    diagnostics.record('startup'); assert.ok(diagnostics.read().length < 1000);
}));
