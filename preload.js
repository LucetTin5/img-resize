const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
  processImages: (data) => ipcRenderer.invoke('process-images', data),
  onProcessingProgress: (callback) => {
    ipcRenderer.on('processing-progress', callback);
    return () => ipcRenderer.removeAllListeners('processing-progress');
  }
});