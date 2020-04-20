const macInstaller = require('electron-installer-dmg');
const packager = require('./release-package.js');

(async function main() {
    await packager.app('darwin').then(() => {
        macInstaller({
            appPath: 'build/SMP-darwin-x64/SMP.app',
            name: 'SMP',
            out: 'build/artifacts',
            icon: 'img/icon.icns'
        });
    }, function(err) {
        console.error(err);
    }).catch(function(err) {
        console.error(err);
    });
})();
