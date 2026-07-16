import { contextBridge, ipcRenderer } from 'electron'
import { SELECT_PROJECT_CHANNEL, type RpgmvApi } from '../shared/contracts'

const api: RpgmvApi = {
  selectProject: () => ipcRenderer.invoke(SELECT_PROJECT_CHANNEL)
}

contextBridge.exposeInMainWorld('rpgmv', api)
