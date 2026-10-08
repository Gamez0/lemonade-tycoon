const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { newGame, buy } = require('../.test-build/simulation/game.js');
const { readSave, writeSave, SAVE_KEY, BACKUP_KEY } = require('../.test-build/simulation/save.js');
const { createFileStorage, windowsSaveDirectory } = require('../src/desktop/file-storage.cjs');
const withStorage = callback => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-save-'));
    try { callback(createFileStorage(directory), directory); }
    finally { fs.rmSync(directory, { recursive: true, force: true }); }
};
test('Windows save location stays in the per-user data directory', () => {
    const base = 'C:\\Users\\player\\AppData\\Local';
    assert.equal(windowsSaveDirectory({ LOCALAPPDATA: base }, 'win32'), path.win32.join(base, 'Lemonade Tycoon'));
    assert.equal(windowsSaveDirectory({ APPDATA: 'C:\\Users\\player\\AppData\\Roaming' }, 'win32'),
        path.win32.join(base, 'Lemonade Tycoon'));
    assert.throws(() => windowsSaveDirectory({}, 'win32'), /unavailable/);
    assert.throws(() => windowsSaveDirectory({ LOCALAPPDATA: base }, 'linux'), /Windows/);
});
test('native file storage round-trips the same portable document', () => withStorage((storage, directory) => {
    const state = newGame(); writeSave(storage, state, []);
    assert.deepEqual(readSave(createFileStorage(directory)).document.state, state);
    assert.equal(fs.readdirSync(directory).some(file => file.endsWith('.tmp')), false);
    assert.throws(() => storage.getItem('../save.json'), /Unknown/);
}));
test('damaged primary recovers the previous valid checkpoint', () => withStorage((storage, directory) => {
    const first = newGame(); const second = buy(first, 'lemon', 10);
    writeSave(storage, first, []); writeSave(storage, second, []);
    storage.setItem(SAVE_KEY, '{');
    const recovered = readSave(createFileStorage(directory));
    assert.equal(recovered.recovered, true);
    assert.deepEqual(recovered.document.state, first);
    assert.equal(storage.getItem(BACKUP_KEY), JSON.stringify({ version: 4, state: first, history: [] }));
}));
