interface PreloadBridge {
    getFilesFromArgs: () => Promise<string[]>
    setTitle: (title: string) => void
    openSingleFile: () => Promise<string>
    openDirectory: () => Promise<string[]>
    deleteMedia: (path: string) => Promise<boolean>
    onMediaLoad: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    onMediaShuffle: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    onMediaClose: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    onCopyFlaggedMedia: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    copyFlaggedMedia: (paths: string[]) => Promise<void>
    errorDialog: (title: string, body: string, detail?: string) => Promise<void>
    checkForUpdates: () => Promise<string>
    openInBrowser: (url: string) => void
    fatalError: (error: unknown, errorInfo: unknown) => void
    showFileInfo: (path: string) => Promise<void>
}

interface preloadWindow {
    SMP: PreloadBridge
}

export class IPC {
    private static preload: PreloadBridge = (window as unknown as preloadWindow).SMP as PreloadBridge;

    public static getFilesFromArgs(): Promise<string[]> {
        return IPC.preload.getFilesFromArgs();
    }

    public static setTitle(title: string): void {
        return IPC.preload.setTitle(title);
    }

    public static openSingleFile(): Promise<string> {
        return IPC.preload.openSingleFile();
    }

    public static openDirectory(): Promise<string[]> {
        return IPC.preload.openDirectory();
    }

    public static deleteMedia(path: string): Promise<boolean> {
        return IPC.preload.deleteMedia(path);
    }

    public static onMediaLoad(cb: (media: string[]) => void): void {
        return IPC.preload.onMediaLoad((event, args) => {
            cb(args as string[]);
        });
    }
    
    public static onMediaShuffle(cb: () => void): void {
        return IPC.preload.onMediaShuffle(() => {
            cb();
        });
    }

    public static onMediaClose(cb: () => void): void {
        return IPC.preload.onMediaClose(() => {
            cb();
        });
    }

    public static onCopyFlaggedMedia(cb: () => void): void {
        return IPC.preload.onCopyFlaggedMedia(() => {
            cb();
        });
    }

    public static copyFlaggedMedia(paths: string[]): Promise<void> {
        return IPC.preload.copyFlaggedMedia(paths);
    }

    public static errorDialog(title: string, body: string, detail?: string): Promise<void> {
        return IPC.preload.errorDialog(title, body, detail);
    }

    public static checkForUpdates(): Promise<string> {
        return IPC.preload.checkForUpdates();
    }

    public static openInBrowser(url: string): void {
        return IPC.preload.openInBrowser(url);
    }

    public static fatalError(error: unknown, errorInfo: unknown): void {
        return IPC.preload.fatalError(error, errorInfo);
    }

    public static showFileInfo(path: string): Promise<void> {
        return IPC.preload.showFileInfo(path);
    }
}
