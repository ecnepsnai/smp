export class Path {
    public static join(...parts: string[]): string {
        let sep = '/';
        const isWindows = navigator.platform.toLowerCase().includes('win32');
        if (isWindows) {
            sep = '\\';
        }
        return parts.join(sep);
    }

    public static split(path: string): string[] {
        let sep = '/';
        const isWindows = navigator.platform.toLowerCase().includes('win32');
        if (isWindows) {
            sep = '\\';
        }
        return path.split(sep);
    }

    public static fileName(path: string): string {
        const parts = this.split(path);
        return parts[parts.length-1];
    }
}