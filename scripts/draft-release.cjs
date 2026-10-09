const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');

function validateRun(run, head, jobs) {
    if (run.path !== '.github/workflows/checks.yml' || run.head_branch !== 'main' || !['push', 'workflow_dispatch'].includes(run.event) ||
        run.head_sha !== head || run.status !== 'completed' || run.conclusion !== 'success') throw new Error('A successful current-main Reboot checks run is required.');
    for (const name of ['simulation', 'windows / packaged-saves']) if (!jobs.some(job => job.name === name && job.conclusion === 'success')) throw new Error(`Required release check missing/failed: ${name}`);
}
function validateDraft(release, head) {
    if (release.draft !== true || release.target_commitish !== head) throw new Error('Existing release must be an internal draft for this exact source.');
}
const gh = args => execFileSync('gh', args, { encoding: 'utf8' });
const api = endpoint => JSON.parse(gh(['api', endpoint]));
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function main() {
    const runId = process.argv[2] || process.env.RELEASE_CHECK_RUN;
    if (!/^\d+$/.test(runId || '')) throw new Error('Provide the successful main checks run ID.');
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const repo = process.env.GH_REPO || JSON.parse(gh(['repo', 'view', '--json', 'nameWithOwner'])).nameWithOwner;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Invalid repository.');
    if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) throw new Error('Draft preparation requires a clean checkout.');
    const run = api(`repos/${repo}/actions/runs/${runId}`);
    validateRun(run, head, api(`repos/${repo}/actions/runs/${runId}/jobs?per_page=100`).jobs);
    const version = require('../package.json').version;
    if (!/^\d+\.\d+\.\d+-[a-zA-Z0-9.-]+$/.test(version)) throw new Error('Draft workflow requires a prerelease version.');
    const fileName = `Willow-Lane-Lemonade-${version}-win-x64-${head.slice(0, 7)}.zip`;
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-release-draft-'));
    try {
        gh(['run', 'download', runId, '--repo', repo, '--name', `windows-prototype-${head}`, '--dir', work]);
        const expected = [fileName, `${fileName}.sha256`, `${fileName}.manifest.json`].sort();
        if (JSON.stringify(fs.readdirSync(work).sort()) !== JSON.stringify(expected)) throw new Error('Unexpected release artifact inventory.');
        const digest = sha(path.join(work, fileName));
        if (fs.readFileSync(path.join(work, `${fileName}.sha256`), 'utf8').trim() !== `${digest}  ${fileName}`) throw new Error('Downloaded ZIP checksum mismatch.');
        const manifest = JSON.parse(fs.readFileSync(path.join(work, `${fileName}.manifest.json`), 'utf8'));
        if (manifest.source_commit !== head || manifest.checkout_commit !== head || manifest.prototype !== true || manifest.algorithm !== 'sha256') throw new Error('Release artifact belongs to another source.');
        const tag = `v${version}`;
        // Preserve all published releases and refuse to silently retarget an older draft.
        const releases = JSON.parse(gh(['api', '--paginate', '--slurp', `repos/${repo}/releases?per_page=100`])).flat();
        let release = releases.find(candidate => candidate.tag_name === tag);
        if (release) validateDraft(release, head);
        const body = path.join(work, 'release-notes.md');
        fs.writeFileSync(body, `Internal Windows alpha ${version}; draft only.\n\nSource/checkout: ${head}.\nVerified checks: ${run.html_url}.\n\nThis ZIP is the exact Windows CI artifact, with complete package checksums verified before upload. Required browser/simulation and native save/UI/scales/locations/management/audio/campaign suites passed.\n\nUnsigned portable Windows x64, English interface. Extract the complete product ZIP and launch Lemonade Tycoon.exe; retain all notices. Export a save before updating; v5 migration preserves historical accounting. The compatibility executable/save directory remains unchanged.\n\nZIP: ${fileName}\nSHA256: ${digest}\n\nManual playtest/clean-PC/physical-DPI acceptance is deferred by the user for this engineering run; no human/device approval is claimed. Final rights/media and actual Steam partner/install/submission evidence remain separate. No public release, Steam upload or paid action occurs here.\n`);
        if (!release) {
            gh(['release', 'create', tag, '--repo', repo, '--draft', '--prerelease', '--target', head, '--title', `Windows alpha ${version} · verified draft`, '--notes-file', body]);
            release = api(`repos/${repo}/releases`).find(candidate => candidate.tag_name === tag);
            if (!release) throw new Error('Created draft was not returned by GitHub.');
            validateDraft(release, head);
        }
        for (const file of expected) {
            const existing = release.assets.find(asset => asset.name === file);
            if (existing) {
                if (existing.digest !== `sha256:${sha(path.join(work, file))}`) throw new Error(`Existing draft asset differs: ${file}`);
                continue;
            }
            gh(['release', 'upload', tag, path.join(work, file), '--repo', repo]);
        }
        const final = api(`repos/${repo}/releases/${release.id}`);
        validateDraft(final, head);
        for (const file of expected) if (!final.assets.some(asset => asset.name === file && asset.digest === `sha256:${sha(path.join(work, file))}`)) throw new Error(`Uploaded digest not verified: ${file}`);
        console.log(JSON.stringify({ draft: true, version, source: head, run: runId, url: final.html_url, zipSha256: digest }));
    } finally {
        if (!path.resolve(work).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Invalid draft temporary path.');
        fs.rmSync(work, { recursive: true, force: true });
    }
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { validateRun, validateDraft };
