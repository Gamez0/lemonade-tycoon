const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const MANIFEST = 'release-manifest.json';
function inventory(directory) {
    const files = [];
    function walk(base, prefix = '') {
        for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
            const relative = prefix + entry.name;
            if (entry.isSymbolicLink()) throw new Error(`Symlink rejected: ${relative}`);
            if (entry.isDirectory()) walk(path.join(base, entry.name), relative + '/');
            else if (entry.isFile() && relative !== MANIFEST) {
                const bytes = fs.readFileSync(path.join(base, entry.name));
                files.push({ path: relative, bytes: bytes.length,
                    sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
            } else if (!entry.isFile()) throw new Error(`Unexpected file type: ${relative}`);
        }
    }
    walk(directory);
    return files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
function writeManifest(directory) {
    const info = JSON.parse(fs.readFileSync(path.join(directory, 'build-info.json'), 'utf8').replace(/^\uFEFF/, ''));
    if (!/^[a-f0-9]{40}$/.test(info.source_commit) || !/^[a-f0-9]{40}$/.test(info.commit) || info.prototype !== true)
        throw new Error('Missing valid prototype source/checkout metadata');
    const files = inventory(directory);
    for (const required of ['Lemonade Tycoon.exe', 'resources/app.asar', 'LICENSE', 'LICENSES.chromium.html'])
        if (!files.some(file => file.path === required)) throw new Error(`Missing package file: ${required}`);
    const document = { version: 1, algorithm: 'sha256', source_commit: info.source_commit,
        checkout_commit: info.commit, prototype: true, files };
    fs.writeFileSync(path.join(directory, MANIFEST), JSON.stringify(document, null, 2) + '\n');
    return document;
}
function verifyManifest(directory) {
    const document = JSON.parse(fs.readFileSync(path.join(directory, MANIFEST), 'utf8'));
    if (document.version !== 1 || document.algorithm !== 'sha256' || document.prototype !== true)
        throw new Error('Unsupported manifest');
    const info = JSON.parse(fs.readFileSync(path.join(directory, 'build-info.json'), 'utf8').replace(/^\uFEFF/, ''));
    if (document.source_commit !== info.source_commit || document.checkout_commit !== info.commit)
        throw new Error('Manifest source metadata mismatch');
    if (JSON.stringify(document.files) !== JSON.stringify(inventory(directory)))
        throw new Error('Package inventory/checksum mismatch');
    return document;
}
if (require.main === module) {
    try {
        const directory = process.argv[2];
        if (!directory) throw new Error('Usage: release-manifest.cjs DIRECTORY [--verify]');
        const result = process.argv[3] === '--verify' ? verifyManifest(directory) : writeManifest(directory);
        console.log(`Prototype manifest ${process.argv[3] === '--verify' ? 'verified' : 'written'}: ${result.files.length} files`);
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { writeManifest, verifyManifest };
