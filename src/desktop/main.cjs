const { app, BrowserWindow, ipcMain, Menu, screen, dialog } = require('electron');
const { createCloseCheckpoint } = require('./close-checkpoint.cjs');
const { createPreferences, createDisplayController, fitSize } = require('./display-settings.cjs');
const path = require('node:path');
const { createFileStorage } = require('./file-storage.cjs');
const { maxSaveBytes } = require('./save-limits.json');

// The packaged game uses a small 2D canvas, not WebGL. Software compositing
// lowers private memory substantially; keep Chromium's sandbox/process isolation.
app.disableHardwareAcceleration();

let window;
let closeCheckpoint;
let displayController;
const storage = createFileStorage();
const diagnostics = require('./diagnostics.cjs').createDiagnostics();

function authorized(event) {
    if (!window || event.sender !== window.webContents) throw new Error('Unknown save caller.');
}

ipcMain.handle('save:get', (event, key) => {
    authorized(event);
    return storage.getItem(key);
});
ipcMain.handle('save:set', (event, key, value) => {
    authorized(event);
    if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > maxSaveBytes) throw new Error('Save file is too large.');
    try { storage.setItem(key, value); } catch (error) { diagnostics.record('save-failed'); throw error; }
});
ipcMain.on('save:flushed', (event, request, success) => {
    authorized(event);
    closeCheckpoint.acknowledge(request, success);
});

ipcMain.handle('app:quit', event => { authorized(event); window.close(); });
ipcMain.handle('display:get', event => { authorized(event); return displayController.state(); });
ipcMain.handle('display:set', (event, value) => { authorized(event); return displayController.apply(value); });
ipcMain.handle('app:diagnostics', event => { authorized(event); return { version: app.getVersion(), electron: process.versions.electron, platform: process.platform, architecture: process.arch, events: diagnostics.read() }; });

app.whenReady().then(() => {
    diagnostics.record('startup');
    Menu.setApplicationMenu(null);
    const preferences = createPreferences();
    const workArea = screen.getPrimaryDisplay().workArea;
    const initial = fitSize(preferences.get(), workArea);
    window = new BrowserWindow({
        x: workArea.x + Math.max(0, Math.floor((workArea.width - initial.width - 32) / 2)),
        y: workArea.y + Math.max(0, Math.floor((workArea.height - initial.height - 64) / 2)),
        width: initial.width,
        height: initial.height,
        minWidth: Math.min(800, initial.width),
        minHeight: Math.min(600, initial.height),
        useContentSize: true,
        icon: path.join(__dirname, 'icon.ico'),
        backgroundColor: '#9bc77e',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    displayController = createDisplayController(window, screen, preferences);
    window.webContents.on('render-process-gone', () => diagnostics.record('renderer-gone'));
    window.webContents.on('did-fail-load', () => diagnostics.record('load-failed'));
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event, url) => {
        if (url !== window.webContents.getURL()) event.preventDefault();
    });
    closeCheckpoint = createCloseCheckpoint({
        flush: request => window.webContents.send('save:flush', request),
        resume: () => { if (!window.webContents.isDestroyed()) window.webContents.send('save:resume'); },
        close: () => { if (!window.isDestroyed()) window.close(); },
        record: event => diagnostics.record(event),
        warn: async () => {
            const { response } = await dialog.showMessageBox(window, {
                type: 'warning', title: 'Business could not be saved',
                message: 'Your latest business could not be saved.',
                detail: 'Keep playing to retry or export a backup. Closing without saving may lose your latest changes.',
                buttons: ['Keep playing', 'Close without saving'], defaultId: 0, cancelId: 0, noLink: true,
            });
            return response === 1;
        },
    });
    window.on('close', event => closeCheckpoint.request(event));
    window.loadFile(path.join(__dirname, '../../dist/index.html'));
});

app.on('window-all-closed', () => app.quit());
