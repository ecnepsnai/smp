const {app, shell} = require('electron').remote;
const appVersion = app.getVersion();
const os = require('os');
$('#version').text('v' + appVersion);
$('#github').click(function() {
    shell.openExternal('https://github.com/ecnepsnai/Media-Player');
});
$('#close').on('click', function() {
    require('electron').remote.getCurrentWindow().close();
});

if (os.type() === 'Darwin') {
    $('#close').show();
}
