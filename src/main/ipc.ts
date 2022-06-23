import { BrowserWindow, ipcMain, WebContents } from 'electron';
import { Dialog } from './dialog';
import { Updater } from './updater';
import * as manifest from '../../package.json';
import { Media } from './media';
import { App } from './app';

const browserWindowFromEvent = (sender: WebContents): BrowserWindow => {
    const windows = BrowserWindow.getAllWindows().filter(window => window.webContents.id === sender.id);
    return windows[0];
};

ipcMain.handle('get_files_from_args', () => {
    return Media.FromArgs();
});

ipcMain.on('set_title', (event, args) => {
    const window = browserWindowFromEvent(event.sender);
    window.title = args;
});

ipcMain.handle('open_single_file', async event => {
    return new Dialog(browserWindowFromEvent(event.sender)).showOpenFileDialog();
});

ipcMain.handle('open_directory', async event => {
    return new Dialog(browserWindowFromEvent(event.sender)).showSelectFolderDialog();
});

ipcMain.handle('delete_file', async (event, args) => {
    return Media.Delete(args, browserWindowFromEvent(event.sender));
});

ipcMain.handle('copy_flagged_media', async (event, args) => {
    return Media.CopyFlagged(args, browserWindowFromEvent(event.sender));
});

ipcMain.handle('error_dialog', async (event, args) => {
    return new Dialog(browserWindowFromEvent(event.sender)).showErrorDialog(args[0], args[1], args[2]);
});

ipcMain.handle('check_for_updates', async () => {
    return await Updater.GetNewerRelease();
});

ipcMain.on('open_in_browser', (event, args) => {
    App.openURL(args);
});

ipcMain.on('fatal_error', (event, args) => {
    const error = args[0] as Error;
    const errorInfo = args[1] as React.ErrorInfo;
    console.error('Fatal error from renderer: ' + error + errorInfo.componentStack);
    const window = browserWindowFromEvent(event.sender);

    new Dialog(window).showFatalErrorDialog().then(() => {
        window.reload();
    });
});

ipcMain.handle('runtime_versions', async () => {
    const app = manifest.version;
    const electron = manifest.dependencies.electron;
    const nodejs = process.version.substr(1);

    return {
        app: app,
        electron: electron,
        nodejs: nodejs,
    };
});

ipcMain.handle('show_file_info', async (event, args) => {
    const path = args[0] as string;
    return Media.Stat(path, browserWindowFromEvent(event.sender));
});
