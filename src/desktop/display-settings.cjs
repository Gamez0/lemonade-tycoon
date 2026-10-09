const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { windowsSaveDirectory } = require('./file-storage.cjs');

const DEFAULT = Object.freeze({ version: 1, mode: 'windowed', width: 1100, height: 850 });
function valid(value) {
    return value && value.version === 1 && ['windowed', 'fullscreen'].includes(value.mode)
        && Number.isInteger(value.width) && value.width >= 320 && value.width <= 16384
        && Number.isInteger(value.height) && value.height >= 240 && value.height <= 16384;
}
// Electron screen and window bounds are logical pixels (Windows applies DPI).
function fitSize(size, workArea, frame = { width: 32, height: 64 }) {
    return { width: Math.max(1, Math.min(size.width, workArea.width - frame.width)),
        height: Math.max(1, Math.min(size.height, workArea.height - frame.height)) };
}
function availableSizes(workArea, frame) {
    const maximum = fitSize({ width: 16384, height: 16384 }, workArea, frame);
    const sizes = [[800, 600], [1024, 768], [1100, 850], [1280, 720], [1600, 900], [1920, 1080]]
        .filter(([width, height]) => width <= maximum.width && height <= maximum.height)
        .map(([width, height]) => ({ width, height }));
    sizes.push(fitSize(DEFAULT, workArea, frame), maximum);
    return sizes.filter((size, index) => sizes.findIndex(other => other.width === size.width && other.height === size.height) === index);
}
function createPreferences(directory = windowsSaveDirectory()) {
    const file = path.join(directory, 'display.json');
    let warning = '';
    let protectedFile = false;
    let settings = { ...DEFAULT };
    try {
        const raw = fs.readFileSync(file, 'utf8');
        if (Buffer.byteLength(raw, 'utf8') > 4096) throw new Error('Invalid preferences.');
        const parsed = JSON.parse(raw);
        if (Number.isInteger(parsed.version) && parsed.version > 1) {
            protectedFile = true;
            warning = 'Newer display settings were preserved. Apply to replace them.';
        } else if (valid(parsed)) settings = { version: 1, mode: parsed.mode, width: parsed.width, height: parsed.height };
        else throw new Error('Invalid preferences.');
    } catch (error) {
        if (error.code !== 'ENOENT') warning = 'Display settings could not be read. Using a safe window.';
    }
    return {
        get: () => ({ ...settings }),
        warning: () => warning,
        set(value, explicit = false) {
            if (!valid(value)) throw new Error('Invalid display settings.');
            settings = { ...value };
            if (protectedFile && !explicit) return;
            const temporary = path.join(directory, `.display-${crypto.randomUUID()}.tmp`);
            try {
                fs.mkdirSync(directory, { recursive: true });
                const handle = fs.openSync(temporary, 'wx', 0o600);
                try { fs.writeFileSync(handle, JSON.stringify(settings), 'utf8'); fs.fsyncSync(handle); }
                finally { fs.closeSync(handle); }
                fs.renameSync(temporary, file);
                protectedFile = false;
                warning = '';
            } catch {
                try { fs.unlinkSync(temporary); } catch { /* Preserve the original file. */ }
                warning = 'Applied for this session. Display settings could not be saved.';
            }
        },
    };
}
function createDisplayController(window, screen, preferences) {
    let applying = false;
    const display = () => screen.getDisplayMatching(window.getBounds());
    const frame = () => {
        if (window.isFullScreen() || window.isMaximized()) return { width: 32, height: 64 };
        const outer = window.getBounds(), inner = window.getContentBounds();
        // Keep a stable reserve: fractional Windows scaling can round reported
        // frame/client bounds differently after a resize. Exact-fit choices
        // otherwise change by a pixel and may put the title bar off-screen.
        return { width: Math.max(32, outer.width - inner.width), height: Math.max(64, outer.height - inner.height) };
    };
    function resize(size) {
        const monitor = display();
        const fitted = fitSize(size, monitor.workArea, frame());
        window.setMinimumSize(Math.min(800, fitted.width), Math.min(600, fitted.height));
        window.setContentSize(fitted.width, fitted.height);
        const bounds = window.getBounds(), area = monitor.workArea;
        window.setPosition(Math.round(area.x + (area.width - bounds.width) / 2), Math.round(area.y + (area.height - bounds.height) / 2));
        return fitted;
    }
    function state() {
        const monitor = display(), chosen = preferences.get();
        const sizes = availableSizes(monitor.workArea, frame());
        const fitted = fitSize(chosen, monitor.workArea, frame());
        if (!sizes.some(size => size.width === fitted.width && size.height === fitted.height)) sizes.push(fitted);
        return { mode: window.isFullScreen() ? 'fullscreen' : 'windowed', width: fitted.width, height: fitted.height,
            sizes, screen: monitor.bounds, scale: monitor.scaleFactor, warning: preferences.warning() };
    }
    function apply(value) {
        if (!value || !['windowed', 'fullscreen'].includes(value.mode)
            || !state().sizes.some(size => size.width === value.width && size.height === value.height)) throw new Error('Choose a size that fits this screen.');
        applying = true;
        try {
            window.setFullScreen(false);
            if (window.isMaximized()) window.unmaximize();
            const fitted = resize(value);
            preferences.set({ version: 1, mode: value.mode, ...fitted }, true);
            window.setFullScreen(value.mode === 'fullscreen');
        } finally { applying = false; }
        return state();
    }
    const chosen = preferences.get();
    resize(chosen);
    window.setFullScreen(chosen.mode === 'fullscreen');
    // Windows can deliver the initial per-monitor DPI change after construction.
    // Reapply once the native window has painted, using its settled frame/monitor.
    window.once('ready-to-show', () => {
        if (!window.isFullScreen()) resize(preferences.get());
    });
    window.on('leave-full-screen', () => {
        if (applying || window.isFullScreen()) return;
        preferences.set({ ...preferences.get(), mode: 'windowed' });
        resize(preferences.get());
    });
    const changed = () => {
        if (!window.isDestroyed() && !window.isFullScreen() && !window.isMaximized()) resize(preferences.get());
    };
    screen.on('display-removed', changed);
    screen.on('display-metrics-changed', changed);
    window.once('closed', () => {
        screen.removeListener('display-removed', changed);
        screen.removeListener('display-metrics-changed', changed);
    });
    return { state, apply };
}
module.exports = { DEFAULT, valid, fitSize, availableSizes, createPreferences, createDisplayController };
