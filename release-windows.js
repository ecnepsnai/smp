const windowsInstaller = require('electron-winstaller');
const package = require('./package.json');
const packager = require('./release-package.js');

(async function main() {
    await packager.app('win32').then(() => {
        return windowsInstaller.createWindowsInstaller({
            appDirectory: 'build/SMP-win32-x64',
            outputDirectory: 'build/artifacts',
            title: 'SMP',
            iconUrl: 'https://raw.githubusercontent.com/ecnepsnai/smp/master/img/icon.ico',
            setupIcon: 'img/icon.ico',
            exe: 'SMP.exe',
            setupExe: 'SMP-' + package.version + '.exe',
        }, function(err) {
            console.error(err);
        }).catch(function(err) {
            console.error(err);
        });
    }, function(err) {
        console.error(err);
    }).catch(function(err) {
        console.error(err);
    });
})();
