function packageApp(platform) {
    console.info('Packaging application for ' + platform);
    let packager = require('electron-packager');
    return packager({
        dir: '.',
        appCopyright: 'Copyright © Ian Spence 2017-2020',
        arch: 'x64',
        icon: 'static/assets/img/icon',
        name: 'SMP',
        out: 'build',
        overwrite: false,
        platform: platform,
        appBundleId: 'io.ecn.SMP',
        appCategoryType: 'public.app-category.entertainment',
        osxSign: false,
        asar: true,
        darwinDarkModeSupport: true,
        executableName: 'SMP'
    });
}

exports.app = packageApp;
