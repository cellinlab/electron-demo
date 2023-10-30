const { app, BrowserWindow, dialog, globalShortcut } = require('electron')
const { autoUpdater } = require('electron-updater')
const request = require('request');
const fs = require('fs-extra');
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
            password: 'x'
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
            const outputPath = path.join(app.getAppPath(), 'upgrade')
            fs.mkdirSync(outputPath, { recursive: true })
            tar.extract({
              file: path.join(app.getAppPath(), 'app','test.tar.gz'),
              cwd: outputPath
            }).then(res => {
              console.log('unzip success')

              // 拷贝解压文件覆盖原文件
              const sourcePath = path.join(outputPath)
              const targetPath = path.join(app.getAppPath(), 'app')
              fs.copySync(sourcePath, targetPath)

              fs.removeSync(outputPath)
              console.log('copy success')
              dialog.showMessageBox({
                type: 'info',
                title: '已更新，重启生效',
                message: '部分更新需要重启应用，是否重启？',
                buttons: ['Yes', 'No']
              }).then(({ response }) => {
                if (response === 0) {
                  app.relaunch()
                  app.exit()
                }
              })
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
    download('x.tar.gz', path.join(app.getAppPath(), 'app','test.tar.gz'))
  });
})

