const {app, dialog, systemPreferences} = require('electron').remote;
const playerWindow = require('electron').remote.getCurrentWindow();
const ipc = require('electron').ipcRenderer;

let playbackOptions = {
    shuffle: false,
    promptDelete: true,
    permDelete: false
};

var videoControls;
var video;
var mediaElement;

$(function() {
    syncApplicationMenu();
    toggleView(false);
    $('#welcome').show();
    var os = require('os');
    if (os.type() === 'Darwin') {
        $('#welcome').css({
            'padding-top': '1em'
        });
    }

    setupVideoControls();
});

/**
 * Setup the video player controls. Only call this once.
 */
function setupVideoControls() {
    videoControls = document.getElementById('video-controls');
    var playpause = document.getElementById('playpause');
    var mute = document.getElementById('mute');
    var progress = document.getElementById('progress');
    var fs = document.getElementById('fs');

    playpause.addEventListener('click', playPauseVideo);
    mute.addEventListener('click', function() {
        video.muted = !video.muted;
    });
    progress.addEventListener('click', function(e) {
        var pos = (e.pageX  - (this.offsetLeft + this.offsetParent.offsetLeft)) / this.offsetWidth;
        video.currentTime = pos * video.duration;
    });
    fs.addEventListener('click', function() {
        video.webkitRequestFullscreen();
    });
}

/**
 * Toggle playback of the video
 */
function playPauseVideo() {
    // Unblue the playpause button to prevent the space bar hotkey from interfering with it
    document.getElementById('playpause').blur();
    if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
}

/**
 * Toggle the play pause icon on the button
 */
function togglePlaypauseIcon() {
    if (video.paused) {
        $('#playpauseicon').attr('class', 'fas fa-play');
    } else {
        $('#playpauseicon').attr('class', 'fas fa-pause');
    }
}

/**
 * Toggle the mute icon on the button
 */
function toggleMuteIcon() {
    if (video.muted) {
        $('#muteicon').attr('class', 'fas fa-volume-mute');
    } else {
        $('#muteicon').attr('class', 'fas fa-volume-up');
    }
}

/**
 * Update the video progress bar
 */
function updateVideoProgress() {
    var progress = document.getElementById('progress');
    var value = 0;
    if (video.currentTime > 0) {
        value = video.currentTime / video.duration;
    }
    progress.value = value;
}

// On macOS capture the theme change notification to reload the app theme
systemPreferences.subscribeNotification( 'AppleInterfaceThemeChangedNotification', function() {
    updateDarkMode(systemPreferences.isDarkMode());
});
updateDarkMode(systemPreferences.isDarkMode());
function updateDarkMode(isDark) {
    $('body').toggleClass('light', !isDark);
    $('body').toggleClass('dark', isDark);
}

/**
 * Shuffle checkbox control
 */
$('#shuffle').change(toggleShuffle);
function toggleShuffle() {
    playbackOptions.shuffle = !playbackOptions.shuffle;
    $('#shuffle').prop('checked', playbackOptions.shuffle);
    syncApplicationMenu();
}

/**
 * Prompt for deletion checkbox control
 */
$('#delete_prompt').change(togglePrompt);
function togglePrompt() {
    playbackOptions.promptDelete = !playbackOptions.promptDelete;
    $('#delete_prompt').prop('checked', playbackOptions.promptDelete);
    syncApplicationMenu();
}

/**
 * Permenatly delete checkbox control
 */
$('#perm_delete').change(togglePerm);
function togglePerm() {
    playbackOptions.permDelete = !playbackOptions.permDelete;
    $('#perm_delete').prop('checked', playbackOptions.permDelete);
    syncApplicationMenu();
}

/**
 * Sync the player window with the application menu
 */
