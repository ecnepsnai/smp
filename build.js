const exec = require('child_process').execSync;

exec('rm -rf build/');
exec('mkdir -p build/artifacts');
exec('rm -rf static/');
exec('rm -rf node_modules/');
exec('npm install');
exec('gulp');

const windowsInstaller = require('electron-winstaller');
const macInstaller = require('electron-installer-dmg');
const package = require('./package.json');

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
    return packageApp('darwin').then(() => {
        return new Promise((resolve) => {
            macInstaller({
                appPath: 'build/Media Player-darwin-x64/Media Player.app',
                name: 'Media Player',
                out: 'build/artifacts',
                icon: 'img/icon.icns'
            }, (() => {
                exec('mv "build/artifacts/Media Player.dmg" "build/artifacts/Media-Player-' + package.version + '.dmg"');
                resolve();
            }));
        });
    });
}

function buildWindows() {
    return packageApp('win32').then(() => {
        return windowsInstaller.createWindowsInstaller({
            appDirectory: 'build/Media Player-win32-x64',
            outputDirectory: 'build/artifacts',
            title: 'Media Player',
            setupIcon: 'img/icon.ico',
            exe: 'Media Player.exe',
            setupExe: 'Media-Player-' + package.version + '.exe',
        });
    });
}

buildDarwin().then(() => {
    buildWindows().then(() => {
        console.log('Finished!');
    });
});
