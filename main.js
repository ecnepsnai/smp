const {app, BrowserWindow, Menu} = require('electron');

const path = require('path');
const url = require('url');

let windows = [];

function createWindow () {
    let window = new BrowserWindow({
        titleBarStyle: 'hiddenInset',
        icon: __dirname + 'images/icon.png',
        width: 500,
        height: 200,
        backgroundColor: '#212121',
        autoHideMenuBar: true,
        resizable: false,
        fullscreenable: false
    });
    windows.push(window);

    window.webContents.toggleDevTools();

    window.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    window.on('closed', function () {
        var index = windows.indexOf(window);
        windows.splice(index, 1);
    });
}

function appReady() {
    const menuTemplate = [
        {
            label: 'Media Player',
            submenu: [
                {
                    label: 'About Media Player',
                    click: () => {
                        let aboutWindow = new BrowserWindow({
                            icon: __dirname + 'images/icon.png',
                            width: 440,
                            height: 170,
                            title: 'About Media Player',

                        });
                        aboutWindow.setMenu(null);
                        aboutWindow.loadURL(url.format({
                            pathname: path.join(__dirname, 'about.html'),
                            protocol: 'file:',
                            slashes: true
                        }));
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'CommandOrControl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Single File',
                    accelerator: 'CommandOrControl+O',
                    click: () => {
                        let focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.webContents.send('open_single_file');
                        }
                    }
                },
                {
                    label: 'Open Directory',
                    accelerator: 'CommandOrControl+Shift+O',
                    click: () => {
                        let focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.webContents.send('open_directory');
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'New Window',
                    accelerator: 'CommandOrControl+N',
                    click: () => {
                        createWindow();
                    }
                },
                {
                    label: 'Close Window',
                    accelerator: 'CommandOrControl+W',
                    click: () => {
                        let focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.close();
                        }
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Playback',
            submenu: [
                {
                    label: 'Shuffle',
                    id: 'toggleShuffle',
                    type: 'checkbox',
                    checked: false,
                    click: () => {
                        let focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.webContents.send('toggleShuffle');
                        }
                    }
                },
                {
                    label: 'Prompt for deletion',
                    id: 'togglePrompt',
                    type: 'checkbox',
                    checked: true,
                    click: () => {
                        let focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.webContents.send('togglePrompt');
                        }
                    }
                },
                {
                    label: 'Permanently delete',
                    id: 'toggleDelete',
                    type: 'checkbox',
                    checked: false,
                    click: () => {
                        let focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.webContents.send('togglePerm');
                        }
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    app.setApplicationMenu(menu);

    createWindow();
}

app.on('ready', appReady);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (windows.length === 0) {
        createWindow();
    }
});
