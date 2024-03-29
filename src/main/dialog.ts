import { shell, BrowserWindow, dialog } from 'electron';
import { App } from './app';
import { Paths } from './paths';
import { Media } from './media';
import * as manifest from '../../package.json';

export class Dialog {

    private parent: BrowserWindow;
    constructor(parent: BrowserWindow) {
        this.parent = parent;
    }

    public async showOpenFileDialog(): Promise<string> {
        return dialog.showOpenDialog(this.parent, {
            title: 'Open Media File',
            buttonLabel: 'Open',
            filters: [{
                name: 'Media Files',
                extensions: Media.AllowedExtensions,
            }]
        }).then(result => {
            if (result.canceled || result.filePaths.length != 1) {
                return null;
            }

            const path = result.filePaths[0];
            console.log('Open file', { path: path });
            return path;
        });
    }

    public async showSelectFolderDialog(): Promise<string[]> {
        const result = await dialog.showOpenDialog(this.parent, {
            title: 'Open Folder',
            buttonLabel: 'Open',
            properties: ['openDirectory', 'createDirectory']
        });

        if (result.canceled || result.filePaths.length != 1) {
            return null;
        }

        const files = await Media.Find(result.filePaths[0]);
        if (!files || files.length === 0) {
            await dialog.showMessageBox(this.parent, {
                type: 'warning',
                title: 'No Media Files Found',
                message: 'The selected folder does not contain any files supported by Simple Media Player'
            });
            return null;
        }

        return files;
    }

    public async showCopyMediaDialog(): Promise<string> {
        const result = await dialog.showOpenDialog(this.parent, {
            title: 'Copy Flagged Media To',
            buttonLabel: 'Copy',
            properties: ['openDirectory', 'createDirectory']
        });

        if (result.canceled || result.filePaths.length != 1) {
            return null;
        }

        return result.filePaths[0];
    }

    public async showDeleteConfirmDialog(): Promise<boolean> {
        return dialog.showMessageBox(this.parent, {
            type: 'question',
            title: 'Delete File?',
            message: 'Are you sure you want to delete this media file?',
            buttons: [
                'Delete',
                'Cancel'
            ],
            noLink: true,
            defaultId: 0,
            cancelId: 1
        }).then(result => {
            return result.response == 0;
        });
    }

    /**
     * Show an error dialog
     * @param title The title of the dialog
     * @param body The body of the error message
     * @param details Additional details for the error message
     */
    public async showErrorDialog(title: string, body: string, details: string): Promise<Electron.MessageBoxReturnValue> {
        return dialog.showMessageBox(this.parent, {
            type: 'error',
            title: title,
            message: body,
            detail: details,
        });
    }

    /**
     * Show a dialog for fatal errors.
     */
    public showFatalErrorDialog = async (): Promise<void> => {
        const result = await dialog.showMessageBox(this.parent, {
            type: 'error',
            buttons: [
                'Report Error & Restart',
                'Restart Simple Media Player'
            ],
            noLink: true,
            defaultId: 0,
            cancelId: 1,
            title: 'Fatal Error',
            message: 'A non-recoverable error occurred and Simple Media Player must restart. Any unsaved work will be lost. '
        });

        if (result.response == 0) {
            shell.openExternal('https://github.com/ecnepsnai/smp/issues');
        }

        return;
    };

    public async showAboutModal(): Promise<void> {
        const app = manifest.version;
        const electron = manifest.dependencies.electron;
        const nodejs = process.version.substring(1);

        const result = await dialog.showMessageBox(this.parent, {
            type: 'info',
            title: 'About',
            message: 'Simple Media Player',
            detail: 'Copyright Ian Spence 2017\nSource released under the MIT license.\n\nApp: ' + app + '\n' + 'Electron: ' + electron + '\n' + 'NodeJS: ' + nodejs,
            noLink: true,
            buttons: [
                'Dismiss',
                'SMP on GitHub',
                'Ian Spence on Twitter'
            ]
        });
        if (result.response === 1) {
            App.openURL('https://github.com/ecnepsnai/smp');
        } else if (result.response === 2) {
            App.openURL('https://twitter.com/ecnepsnai');
        }
    }
}