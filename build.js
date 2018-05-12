const exec = require('child_process').execSync;

function cleanup() {
    return new Promise(function(resolve) {
        exec('rm -rf build/');
        exec('rm -f osx.zip windows.zip');
        exec('rm -rf node_modules/');
        exec('npm install');
        resolve();
    });
}

function packageApp() {
    let packager = require('electron-packager');
    return packager({
        dir: '.',
        appCopyright: 'Copyright © Ian Spence 2018',
        arch: 'x64',
        icon: 'images/icon',
        name: 'Media Player',
        out: 'build',
        overwrite: false,
        platform: 'win32,darwin',
        appBundleId: 'io.ecn.media-player',
        appCategoryType: 'public.app-category.entertainment',
        osxSign: false,
        asar: true,
    });
}

cleanup().then(function() {
    packageApp().then(function() {
        exec('mkdir -p build/artifacts');
        exec('zip -r osx.zip "build/Media Player-darwin-x64"');
        exec('mv osx.zip build/artifacts/');
        exec('zip -r windows.zip "build/Media Player-win32-x64"');
        exec('mv windows.zip build/artifacts/');
    });
});
