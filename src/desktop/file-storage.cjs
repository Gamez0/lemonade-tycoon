const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SAVE_KEY = 'lemonade-tycoon.reboot.save';
const BACKUP_KEY = 'lemonade-tycoon.reboot.backup';
const FILES = Object.freeze({ [SAVE_KEY]: 'save.json', [BACKUP_KEY]: 'save.backup.json' });

function windowsSaveDirectory(env = process.env, platform = process.platform) {
    if (platform !== 'win32') throw new Error('A Windows user-data directory is required.');
    const base = env.LOCALAPPDATA || (env.APPDATA && path.win32.join(env.APPDATA, '..', 'Local'));
    if (!base || !path.win32.isAbsolute(base)) throw new Error('Windows user-data path is unavailable.');
    return path.win32.join(base, 'Lemonade Tycoon');
}

function createFileStorage(directory = windowsSaveDirectory()) {
    function target(key) {
        if (!Object.hasOwn(FILES, key)) throw new Error('Unknown save key.');
        return path.join(directory, FILES[key]);
    }
    return {
        getItem(key) {
            try { return fs.readFileSync(target(key), 'utf8'); }
            catch (error) {
                if (error.code === 'ENOENT') return null;
                throw error;
            }
        },
        setItem(key, value) {
            if (typeof value !== 'string') throw new TypeError('Save data must be text.');
            const file = target(key);
            fs.mkdirSync(directory, { recursive: true });
            const temporary = path.join(directory, `.save-${crypto.randomUUID()}.tmp`);
            try {
                const handle = fs.openSync(temporary, 'wx', 0o600);
                try { fs.writeFileSync(handle, value, 'utf8'); fs.fsyncSync(handle); }
                finally { fs.closeSync(handle); }
                fs.renameSync(temporary, file);
            } catch (error) {
                try { fs.unlinkSync(temporary); } catch { /* The original write failure is more useful. */ }
                throw error;
            }
        },
    };
}

module.exports = { createFileStorage, windowsSaveDirectory };
