const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { createFileStorage } = require('./file-storage.cjs');

let window;
let closing = false;
const storage = createFileStorage();

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
    storage.setItem(key, value);
});
ipcMain.on('save:flushed', event => {
    authorized(event);
    closing = true;
    window.close();
});

app.whenReady().then(() => {
    window = new BrowserWindow({
        width: 1100,
        height: 850,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#9bc77e',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
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
                closing = true;
                window.close();
            }
        }, 5000);
    });
    window.loadFile(path.join(__dirname, '../../dist/index.html'));
});

app.on('window-all-closed', () => app.quit());
