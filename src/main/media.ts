import { BrowserWindow } from 'electron';
import { App } from './app';
import { Dialog } from './dialog';
import fs = require('fs');
import path = require('path');

export class Media {
    public static AllowedExtensions = ['webm', 'webp', 'mp4', 'jpg', 'jpeg', 'png', 'gif', 'bmp'];

    public static Find = (dir: string): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const paths: string[] = [];
            fs.readdir(dir, {}, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }

                files.forEach((file) => {
                    for (let i = 0; i < this.AllowedExtensions.length; i++) {
                        if ((file as string).toLowerCase().endsWith(this.AllowedExtensions[i])) {
                            paths.push(path.join(dir, file as string));
                            break;
                        }
                    }
                });
                console.log('Open files', { paths: paths });
                resolve(paths);
            });
        });
    };

    public static Delete = async (path: string, window: BrowserWindow): Promise<boolean> => {
        const dialog = new Dialog(window);
        if (App.promptBeforeDeletingChecked) {
            const confirmed = await dialog.showDeleteConfirmDialog();
            if (!confirmed) {
                return true;
            }
        }

        try {
            await this.unlink(path);
            console.log('Deleted media file', { path: path });
            return true;
        } catch (err) {
            console.error('Error deleting file', { path: path, error: err });
            return false;
        }
    };

    private static unlink = (path: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
}