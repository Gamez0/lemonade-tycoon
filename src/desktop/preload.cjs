const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopSave', {
    getItem: key => ipcRenderer.invoke('save:get', key),
    setItem: (key, value) => ipcRenderer.invoke('save:set', key, value),
    onFlush: handler => ipcRenderer.on('save:flush', async () => {
        try { await handler(); } finally { ipcRenderer.send('save:flushed'); }
    }),
});
