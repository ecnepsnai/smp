import path = require('path');
import os = require('os');
import fs = require('fs');

export class Paths {
    /**
     * The absolute path to the index HTML file used for browser windows
     */
    public readonly indexHTML: string;
    /**
     * The absolute path to the preload JavaScript file used for browser windows
     */
    public readonly preloadJS: string;
    /**
     * The absolute path to an icon used for browser windows.
     * On Windows this will be an .ico file, otherwise it will be a .png.
     */
    public readonly icon: string;

    public static default(): Paths {
        const indexHTML = path.join(__dirname, 'index.html');
        const preloadJS = path.join(__dirname, 'preload.js');
        let icon = path.join(__dirname, 'icons', 'SMP.png');

        if (os.platform() === 'win32') {
            icon = path.join(__dirname, 'icons', 'SMP.ico');
        }

        if (!fs.existsSync(indexHTML)) {
            console.error('[FATAL] Path for index HTML does not exist', indexHTML);
            throw new Error('Index HTML does not exist');
        }
        if (!fs.existsSync(preloadJS)) {
            console.error('[FATAL] Path for preload JS does not exist', preloadJS);
            throw new Error('Preload JS does not exist');
        }

        return new Paths(indexHTML, preloadJS, icon);
    }

    private constructor(indexHTML: string, preloadJS: string, icon: string) {
        this.indexHTML = indexHTML;
        this.preloadJS = preloadJS;
        this.icon = icon;
    }
}
