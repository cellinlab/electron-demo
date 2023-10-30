const { app, BrowserWindow, dialog, globalShortcut } = require('electron')
const { autoUpdater } = require('electron-updater')
const request = require('request');
const fs = require('fs');
const path = require('path');
const tar = require('tar');

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

const download = (url, dest) => {
    const file = fs.createWriteStream(dest);
    request(encodeURI(url), {
        auth: {
            user: '',
            password: ''
        }
    })
        .pipe(file)
        .on('close', () => {
            console.log('downloaded success')

            // exec(`tar zxvf "${path.join('app','test.tar.gz')}"`, (err, stdout, stderr) => {
            //     if (err) {
            //         console.error(err)
            //         return
            //     }
            //     console.log('unzip success')
            // })
            tar.extract({
              file: path.join(app.getAppPath(), 'app','test.tar.gz'),
              cwd: path.join(app.getAppPath(), 'upgrade')
            }).then(res => {
              console.log('unzip success')
            })
        });
}

app.whenReady().then(() => {
  const win = new BrowserWindow()

  win.loadFile('./src/index.html')

  // open devtools
  // win.webContents.openDevTools()

  // check update
  checkUpdate()

  globalShortcut.unregister('ctrl+shift+u');
  globalShortcut.register('ctrl+shift+u', () => {
    download('', path.join(app.getAppPath(), 'app','test.tar.gz'))
  });
})

