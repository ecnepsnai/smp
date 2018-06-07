const {app, shell} = require('electron').remote;
const appVersion = app.getVersion();
$('#version').text('v' + appVersion);
$('#github').click(function() {
    shell.openExternal('https://github.com/ecnepsnai/Media-Player');
});