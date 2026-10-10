const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { DEFAULT, fitSize, availableSizes, createPreferences } = require('../src/desktop/display-settings.cjs');

test('window presets and fallback fit taskbar/frame at 100-200% and a smaller replacement monitor', () => {
    for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
        for (const physical of [{ width: 1920, height: 1040 }, { width: 1366, height: 728 }]) {
            const workArea = { width: Math.floor(physical.width / scale), height: Math.floor(physical.height / scale) };
            const fitted = fitSize({ width: 1920, height: 1080 }, workArea);
            assert.ok(fitted.width + 32 <= workArea.width && fitted.height + 64 <= workArea.height);
            for (const size of availableSizes(workArea)) {
                assert.ok(size.width + 32 <= workArea.width && size.height + 64 <= workArea.height);
            }
        }
    }
});
test('display preferences restore separately from business files; corrupt/newer files are preserved until Apply', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-display-unit-'));
    const file = path.join(directory, 'display.json'), save = path.join(directory, 'save.json');
    try {
        fs.writeFileSync(save, 'business untouched');
        const preferences = createPreferences(directory);
        assert.deepEqual(preferences.get(), DEFAULT);
        preferences.set({ version: 1, mode: 'fullscreen', width: 800, height: 600 }, true);
        assert.equal(createPreferences(directory).get().mode, 'fullscreen');
        assert.equal(fs.readFileSync(save, 'utf8'), 'business untouched');
        for (const raw of ['{invalid', JSON.stringify({ ...DEFAULT, width: -1 }), JSON.stringify({ ...DEFAULT, version: 99 })]) {
            fs.writeFileSync(file, raw);
            const loaded = createPreferences(directory);
            assert.deepEqual(loaded.get(), DEFAULT);
            assert.ok(loaded.warning());
            assert.equal(fs.readFileSync(file, 'utf8'), raw);
            if (raw.includes('99')) {
                loaded.set({ ...DEFAULT, mode: 'windowed' });
                assert.equal(fs.readFileSync(file, 'utf8'), raw);
            }
            loaded.set(DEFAULT, true);
            assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), DEFAULT);
        }
        assert.throws(() => preferences.set({ ...DEFAULT, mode: 'invalid' }), /Invalid/);
        assert.throws(() => preferences.set({ ...DEFAULT, width: Infinity }), /Invalid/);
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
