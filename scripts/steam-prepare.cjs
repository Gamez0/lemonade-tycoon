const fs = require('node:fs');
const path = require('node:path');
const { verifyManifest } = require('./release-manifest.cjs');
function prepare({ appId, depotId, contentRoot, output }) {
    if (![appId, depotId].every(id => /^[1-9]\d{2,9}$/.test(String(id))) || String(appId) === '480' || String(appId) === String(depotId))
        throw new Error('Provide distinct real Steam AppID and Windows DepotID; sample IDs are not upload targets.');
    const content = path.resolve(contentRoot), target = path.resolve(output);
    if (target === content || target.startsWith(content + path.sep)) throw new Error('Build scripts/output must be outside depot content.');
    const manifest = verifyManifest(content);
    const quote = value => {
        if (/["\r\n\0]/.test(String(value))) throw new Error('Invalid VDF value.');
        return `"${String(value).replace(/\\/g, '/')}"`;
    };
    fs.mkdirSync(target, { recursive: true });
    const depot = `depot_build_${depotId}.vdf`;
    fs.writeFileSync(path.join(target, depot), `"DepotBuild"\n{\n "DepotID" ${quote(depotId)}\n "FileMapping" { "LocalPath" "*" "DepotPath" "." "Recursive" "1" }\n "FileExclusion" "*.pdb"\n "FileExclusion" "*.tmp"\n}\n`);
    const app = `"AppBuild"\n{\n "AppID" ${quote(appId)}\n "Desc" ${quote(`Willow Lane candidate ${manifest.source_commit}`)}\n "ContentRoot" ${quote(content)}\n "BuildOutput" ${quote(path.join(target, 'cache'))}\n "Preview" "1"\n "SetLive" ""\n "Depots" { ${quote(depotId)} ${quote(depot)} }\n}\n`;
    fs.writeFileSync(path.join(target, `app_build_${appId}.vdf`), app);
    return { appId: String(appId), depotId: String(depotId), source: manifest.source_commit, previewOnly: true, files: manifest.files.length };
}
if (require.main === module) {
    try {
        const [, , appId, depotId, contentRoot, output] = process.argv;
        if (!contentRoot || !output) throw new Error('Usage: node scripts/steam-prepare.cjs APP_ID DEPOT_ID PACKAGE_DIRECTORY OUTPUT_DIRECTORY');
        console.log(JSON.stringify(prepare({ appId, depotId, contentRoot, output }), null, 2));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { prepare };
