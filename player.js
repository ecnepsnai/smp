/* jslint esversion: 6 */
const {dialog, globalShortcut} = require('electron').remote;
const ipc = require('electron').ipcRenderer;

$(function() {
    $('#welcome').show();
    var os = require('os');
    if (os.type() === 'Darwin') {
        $('#welcome').css({
            'padding-top': '1em'
        });
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft' || event.key === 'j') {
        changeMedia(true);
    } else if (event.key === 'ArrowRight' || event.key === 'k') {
        changeMedia(false);
    } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'x') {
        deleteMedia();
    }
});

var files;
var currentFileIdx;
const $browser = $('#browser');
const $title = $('#title');
const fs = require('fs');
const trash = require('trash');
const SUPPORTED_MEDIA_TYPES = [
    '.webm',
    '.webp',
    '.mp4',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp'
];

$browser.on('mouseenter', function() {
    $title.show();
});
$browser.on('mouseleave', function() {
    $title.hide();
});
ipc.on('open_single_file', (event, message) => {
    browseForSingleFile();
});
ipc.on('open_directory', (event, message) => {
    browseForDirectory();
});


function errorDialog(title, message) {
    dialog.showMessageBox({
        type: 'error',
        buttons: ['Dismiss'],
        defaultId: 0,
        title: title,
        message: message
    });
}

function buildFileArray(path, shuffle) {
    try {
        var fileList = [];
        fs.readdirSync(path).forEach(function(file, index) {
            if (isMediaFile(file)) {
                fileList.push(path + '/' + file);
            }
        });
        return shuffle ? fileList.shuffle() : fileList;
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
    $title.html(media + '<br>' + (currentFileIdx + 1) + '/' + files.length);
    if (media.toLowerCase().endsWith('.webm') || media.toLowerCase().endsWith('.mp4')) {
        var $video = $('<video loop class="media" controls loop></video>');
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
        if (currentFileIdx >= files.length - 1) {
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

    var doDelete = function() {
        try {
            var file = files[currentFileIdx];
            if ($('perm_delete').is(':checked')) {
                fs.unlinkSync(file);
            } else {
                trash([file]);
            }
            files.splice(currentFileIdx, 1);
            if (files.length === 0) {
                $('#welcome').show();
                $browser.empty();
                $browser.hide();
            } else {
                changeMedia();
            }
        } catch(e) {
            errorDialog('Error', 'Error while deleting media file: ' + e);
        }
    };

    if ($('delete_prompt').is(':checked')) {
        dialog.showMessageBox({
            type: 'warning',
            buttons: ['Yes', 'No'],
            defaultId: 0,
            title: 'Delete File',
            message: 'Are you sure you wish to delete this file?'
        }, function(cancel) {
            if (!cancel) {
                doDelete();
            }
        });
    } else {
        doDelete();
    }
}

function browseForDirectory() {
    var pathArr = dialog.showOpenDialog({
        title: 'Open Media Directory',
        message: 'Select directory containing media files',
        properties: ['openDirectory']
    });
    if (pathArr && pathArr.length === 1) {
        var path = pathArr[0];
        files = buildFileArray(path, $('#shuffle').is(':checked'));
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
        properties: ['openFile'],
        filters: [
            {
                name: 'Supported media types',
                extensions: SUPPORTED_MEDIA_TYPES.map(function(ext) {
                    return ext.substring(1);
                })
            }
        ]
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

Array.prototype.shuffle = function() {
    let counter = this.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }

    return this;
};

$('#open_dir_button').on('click', browseForDirectory);
$('#open_file_button').on('click', browseForSingleFile);
