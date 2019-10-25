'use strict'

import { app, BrowserWindow, Menu, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'
import storage from 'electron-json-storage'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Check for Updates
   */

  autoUpdater.logger = require("electron-log")
  autoUpdater.logger.transports.file.level = "info"

  autoUpdater.checkForUpdatesAndNotify()

  /**
   * Initial window options
   */
  var menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Dymo Label',
          click () { loadLabel() }
        },
        {
          label: 'Import Product Data',
          click () { loadData() }
        },
        {
          label: 'Export Product Data',
          click () { exportData() }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function loadLabel () {
  const result = dialog.showOpenDialog({
    properties: [ 'openFile' ],
    filters: [
      { name: 'Labels', extensions: ['label'] }
    ]
  })
  if (result) {
    storage.set('label.json', { path: result[0] })
    mainWindow.reload()
  }
}

function loadData () {
  const result = dialog.showOpenDialog({
    properties: [ 'openFile' ],
    filters: [
      { name: 'Product Data', extensions: ['json'] }
    ]
  })
  if (result) {
    fs.readFile(result[0], 'utf8', (err, data) => {
      if (err) throw err
      storage.set('data.json', data)
      mainWindow.reload()
    })
  }
}

function exportData () {
  dialog.showSaveDialog({
    filters: [
      { name: 'Product Data', extensions: ['json'] }
    ]
  }, path => {
    if (path) {
      storage.get('data.json', (err, data) => {
        if (err) throw err
        const jsonString = JSON.stringify(data)
        fs.writeFile(path, jsonString)
      })
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
