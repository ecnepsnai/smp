import { BrowserWindow, shell } from 'electron';
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
                paths.sort((a: string, b: string) => a.localeCompare(b, 'en', { numeric: true }));
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
            if (App.permanentlyDeleteFile) {
                await this.unlink(path);
            } else {
                await this.trash(path);
            }
            return true;
        } catch (err) {
            console.error('Error deleting file', { path: path, error: err });
            return false;
        }
    };

    private static trash = (path: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            shell.trashItem(path).then(() => {
                resolve();
                console.log('Moved media to trash', { path: path });
            }, err => {
                console.error('Error moving media to trash', { path: path, error: err });
                this.unlink(path).then(() => {
                    resolve();
                }, err => {
                    reject(err);
                });
            });
        });
    };

    private static unlink = (path: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                    console.log('Deleted media file', { path: path });
                }
            });
        });
    };

    public static CopyFlagged = async (paths: string[], window: BrowserWindow): Promise<void> => {
        if (!paths) {
            return;
        }

        const dialog = new Dialog(window);
        const destDir = await dialog.showCopyMediaDialog();
        if (!destDir) {
            return;
        }

        const promises = paths.map(p => {
            return this.clone(p, path.join(destDir, path.basename(p)));
        });
        await Promise.all(promises);

        shell.openPath(destDir);

        return;
    };

    private static clone = (src: string, dst: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dst, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    public static FromArgs = async (): Promise<string[]> => {
        const args = process.argv;
        if (App.isProduction()) {
            args.splice(0, 1);
        } else {
            args.splice(0, 2);
        }
        if (!args) {
            return [];
        }
        console.log(args);

        const results = await Promise.all(args.map(this.processArg));
        const paths: string[] = [];
        results.forEach(a => {
            a.forEach(p => {
                paths.push(p);
            });
        });
        console.log('Found media in args', { paths: paths });
        return paths;
    };

    private static processArg = async (arg: string): Promise<string[]> => {
        return new Promise(resolve => {
            fs.stat(arg, (err, info) => {
                if (err) {
                    resolve([]);
                    return;
                }

                if (info.isDirectory()) {
                    this.Find(arg).then(resolve, () => {
                        resolve([]);
                    });
                } else {
                    for (let i = 0; i < this.AllowedExtensions.length; i++) {
                        if (arg.toLowerCase().endsWith(this.AllowedExtensions[i])) {
                            resolve([arg]);
                            return;
                        }
                    }
                    resolve([]);
                }
            });
        });
    };
}