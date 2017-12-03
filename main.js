/* jslint esversion: 6 */
const {app, BrowserWindow, Menu} = require('electron');

const path = require('path');
const url = require('url');

let windows = [];

function createWindow () {
    let window = new BrowserWindow({
        titleBarStyle: 'hiddenInset',
        icon: __dirname + 'images/icon.png',
        width: 890,
        height: 510,
        backgroundColor: '#212121'
    });
    windows.push(window);

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
                            height: 160,
                            title: 'About Media Player'
                        });
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
                            console.log('open_single_file');
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
                            console.log('open_directory');
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
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

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
    if (mainWindow === null) {
        createWindow();
    }
});
