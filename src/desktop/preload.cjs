const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopSave', {
    getItem: key => ipcRenderer.invoke('save:get', key),
    setItem: (key, value) => ipcRenderer.invoke('save:set', key, value),
    onFlush: handler => {
        ipcRenderer.on('save:flush', async (_event, request) => {
            try { await handler(true); ipcRenderer.send('save:flushed', request, true); }
            catch { ipcRenderer.send('save:flushed', request, false); }
        });
        ipcRenderer.on('save:resume', () => { void handler(false).catch(() => {}); });
    },
});

contextBridge.exposeInMainWorld('desktopApp', {
    quit: () => ipcRenderer.invoke('app:quit'), diagnostics: () => ipcRenderer.invoke('app:diagnostics'),
    display: () => ipcRenderer.invoke('display:get'),
    setDisplay: value => ipcRenderer.invoke('display:set', value),
});
