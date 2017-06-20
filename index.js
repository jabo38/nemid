// Dependencies
const nem = require("nem-sdk").default;
const electron = require('electron');
const path = require('path');
const url = require('url');

// Alert System
const {ipcMain, dialog} = require('electron');
ipcMain.on('alert', (event, arg) => {
  dialog.showErrorBox("Error!", arg);  // prints "ping"
})

// Electron Related Constants
const app = electron.app;
const protocol = electron.protocol;
const BrowserWindow = electron.BrowserWindow;

// Global reference of window object to prevent GC from killing it.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 350, height: 450, title: "NEMid"});

  app.setAsDefaultProtocolClient("nemid");
  protocol.registerHttpProtocol("nemid", (req, cb) => {
    mainWindow.webContents.send('sign', req);
  });

  app.on('open-url', function(event, url) {
    mainWindow.webContents.send('sign', url);
  });

  app.makeSingleInstance(function(argv, wd) {
    argv.forEach((arg) => {
      const parsedURL = url.parse(arg);
      if (!parsedURL.protocol || !parsedURL.slashes) return;
      mainWindow.webContents.send('sign', arg);
    });
  });

  // Load the identification page.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './src/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // For Debug
  // mainWindow.webContents.openDevTools()

  // Close the window.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Open the window.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // Different behavior for OSX.
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.