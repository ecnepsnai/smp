/* jslint esversion: 6 */
const packager = require('electron-packager');
const exec = require('child_process').execSync;

function packageApp() {
    return packager({
        dir: '.',
        appCopyright: '© Ian Spence 2017',
        arch: 'x64',
        icon: 'images/icon',
        name: 'Media Player',
        out: 'build',
        overwrite: false,
        platform: 'win32,darwin',
        appBundleId: 'io.ecn.media-player',
        appCategoryType: 'public.app-category.entertainment',
        osxSign: false
    });
}

packageApp().then(function() {
    exec('zip -r osx.zip "build/Media Player-darwin-x64"');
    exec('zip -r windows.zip "build/Media Player-win32-x64"');
});
