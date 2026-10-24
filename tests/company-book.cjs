const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CompanyBook, COMPANY_KEY } = require('../.test-build/simulation/company-book.js');
const { newGame } = require('../.test-build/simulation/game.js');
const { encodeSave, SAVE_KEY } = require('../.test-build/simulation/save.js');
const first = encodeSave(newGame(), []), second = encodeSave(newGame(300), [], 'company-second');
const limit = 16000000;
function fixture(fail = 0) {
    const data = new Map([[SAVE_KEY, first]]); let writes = 0, current = first;
    const storage = { getItem: async key => data.get(key) ?? null,
        setItem: async (key, value) => { if (++writes === fail) throw Error('Disk unavailable'); data.set(key, value); } };
    return { data, storage, book: new CompanyBook(storage, limit), current: () => current,
        apply: raw => { current = raw; }, write: raw => storage.setItem(SAVE_KEY, raw) };
}
test('existing autosave becomes the first of eight companies without writing either file', async () => {
    const f = fixture(); await f.book.load(first);
    assert.equal(f.data.size, 1); assert.equal(f.book.companies.length, 8);
    assert.equal(f.book.companies[0].raw, first); assert.equal(f.book.active, 0);
});
test('switching keeps both companies, selects their exact state and preserves a later autosave', async () => {
    const f = fixture(); await f.book.load(first);
    await f.book.select(1, first, { name: 'Second', raw: second }, f.write, f.apply);
    assert.equal(f.book.active, 1); assert.equal(f.current(), second);
    await f.book.select(0, second, null, f.write, f.apply);
    assert.equal(f.current(), first); assert.equal(f.book.companies[1].raw, second);
    const later = encodeSave(newGame(1000), []); await f.write(later);
    const reloaded = new CompanyBook(f.storage, limit); await reloaded.load(later);
    assert.equal(reloaded.active, 0); assert.equal(reloaded.companies[0].raw, later);
});
for (const failure of [1, 2, 3]) test(`failed company transfer at durable write${failure} recovers without losing the old company`, async () => {
    const f = fixture(failure); await f.book.load(first);
    await assert.rejects(f.book.select(1, first, { name: 'Second', raw: second }, f.write, f.apply), /Disk/);
    assert.equal(f.book.blocked, true);
    const reloaded = new CompanyBook(f.storage, limit); await reloaded.load(f.data.get(SAVE_KEY));
    assert.equal(reloaded.active, failure === 3 ? 1 : 0);
    assert.equal(reloaded.companies[0].raw, first);
    assert.equal(f.current(), failure === 3 ? second : first);
    assert.equal(reloaded.blocked, false);
});
test('an interrupted explicit replacement restores the old company name and data', async () => {
    const f = fixture(2); await f.book.load(first);
    await assert.rejects(f.book.select(0, first, { name: 'Replacement', raw: second }, f.write, f.apply));
    const reloaded = new CompanyBook(f.storage, limit); await reloaded.load(first);
    assert.deepEqual(reloaded.companies[0], { name: 'Company 1', raw: first });
});
test('newer or malformed company files and mismatched journals are never overwritten', async () => {
    for (const raw of ['{"version":999}', '{broken', JSON.stringify({ version: 1, active: 0,
        companies: [{ name: 'Old', raw: first }, { name: 'New', raw: second }, ...Array(6).fill(null)],
        pending: { from: 0, to: 1, previous: first, next: second, target: null } })]) {
        const f = fixture(); f.data.set(COMPANY_KEY, raw);
        await assert.rejects(f.book.load(encodeSave(newGame(1000), [])));
        assert.equal(f.data.get(COMPANY_KEY), raw); assert.equal(f.data.get(SAVE_KEY), first);
        assert.equal(f.book.blocked, true);
    }
});
test('oversized names, invalid slots and full storage reject before the primary changes', async () => {
    const f = fixture(); await f.book.load(first);
    await assert.rejects(f.book.select(8, first, null, f.write, f.apply));
    await assert.rejects(f.book.select(1, first, { name: 'x'.repeat(41), raw: second }, f.write, f.apply));
    const tiny = new CompanyBook(f.storage, 100); await tiny.load(first);
    await assert.rejects(tiny.select(1, first, { name: 'Second', raw: second }, f.write, f.apply), /full/);
    assert.equal(f.data.get(SAVE_KEY), first); assert.equal(f.data.has(COMPANY_KEY), false);
});
test('all eight slots survive switching and confirmed replacement changes only its selected company', async () => {
    const f = fixture(); await f.book.load(first);
    for (let i = 1; i < 8; i++) await f.book.select(i, f.current(), { name: `Company ${i + 1}`, raw: encodeSave(newGame(i), [], `company-${i}`) }, f.write, f.apply);
    const before = JSON.parse(f.data.get(COMPANY_KEY));
    await f.book.select(3, f.current(), { name: 'Renamed', raw: second }, f.write, f.apply);
    for (let i = 0; i < 8; i++) if (i !== 3) assert.deepEqual(f.book.companies[i], before.companies[i]);
    assert.deepEqual(f.book.companies[3], { name: 'Renamed', raw: second });
});
test('a generic backup from another company recovers the active company snapshot, not the other company data', async () => {
    const f = fixture(); await f.book.load(first);
    await f.book.select(1, first, { name: 'Second', raw: second }, f.write, f.apply);
    const reloaded = new CompanyBook(f.storage, limit);
    assert.equal(await reloaded.load(first, true), second);
    assert.equal(reloaded.active, 1); assert.equal(reloaded.companies[0].raw, first);
    assert.equal(reloaded.companies[1].raw, second);
});
test('a same-company backup keeps its more recent state and optional identity survives save roundtrip', async () => {
    const f = fixture(); await f.book.load(first);
    await f.book.select(1, first, { name: 'Second', raw: second }, f.write, f.apply);
    const newer = encodeSave(newGame(1000), [], 'company-second');
    const reloaded = new CompanyBook(f.storage, limit);
    assert.equal(await reloaded.load(newer, true), newer);
    assert.equal(require('../.test-build/simulation/save.js').decodeSave(newer).companyId, 'company-second');
    assert.throws(() => encodeSave(newGame(), [], '<script>'), /identity/);
});
