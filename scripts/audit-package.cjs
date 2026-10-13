// Inspect the shipped archive, not just the pre-packaging build directory.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const asar = require('@electron/asar');

function auditPackage(directory) {
    const native = file => file.split('/').join(path.sep);
    const archive = path.join(directory, 'resources', 'app.asar');
    const files = asar.listPackage(archive).map(file => file.replace(/\\/g, '/').replace(/^\//, ''));
    const leaves = files.filter(file => {
        const info = asar.statFile(archive, native(file), false);
        if (info.link || info.unpacked) throw new Error(`Unexpected archive link/unpacked file: ${file}`);
        return !info.files;
    });
    const exact = ['CREDITS.txt', 'LICENSE', 'LICENSE-Phaser.txt', 'package.json', 'dist/index.html', 'dist/licenses/OFL-Oswald.txt',
        ...['main.cjs', 'preload.cjs', 'file-storage.cjs', 'display-settings.cjs', 'close-checkpoint.cjs', 'diagnostics.cjs', 'icon.ico', 'save-limits.json'].map(file => `src/desktop/${file}`)];
    for (const file of exact) if (!leaves.includes(file)) throw new Error(`Missing shipped file/notice: ${file}`);
    for (const file of leaves) if (!exact.includes(file) && !/^dist\/assets\/[^/]+\.(js|css|ttf)$/.test(file)) throw new Error(`Unapproved shipped content: ${file}`);
    if (!leaves.some(file => /^dist\/assets\/[^/]+\.ttf$/.test(file))) throw new Error('Missing shipped font');
    const notices = {};
    for (const [file, source] of [['LICENSE', 'LICENSE'], ['LICENSE-Phaser.txt', 'node_modules/phaser/LICENSE.md'], ['dist/licenses/OFL-Oswald.txt', 'public/fonts/OFL-Oswald.txt']]) {
        const bytes = asar.extractFile(archive, native(file));
        if (!bytes.equals(fs.readFileSync(path.resolve(__dirname, '..', source)))) throw new Error(`Shipped notice differs from source: ${file}`);
        notices[file] = createHash('sha256').update(bytes).digest('hex');
    }
    if (!asar.extractFile(archive, 'CREDITS.txt').toString().includes('Willow Lane Lemonade')) throw new Error('Missing game credits');
    for (const [file, marker] of [['LICENSE', 'Copyright (c) Electron contributors'], ['LICENSES.chromium.html', '<html']]) {
        const bytes = fs.readFileSync(path.join(directory, file));
        if (!bytes.toString().includes(marker)) throw new Error(`Invalid runtime notice: ${file}`);
        notices[`runtime/${file}`] = createHash('sha256').update(bytes).digest('hex');
    }
    return { scope: 'Shipped content and notice completeness; name/contributor rights require separate acceptance.', files: leaves.sort(), notices };
}
if (require.main === module) {
    try { console.log(JSON.stringify(auditPackage(path.resolve(process.argv[2])), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { auditPackage };
