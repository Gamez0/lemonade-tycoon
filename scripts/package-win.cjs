const fs = require('node:fs');
const path = require('node:path');
const { packager } = require('@electron/packager');

const root = path.resolve(__dirname, '..');
const buildRoot = path.resolve(process.env.LEMONADE_DESKTOP_BUILD_ROOT || root);
const stage = path.join(buildRoot, '.desktop-build');
const output = path.join(buildRoot, 'release');
if (!path.resolve(stage).startsWith(buildRoot + path.sep)) throw new Error('Invalid desktop build path.');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(path.join(stage, 'src', 'desktop'), { recursive: true });
fs.cpSync(path.join(root, 'desktop-dist'), path.join(stage, 'dist'), { recursive: true });
for (const name of ['main.cjs', 'preload.cjs', 'file-storage.cjs', 'icon.ico'])
    fs.copyFileSync(path.join(root, 'src', 'desktop', name), path.join(stage, 'src', 'desktop', name));
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({
    name: 'lemonade-tycoon', version: '0.1.0', main: 'src/desktop/main.cjs',
}), 'utf8');
packager({ dir: stage, name: 'Lemonade Tycoon', platform: 'win32', arch: 'x64', out: output,
    icon: path.join(root, 'src', 'desktop', 'icon.ico'),
    overwrite: true, asar: true, prune: true, electronVersion: '44.5.1' })
    .then(paths => { for (const result of paths) process.stdout.write(`${result}\n`); })
    .catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
