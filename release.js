const exec = require('child_process').execSync;

exec('rm -rf build/');
exec('mkdir -p build/artifacts');
exec('rm -rf static/');
exec('rm -rf node_modules/');
exec('rm -rf copy/');
exec('./install.sh');
exec('npm install');
exec('gulp');
exec('gulp release');

const windowsInstaller = require('electron-winstaller');
const macInstaller = require('electron-installer-dmg');
const redhatInstaller = require('electron-installer-redhat');
const debianInstaller = require('electron-installer-debian');
const package = require('./package.json');

function packageApp(platform) {
    console.info('Packaging application for ' + platform);
    let packager = require('electron-packager');
    return packager({
        dir: '.',
        appCopyright: 'Copyright © Ian Spence 2017-2019',
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
        darwinDarkModeSupport: true,
        executableName: 'media-player'
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
            iconUrl: 'https://raw.githubusercontent.com/ecnepsnai/Media-Player/master/img/icon.ico',
            setupIcon: 'img/icon.ico',
            exe: 'media-player.exe',
            setupExe: 'Media-Player-' + package.version + '.exe',
        }).then(() => {
            exec('rm build/artifacts/media-player-' + package.version + '-full.nupkg');
            exec('rm build/artifacts/RELEASES');
        });
    });
}

function buildLinux() {
    var packagePromise = packageApp('linux');
    return packagePromise.then(() => {
        var redhatPromise = new Promise((resolve, reject) => {
            redhatInstaller({
                src: 'build/Media Player-linux-x64/',
                name: 'Media Player',
                dest: 'build/artifacts',
                icon: 'img/icon.png',
                categories: [
                    'Video',
                ],
                arch: 'x86_64'
            }, ((err) => {
                if (err !== null) {
                    console.error('Error packaging app for redhat: ', err);
                    reject(err);
                    return;
                }
                try {
                    exec('mv "build/artifacts/Media-Player-' + package.version + '.x86_64.rpm" "build/artifacts/Media-Player-' + package.version + '.rpm"');
                } catch (e) {
                    reject(e);
                    return;
                }
                resolve();
            }));
        });
        var debianPromise = new Promise((resolve, reject) => {
            debianInstaller({
                src: 'build/Media Player-linux-x64/',
                name: 'Media Player',
                dest: 'build/artifacts',
                icon: 'img/icon.png',
                categories: [
                    'Video',
                ],
                arch: 'x86_64'
            }).then(() => {
                try {
                    exec('mv "build/artifacts/media-player_' + package.version + '_x86_64.deb" "build/artifacts/Media-Player-' + package.version + '.deb"');
                } catch (e) {
                    reject(e);
                    return;
                }
                resolve();
            }, (err) => {
                console.error('Error packaging app for debian: ', err);
                reject(err);
                return;
            });
        });
        return Promise.all([redhatPromise, debianPromise]);
    });
}

async function run() {
    await buildDarwin();
    await buildWindows();
    await buildLinux();
}
run();

