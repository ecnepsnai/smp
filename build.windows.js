const windowsInstaller = require('electron-winstaller');
const packager = require('./build.package.js');
const info = require('./package.json');

(async function main() {
    await packager.app('win32', 'x64');
    await windowsInstaller.createWindowsInstaller({
        appDirectory: 'package\\Simple Media Player-win32-x64',
        outputDirectory: 'package\\artifacts',
        title: 'Simple Media Player',
        iconUrl: 'https://raw.githubusercontent.com/ecnepsnai/smp/develop/icons/SMP.ico',
        setupIcon: 'icons\\SMP.ico',
        exe: 'smp.exe',
        setupExe: 'SMP_windows_' + info.version + '_x64.exe',
        noMsi: true
    });
})();
