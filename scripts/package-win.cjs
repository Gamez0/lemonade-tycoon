const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { packager } = require('@electron/packager');

const root = path.resolve(__dirname, '..');
const buildRoot = path.resolve(process.env.LEMONADE_DESKTOP_BUILD_ROOT || root);
const stage = path.join(buildRoot, '.desktop-build');
const output = path.join(buildRoot, 'release');
if (!path.resolve(stage).startsWith(buildRoot + path.sep)) throw new Error('Invalid desktop build path.');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(path.join(stage, 'src', 'desktop'), { recursive: true });
fs.cpSync(path.join(root, 'desktop-dist'), path.join(stage, 'dist'), { recursive: true });
for (const name of ['main.cjs', 'preload.cjs', 'file-storage.cjs', 'icon.ico', 'diagnostics.cjs'])
    fs.copyFileSync(path.join(root, 'src', 'desktop', name), path.join(stage, 'src', 'desktop', name));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(stage, 'LICENSE'));
fs.copyFileSync(path.join(root, 'node_modules', 'phaser', 'LICENSE.md'), path.join(stage, 'LICENSE-Phaser.txt'));
fs.copyFileSync(path.join(root, 'docs', 'release', 'credits.txt'), path.join(stage, 'CREDITS.txt'));
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({
    name: 'lemonade-tycoon', version: '0.2.0-alpha.1', main: 'src/desktop/main.cjs',
}), 'utf8');
packager({ dir: stage, name: 'Lemonade Tycoon', platform: 'win32', arch: 'x64', out: output,
    icon: path.join(root, 'src', 'desktop', 'icon.ico'),
    overwrite: true, asar: true, prune: true, electronVersion: '44.5.1' })
    .then(paths => {
        const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
        const dirty = Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim());
        for (const result of paths) {
            fs.writeFileSync(path.join(result, 'build-info.json'), JSON.stringify({ commit, source_commit: process.env.LEMONADE_SOURCE_COMMIT || commit, dirty, version: '0.2.0-alpha.1', prototype: true, node: process.versions.node, electron: '44.5.1', platform: 'win32', architecture: 'x64' }, null, 2));
            process.stdout.write(`${result}\n`);
        }
    })
    .catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
