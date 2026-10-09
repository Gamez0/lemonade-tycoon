const fs = require('node:fs');
const path = require('node:path');
const { windowsSaveDirectory } = require('./file-storage.cjs');
const EVENTS = new Set(['startup', 'save-failed', 'renderer-gone', 'load-failed', 'close-timeout']);
function createDiagnostics(directory = windowsSaveDirectory()) {
    const file = path.join(directory, 'diagnostics.jsonl');
    return {
        record(event) {
            if (!EVENTS.has(event)) throw new Error('Unknown diagnostic event.');
            try {
                fs.mkdirSync(directory, { recursive: true });
                if (fs.existsSync(file) && fs.statSync(file).size > 65536) fs.writeFileSync(file, '');
                fs.appendFileSync(file, JSON.stringify({ time: new Date().toISOString(), event }) + '\n');
            } catch { /* Diagnostics must not block saves or launch. */ }
        },
        read() {
            try { return fs.readFileSync(file, 'utf8').slice(-65536); } catch { return ''; }
        },
    };
}
module.exports = { createDiagnostics };
