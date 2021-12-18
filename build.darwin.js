const packager = require('./build.package.js');
const createDMG = require('electron-installer-dmg');

async function build(arch) {
    await packager.app('darwin', arch);
    await createDMG({
        appPath: 'package/Simple Media Player-darwin-' + arch + '/Simple Media Player.app',
        name: 'Simple Media Player',
        title: 'Simple Media Player',
        icon: 'icons/SMP.icns',
        format: 'ULFO',
        out: 'package/artifacts'
    });
    await packager.exec('mv', ['package/artifacts/Simple Media Player.dmg', 'package/artifacts/SMP_macOS_' + arch + '.dmg']);
}

(async function main() {
    try {
        await packager.exec('mkdir', ['-p', 'package/artifacts']);
        await build('x64');
        await build('arm64');
    } catch (err) {
        console.error(err);
    }
})();
