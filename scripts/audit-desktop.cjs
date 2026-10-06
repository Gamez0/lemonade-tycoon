const fs = require('node:fs');
const path = require('node:path');
function auditDesktop(directory) {
    const files = [];
    function walk(base, prefix = '') {
        for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
            const relative = prefix + entry.name;
            if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${relative}`);
            if (entry.isDirectory()) walk(path.join(base, entry.name), relative + '/');
            else if (entry.isFile()) files.push(relative);
            else throw new Error(`Unexpected file type: ${relative}`);
        }
    }
    walk(directory);
    for (const required of ['index.html', 'licenses/OFL-Oswald.txt'])
        if (!files.includes(required)) throw new Error(`Missing desktop asset: ${required}`);
    if (!files.some(file => /^assets\/[^/]+\.ttf$/.test(file))) throw new Error('Missing bundled font');
    for (const file of files)
        if (!(file === 'index.html' || file === 'licenses/OFL-Oswald.txt' || /^assets\/[^/]+\.(js|css|ttf)$/.test(file)))
            throw new Error(`Unapproved desktop asset: ${file}`);
    return files.sort();
}
if (require.main === module) {
    try { console.log(`Desktop asset audit passed: ${auditDesktop(process.argv[2]).length} files`); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { auditDesktop };
