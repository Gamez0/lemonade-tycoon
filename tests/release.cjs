const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeManifest, verifyManifest } = require('../scripts/release-manifest.cjs');
const { auditDesktop } = require('../scripts/audit-desktop.cjs');
const { prepare } = require('../scripts/steam-prepare.cjs');
const { createDiagnostics } = require('../src/desktop/diagnostics.cjs');
const { auditPackage } = require('../scripts/audit-package.cjs');
const asar = require('@electron/asar');
const { validateRun, validateDraft, createDraft, findDraft } = require('../scripts/draft-release.cjs');

test('draft reruns reject renamed or duplicate version identities before creating another release', () => {
    const head = 'a'.repeat(40), version = '0.2.0-alpha.10';
    const draft = { id: 123, tag_name: `v${version}`, name: `Windows alpha ${version} - verified draft`, draft: true, prerelease: true, target_commitish: head, assets: [] };
    assert.equal(findDraft([draft], version, head), draft);
    assert.equal(findDraft([], version, head), undefined);
    assert.throws(() => findDraft([{ ...draft, tag_name: 'untagged-changed' }], version, head), /identity/);
    assert.throws(() => findDraft([draft, { ...draft, id: 456, tag_name: 'untagged-changed' }], version, head), /Multiple/);
    assert.throws(() => findDraft([{ ...draft, draft: false }], version, head), /internal draft/);
    assert.throws(() => findDraft([{ ...draft, target_commitish: 'b'.repeat(40) }], version, head), /exact source/);
    assert.equal(findDraft([{ ...draft, name: 'Unrelated', tag_name: 'v0.1.0', assets: [] }], version, head), undefined);
    // Edited display names must not hide an already-uploaded same-version bundle.
    assert.throws(() => findDraft([{ ...draft, name: 'Edited notes', tag_name: 'untagged-changed', assets: [{ name: `Willow-Lane-Lemonade-${version}-win-x64-aaaaaaa.zip` }] }], version, head), /identity/);
    assert.throws(() => validateDraft({ ...draft, id: 456 }, head, version, 123), /identity/);
    assert.throws(() => validateDraft({ ...draft, prerelease: false }, head, version, 123), /identity/);
});

test('draft creation uses the returned identity without an eventually consistent list lookup', () => {
    const head = 'a'.repeat(40), version = '0.2.0-alpha.2';
    const response = { id: 123, tag_name: `v${version}`, draft: true, prerelease: true, target_commitish: head, assets: [] };
    const requests = [];
    const request = (endpoint, payload) => { requests.push({ endpoint, payload }); return response; };
    assert.equal(createDraft(request, 'owner/game', version, head, 'Verified notes'), response);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].payload.draft, true);
    assert.equal(requests[0].payload.prerelease, true);
    assert.equal(requests[0].payload.body, 'Verified notes');
    assert.throws(() => createDraft(() => ({ ...response, draft: false }), 'owner/game', version, head, ''), /internal draft/);
    assert.throws(() => createDraft(() => ({ ...response, id: 0 }), 'owner/game', version, head, ''), /identity/);
    assert.throws(() => createDraft(() => ({ ...response, tag_name: 'another' }), 'owner/game', version, head, ''), /identity/);
    assert.throws(() => createDraft(() => ({ ...response, prerelease: false }), 'owner/game', version, head, ''), /identity/);
});
function temporary(run) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-release-'));
    try { run(directory); } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

