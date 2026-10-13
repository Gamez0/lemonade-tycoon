const fs = require('node:fs');
const path = require('node:path');

function resolveOutput(packageRoot, outputDirectory) {
    const content = fs.realpathSync(path.resolve(packageRoot));
    let parent = path.resolve(outputDirectory);
    const suffix = [];
    while (!fs.existsSync(parent)) {
        suffix.unshift(path.basename(parent));
        const next = path.dirname(parent);
        if (next === parent) throw new Error('Output filesystem root is unavailable.');
        parent = next;
    }
    const output = path.join(fs.realpathSync(parent), ...suffix);
    const relative = path.relative(content, output);
    if (!relative || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)))
        throw new Error('ZIP output must be outside the package');
    return { content, output };
}

if (require.main === module) {
    try { console.log(JSON.stringify(resolveOutput(process.argv[2], process.argv[3]))); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { resolveOutput };
