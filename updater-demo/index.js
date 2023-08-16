const { app, BrowserWindow, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')

function checkUpdate() {
  if (process.platform === 'darwin') {
    // macOS
  } else {
    // Windows
    autoUpdater.setFeedURL('http://localhost:3000/win')
  }

  autoUpdater.checkForUpdates()
    .then((res) => {
      console.log('checkForUpdates', res)
    })
    .catch((err) => {
      console.log('checkForUpdates', err)
    })


  autoUpdater.on('update-available', () => {
    console.log('found new version')
  })

  autoUpdater.on('error', (err) => {
    console.log('error', err)
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update',
      message: 'New version is available, do you want to update now?',
      buttons: ['Yes', 'No']
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall()
        app.quit()
      }
    })
  })
}

app.whenReady().then(() => {
  const win = new BrowserWindow()

  win.loadFile('./src/index.html')

  // open devtools
  // win.webContents.openDevTools()

  // check update
  checkUpdate()
})

