import { join } from 'node:path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import {
  APPLY_PROJECT_CHANGE_CHANNEL,
  PREVIEW_PROJECT_CHANGE_CHANNEL,
  SELECT_PROJECT_CHANNEL,
  UNDO_PROJECT_CHANGE_CHANNEL,
  type ProjectChangeOperation,
  type ProjectSelectionResult
} from '../shared/contracts'
import { ProjectReadError } from './project-reader'
import { ProjectSession } from './project-session'

const projectSession = new ProjectSession()

async function selectProject(): Promise<ProjectSelectionResult> {
  const result = await dialog.showOpenDialog({
    title: '选择 RPG Maker MV 工程 / Select RPG Maker MV Project',
    buttonLabel: '打开工程 / Open Project',
    properties: ['openFile'],
    filters: [{ name: 'RPG Maker MV Project', extensions: ['rpgproject'] }]
  })

  if (result.canceled || !result.filePaths[0]) return { status: 'cancelled' }

  try {
    return { status: 'loaded', project: await projectSession.open(result.filePaths[0]) }
  } catch (error) {
    if (error instanceof ProjectReadError) {
      return { status: 'error', code: error.code, detail: error.message }
    }

    return {
      status: 'error',
      code: 'unreadableProject',
      detail: error instanceof Error ? error.message : undefined
    }
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.rpgmvtools.copilot')
  ipcMain.handle(SELECT_PROJECT_CHANNEL, selectProject)
  ipcMain.handle(PREVIEW_PROJECT_CHANGE_CHANNEL, (_event, operation: ProjectChangeOperation) =>
    projectSession.preview(operation)
  )
  ipcMain.handle(APPLY_PROJECT_CHANGE_CHANNEL, (_event, previewId: string) =>
    projectSession.apply(previewId)
  )
  ipcMain.handle(UNDO_PROJECT_CHANGE_CHANNEL, () => projectSession.undo())
  createWindow()
})

app.on('window-all-closed', () => app.quit())
