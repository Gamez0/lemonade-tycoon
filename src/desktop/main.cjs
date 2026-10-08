const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('node:path');
const { createFileStorage } = require('./file-storage.cjs');

let window;
let closing = false;
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
    if (typeof value !== 'string' || value.length > 2_000_000) throw new Error('Save file is too large.');
    try { storage.setItem(key, value); } catch (error) { diagnostics.record('save-failed'); throw error; }
});
ipcMain.on('save:flushed', event => {
    authorized(event);
    closing = true;
    window.close();
});

ipcMain.handle('app:quit', event => { authorized(event); window.close(); });
ipcMain.handle('app:diagnostics', event => { authorized(event); return { version: app.getVersion(), electron: process.versions.electron, platform: process.platform, architecture: process.arch, events: diagnostics.read() }; });

app.whenReady().then(() => {
    diagnostics.record('startup');
    Menu.setApplicationMenu(null);
    window = new BrowserWindow({
        width: 1100,
        height: 850,
        minWidth: 800,
        minHeight: 600,
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
    window.webContents.on('render-process-gone', () => diagnostics.record('renderer-gone'));
    window.webContents.on('did-fail-load', () => diagnostics.record('load-failed'));
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event, url) => {
        if (url !== window.webContents.getURL()) event.preventDefault();
    });
    window.on('close', event => {
        if (closing || window.webContents.isDestroyed()) return;
        event.preventDefault();
        window.webContents.send('save:flush');
        setTimeout(() => {
            if (!window.isDestroyed()) {
                diagnostics.record('close-timeout');
                closing = true;
                window.close();
            }
        }, 5000);
    });
    window.loadFile(path.join(__dirname, '../../dist/index.html'));
});

app.on('window-all-closed', () => app.quit());
