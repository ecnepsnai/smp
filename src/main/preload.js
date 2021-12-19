import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('SMP', {
    setTitle: (title) => ipcRenderer.send('set_title', title),
    openSingleFile: () => ipcRenderer.invoke('open_single_file'),
    openDirectory: () => ipcRenderer.invoke('open_directory'),
    deleteMedia: (path) => ipcRenderer.invoke('delete_file', path),
    onMediaLoad: (cb) => ipcRenderer.on('media_load', cb),
    onMediaShuffle: (cb) => ipcRenderer.on('media_shuffle', cb),
    onMediaClose: (cb) => ipcRenderer.on('media_close', cb),
    onCopyFlaggedMedia: (cb) => ipcRenderer.on('media_copy_flagged', cb),
    copyFlaggedMedia: (paths) => ipcRenderer.invoke('copy_flagged_media', paths),
    errorDialog: (title, body, detail) => ipcRenderer.invoke('error_dialog', [title, body, detail]),
    checkForUpdates: () => ipcRenderer.invoke('check_for_updates'),
    openInBrowser: (url) => ipcRenderer.send('open_in_browser', url),
    fatalError: (error, errorInfo) => ipcRenderer.send('fatal_error', [error, errorInfo]),
    runtimeVersions: () => ipcRenderer.invoke('runtime_versions', []),
});
