const {app, shell, systemPreferences} = require('electron').remote;
const appVersion = app.getVersion();
const os = require('os');
$('#version').text('v' + appVersion);
$('#github').click(function() {
    shell.openExternal('https://github.com/ecnepsnai/Media-Player');
});

systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', function() {
    updateDarkMode(systemPreferences.isDarkMode());
});
updateDarkMode(systemPreferences.isDarkMode());

function updateDarkMode(isDark) {
    $('body').toggleClass('light', !isDark);
    $('body').toggleClass('dark', isDark);
}

$('#close').on('click', function() {
    require('electron').remote.getCurrentWindow().close();
});

if (os.type() === 'Darwin') {
    $('#close').show();
}