test('shipped archive audit rejects missing notices, altered licenses and embedded research', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-notices-'));
    try {
        const stage = path.join(root, 'stage');
        const write = (file, bytes) => { fs.mkdirSync(path.dirname(path.join(stage, file)), { recursive: true }); fs.writeFileSync(path.join(stage, file), bytes); };
        for (const file of ['package.json', 'dist/index.html', 'dist/assets/game.js', 'dist/assets/font.ttf', ...['main.cjs', 'preload.cjs', 'file-storage.cjs', 'display-settings.cjs', 'close-checkpoint.cjs', 'diagnostics.cjs', 'icon.ico', 'save-limits.json'].map(name => `src/desktop/${name}`)]) write(file, 'fixture');
        write('CREDITS.txt', 'Willow Lane Lemonade');
        write('LICENSE', fs.readFileSync(path.resolve(__dirname, '../LICENSE')));
        const phaserNotice = fs.readFileSync(path.resolve(__dirname, '../node_modules/phaser/LICENSE.md'));
        write('LICENSE-Phaser.txt', phaserNotice);
        write('dist/licenses/OFL-Oswald.txt', fs.readFileSync(path.resolve(__dirname, '../public/fonts/OFL-Oswald.txt')));
        let variant = 0;
        const pack = async () => {
            const output = path.join(root, `package-${variant++}`);
            fs.mkdirSync(path.join(output, 'resources'), { recursive: true });
            fs.writeFileSync(path.join(output, 'LICENSE'), 'Copyright (c) Electron contributors');
            fs.writeFileSync(path.join(output, 'LICENSES.chromium.html'), '<html>runtime notice fixture</html>');
            await asar.createPackage(stage, path.join(output, 'resources/app.asar'));
            return output;
        };
        const valid = await pack();
        assert.ok(auditPackage(valid).notices['dist/licenses/OFL-Oswald.txt']);
        fs.unlinkSync(path.join(valid, 'LICENSES.chromium.html'));
        assert.throws(() => auditPackage(valid), /ENOENT/);
        fs.unlinkSync(path.join(stage, 'LICENSE-Phaser.txt'));
        const missing = await pack(); assert.throws(() => auditPackage(missing), /Missing shipped/);
        write('LICENSE-Phaser.txt', phaserNotice);
        write('dist/assets/reference.png', 'research');
        const contaminated = await pack(); assert.throws(() => auditPackage(contaminated), /Unapproved shipped/);
        fs.unlinkSync(path.join(stage, 'dist/assets/reference.png'));
        write('dist/licenses/OFL-Oswald.txt', 'truncated');
        const altered = await pack(); assert.throws(() => auditPackage(altered), /differs from source/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
function fixture(directory) {
    fs.mkdirSync(path.join(directory, 'resources'));
    for (const file of ['Lemonade Tycoon.exe', 'resources/app.asar', 'LICENSE', 'LICENSES.chromium.html'])
        fs.writeFileSync(path.join(directory, file), 'fixture');
    fs.writeFileSync(path.join(directory, 'build-info.json'), JSON.stringify({
        source_commit: 'a'.repeat(40), commit: 'b'.repeat(40), prototype: true }));
}

test('draft release requires exact successful main checks and preserves published/different-source releases', () => {
    const head = 'a'.repeat(40);
    const run = { path: '.github/workflows/checks.yml', head_branch: 'main', event: 'push', head_sha: head, status: 'completed', conclusion: 'success' };
    const jobs = [{ name: 'simulation', conclusion: 'success' }, { name: 'windows / packaged-saves', conclusion: 'success' }];
    assert.doesNotThrow(() => validateRun(run, head, jobs));
    for (const changes of [{ head_sha: 'b'.repeat(40) }, { head_branch: 'feature' }, { event: 'pull_request' }, { path: '.github/workflows/other.yml' }, { conclusion: 'failure' }, { status: 'in_progress' }])
        assert.throws(() => validateRun({ ...run, ...changes }, head, jobs), /current-main/);
    assert.throws(() => validateRun(run, head, jobs.slice(0, 1)), /missing\/failed/);
    assert.throws(() => validateRun(run, head, [{ ...jobs[0], conclusion: 'failure' }, jobs[1]]), /missing\/failed/);
    assert.doesNotThrow(() => validateDraft({ draft: true, target_commitish: head }, head));
    assert.throws(() => validateDraft({ draft: false, target_commitish: head }, head), /internal draft/);
    assert.throws(() => validateDraft({ draft: true, target_commitish: 'b'.repeat(40) }, head), /exact source/);
});
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
