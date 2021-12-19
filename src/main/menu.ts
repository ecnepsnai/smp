import { BrowserWindow, Menu as EMenu } from 'electron';
import { App } from './app';
import { Dialog } from './dialog';

export class Menu {
    public static configureAppMenu(): void {
        const template: Electron.MenuItemConstructorOptions[] = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open Single File',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => {
                            const window = BrowserWindow.getFocusedWindow();
                            if (!window) {
                                return;
                            }
                            new Dialog(window).showOpenFileDialog().then(file => {
                                if (file !== null) {
                                    window.webContents.send('new_media', [file]);
                                }
                            });
                        }
                    },
                    {
                        label: 'Open Directory',
                        accelerator: 'CmdOrCtrl+Shift+O',
                        click: () => {
                            const window = BrowserWindow.getFocusedWindow();
                            if (!window) {
                                return;
                            }
                            new Dialog(window).showSelectFolderDialog().then(files => {
                                if (files !== null) {
                                    window.webContents.send('new_media', files);
                                }
                            });
                        }
                    },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Playback',
                submenu: [
                    {
                        label: 'Shuffle',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            const window = BrowserWindow.getFocusedWindow();
                            if (!window) {
                                return;
                            }
                            window.webContents.send('media_shuffle');
                        }
                    },
                    {
                        label: 'Prompt Before Deleting',
                        type: 'checkbox',
                        checked: App.promptBeforeDeletingChecked,
                        click: () => {
                            App.promptBeforeDeletingChecked = !App.promptBeforeDeletingChecked;
                        }
                    },
                    {
                        label: 'Permanently Delete File',
                        type: 'checkbox',
                        checked: App.permanentlyDeleteFile,
                        click: () => {
                            App.permanentlyDeleteFile = !App.permanentlyDeleteFile;
                        }
                    },
                    {
                        label: 'Stop',
                        click: () => {
                            const window = BrowserWindow.getFocusedWindow();
                            if (!window) {
                                return;
                            }
                            window.webContents.send('media_close');
                        }
                    },
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { role: 'close' }
                ]
            }
        ];
        if (process.platform === 'darwin') {
            template.splice(0, 0, {
                label: 'Simple Media Player',
                submenu: [
                    {
                        label: 'About Simple Media Player',
                        click: () => {
                            this.aboutMenuClicked(BrowserWindow.getFocusedWindow());
                        },
                    },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            });
        } else {
            template.push({
                label: 'Help',
                submenu: [
                    {
                        label: 'About Simple Media Player',
                        click: () => {
                            this.aboutMenuClicked(BrowserWindow.getFocusedWindow());
                        },
                    }
                ]
            });
        }

        const menu = EMenu.buildFromTemplate(template);
        EMenu.setApplicationMenu(menu);
    }

    private static aboutMenuClicked = (target: Electron.BrowserWindow) => {
        new Dialog(target).showAboutModal();
    };
}