function syncApplicationMenu() {
    let menu = app.getApplicationMenu();

    let shuffleMenu = menu.getMenuItemById('toggleShuffle');
    let promptMenu = menu.getMenuItemById('togglePrompt');
    let permMenu = menu.getMenuItemById('toggleDelete');

    shuffleMenu.checked = playbackOptions.shuffle;
    promptMenu.checked = playbackOptions.promptDelete;
    permMenu.checked = playbackOptions.permDelete;

    playerWindow.setMenu(menu);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft' || event.key === 'j') {
        // Next in folder
        changeMedia(true);
    } else if (event.key === 'ArrowRight' || event.key === 'k') {
        // Previous in folder
        changeMedia(false);
    } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'x') {
        // Delete
        deleteMedia();
    } else if (event.key === ' ') {
        // Play/Pause for videos
        if (video !== undefined) {
            playPauseVideo();
        }
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

// Menu Handlers
ipc.on('open_single_file', function() {
    browseForSingleFile();
});
ipc.on('open_directory', function() {
    browseForDirectory();
});
ipc.on('toggleShuffle', toggleShuffle);
ipc.on('togglePrompt', togglePrompt);
ipc.on('togglePerm', togglePerm);
ipc.on('sync_menu', syncApplicationMenu);


function errorDialog(title, message) {
    dialog.showMessageBox({
        type: 'error',
        buttons: ['Dismiss'],
        defaultId: 0,
        title: title,
        message: message,
        browserWindow: playerWindow,
    });
}

const stripChars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

// Used to prevent XSS in filenames
function stripHTML(unsafe) {
    return String(unsafe).replace(/[&<>"'`=\/]/g, function (s) {
          return stripChars[s];
    });
}

function buildFileArray(path) {
    try {
        var fileList = [];
        fs.readdirSync(path).forEach(function(file) {
            if (isMediaFile(file)) {
                fileList.push(path + '/' + file);
            }
        });
        return playbackOptions.shuffle ? fileList.shuffle() : fileList;
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
    if (mediaElement !== undefined) {
        mediaElement.remove();
    }
    var media = files[currentFileIdx];
    $title.html(stripHTML(media) + '<br>' + (currentFileIdx + 1) + '/' + files.length);
    if (media.toLowerCase().endsWith('.webm') || media.toLowerCase().endsWith('.mp4')) {
        var $video = $('<video loop class="media" loop></video>');
        $video.attr('src', files[currentFileIdx]);
        $browser.append($video);
        $video[0].play();
        video = $video[0];
        mediaElement = $video[0];
        videoControls.removeAttribute('style');
        video.addEventListener('timeupdate', updateVideoProgress, false);
        video.addEventListener('pause', togglePlaypauseIcon, false);
        video.addEventListener('play', togglePlaypauseIcon, false);
        video.addEventListener('volumechange', toggleMuteIcon, false);
        // Not updated automatically on change
        togglePlaypauseIcon();
    } else {
        video = undefined;
        var $img = $('<img class="media">');
        $img.attr('src', files[currentFileIdx]);
        $browser.append($img);
        mediaElement = $img[0];
        videoControls.style.display = 'none';
    }
    sizeMedia();
}

function sizeMedia() {
    var $media = $('.media');
    $media.css({
        'max-height': window.innerHeight - 26,
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

    var file = files[currentFileIdx];

    var doDelete = function() {
        try {
            if (playbackOptions.permDelete) {
                fs.unlinkSync(file);
            } else {
                trash([file]).catch(() => {
                    fs.unlinkSync(file);
                });
            }
            files.splice(currentFileIdx, 1);
            if (files.length === 0) {
                toggleView(false);
            } else {
                if (currentFileIdx === files.length) {
                    currentFileIdx = 0;
                }
                showMedia();
            }
        } catch(e) {
            errorDialog('Error', 'Error while deleting media file: ' + e);
        }
    };

    if (playbackOptions.promptDelete) {
        dialog.showMessageBox(playerWindow, {
            type: 'warning',
            buttons: ['Delete', 'Do Nothing'],
            defaultId: 0,
            cancelId: 1,
            title: 'Delete File',
            message: 'Are you sure you wish to delete this file?\n' + file,
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
    var pathArr = dialog.showOpenDialog(playerWindow, {
        title: 'Open Media Directory',
        message: 'Select directory containing media files',
        properties: ['openDirectory'],
    });
    if (pathArr && pathArr.length === 1) {
        var path = pathArr[0];
        files = buildFileArray(path);
        if (files.length > 0) {
            toggleView(true);
        } else {
            errorDialog('No supported files', 'No compatible media files were located. Supported files are: ' + SUPPORTED_MEDIA_TYPES.join(', '));
        }
    }
}

function browseForSingleFile() {
    var pathArr = dialog.showOpenDialog(playerWindow, {
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
            toggleView(true);
        } else {
            errorDialog('No supported files', 'No compatible media files were located. Supported files are: ' + SUPPORTED_MEDIA_TYPES.join(', '));
        }
    }
}

function toggleView(showPlayer) {
    if (showPlayer) {
        currentFileIdx = 0;
        $('#welcome').hide();
        $browser.show();
        resizeWindow(true);
        showMedia();
    } else {
        $('#welcome').show();
        if (mediaElement !== undefined) {
            mediaElement.remove();
        }
        $browser.hide();
        resizeWindow(false);
    }
}

function resizeWindow(large) {
    let current = playerWindow.getBounds();

    var bounds = {
        x: current.x,
        y: current.y
    };
    if (large) {
        bounds.width = 890;
        bounds.height = 510;
    } else {
        bounds.width = 500;
        bounds.height = 200;
    }

    playerWindow.setBounds(bounds);
    playerWindow.setResizable(large);
    playerWindow.setFullScreenable(large);
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
