const exec = require('child_process').execSync;

function cleanup() {
    return new Promise(function(resolve) {
        exec('rm -rf static/');
        exec('rm -f *.zip');
        exec('rm -rf node_modules/');
        exec('npm install');
        exec('gulp');
        resolve();
    });
}

function packageApp(platform) {
    let packager = require('electron-packager');
    return packager({
        dir: '.',
        appCopyright: 'Copyright © Ian Spence 2018',
        arch: 'x64',
        icon: 'static/assets/img/icon',
        name: 'Media Player',
        out: 'build',
        overwrite: false,
        platform: platform,
        appBundleId: 'io.ecn.media-player',
        appCategoryType: 'public.app-category.entertainment',
        osxSign: false,
        asar: true,
    });
}

function buildDarwin() {
    return cleanup().then(() => {
        return packageApp('darwin').then(() => {
            exec('zip -r osx.zip "build/Media Player-darwin-x64"');
            exec('mv osx.zip build/artifacts/');
        });
    });
}

function buildWindows() {
    return cleanup().then(() => {
        return packageApp('win32').then(() => {
            exec('zip -r windows.zip "build/Media Player-win32-x64"');
            exec('mv windows.zip build/artifacts/');
        });
    });
}

exec('rm -rf build/');
exec('mkdir -p build/artifacts');
buildDarwin().then(() => {
    buildWindows().then(() => {
        console.log('Finished!');
    });
});
