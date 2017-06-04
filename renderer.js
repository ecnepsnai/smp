/* jslint esversion: 6 */
const {app, dialog, globalShortcut} = require('electron').remote;

var appVersion = app.getVersion();
$('#version').text('v' + appVersion);

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft' || event.key === 'j') {
        changeMedia(true);
    } else if (event.key === 'ArrowRight' || event.key === 'k') {
        changeMedia(false);
    } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'x') {
        deleteMedia();
    } else if (event.key === 'o' && (event.ctrlKey || event.metaKey)) {
        browseForDirectory();
    }
});

var files;
var currentFileIdx;
var $browser = $('#browser');
var fs = require('fs');
const SUPPORTED_MEDIA_TYPES = [
    '.webm',
    '.webp',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp'
];

function errorDialog(title, message) {
    dialog.showMessageBox({
        type: 'error',
        buttons: ['Dismiss'],
        defaultId: 0,
        title: title,
        message: message
    });
}

function buildFileArray(path) {
    try {
        var fileList = [];
        fs.readdirSync(path).forEach(function(file, index) {
            if (isMediaFile(file)) {
                fileList.push(path + '/' + file);
            }
        });
        return fileList;
    } catch(e) {
        errorDialog('Error', 'Error occurred while locating media files: ' + e);
    }
}

function isMediaFile(file) {
    for (var i = 0, count = SUPPORTED_MEDIA_TYPES.length; i < count; i++) {
        if (file.toLowerCase().endsWith(SUPPORTED_MEDIA_TYPES[i])) {
            return true;
        }
    }
    return false;
}

function showMedia() {
    var media = files[currentFileIdx];
    if (media.toLowerCase().endsWith('.webm')) {
        var $video = $('<video loop controls class="media"></video>');
        $video.attr('src', files[currentFileIdx]);
        $browser.empty();
        $browser.append($video);
        $video[0].play();
    } else {
        var $img = $('<img class="media">');
        $img.attr('src', files[currentFileIdx]);
        $browser.empty();
        $browser.append($img);
    }
    sizeMedia();
}

function sizeMedia() {
    var $media = $('.media');
    $media.css({
        'max-height': window.innerHeight,
        'max-width': window.innerWidth
    });
}
window.onresize = sizeMedia;

function changeMedia(back) {
    if (!files) {
        return;
    }

    if (!back) {
        if (currentFileIdx === files.length - 1) {
            currentFileIdx = 0;
        } else {
            currentFileIdx++;
        }
    } else {
        if (currentFileIdx === 0) {
            currentFileIdx = files.length - 1;
        } else {
            currentFileIdx--;
        }
    }
    showMedia();
}

function deleteMedia() {
    if (!files) {
        return;
    }

    dialog.showMessageBox({
        type: 'warning',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        title: 'Delete File',
        message: 'Are you sure you wish to delete this file?'
    }, function(cancel) {
        if (!cancel) {
            try {
                fs.unlinkSync(files[currentFileIdx]);
                files.splice(currentFileIdx, 1);
                if (files.length === 0) {
                    $('#welcome').show();
                    $browser.empty();
                    $browser.hide();
                } else {
                    showMedia();
                }
            } catch(e) {
                errorDialog('Error', 'Error while deleting media file: ' + e);
            }
        }
    });
}

function browseForDirectory() {
    var pathArr = dialog.showOpenDialog({
        title: 'Open Media Directory',
        message: 'Select directory containing media files',
        properties: ['openDirectory']
    });
    if (pathArr && pathArr.length === 1) {
        var path = pathArr[0];
        files = buildFileArray(path);
        if (files.length > 0) {
            currentFileIdx = 0;
            $('#welcome').hide();
            $browser.show();
            showMedia();
        } else {
            errorDialog('No supported files', 'No compatible media files were located. Supported files are: ' + SUPPORTED_MEDIA_TYPES.join(', '));
        }
    }
}

function browseForSingleFile() {
    var pathArr = dialog.showOpenDialog({
        title: 'Open Media File',
        message: 'Select the media file to play',
        properties: ['openFile']
    });
    if (pathArr && pathArr.length === 1) {
        var path = pathArr[0];
        if (isMediaFile(path)) {
            files = [path];
            currentFileIdx = 0;
            $('#welcome').hide();
            $browser.show();
            showMedia();
        } else {
            errorDialog('No supported files', 'No compatible media files were located. Supported files are: ' + SUPPORTED_MEDIA_TYPES.join(', '));
        }
    }
}

$('#open_dir_button').on('click', browseForDirectory);
$('#open_file_button').on('click', browseForSingleFile);
