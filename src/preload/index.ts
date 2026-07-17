import { contextBridge, ipcRenderer } from 'electron'
import {
  APPLY_PROJECT_CHANGE_CHANNEL,
  LOAD_MAP_VISUAL_CHANNEL,
  PREVIEW_PROJECT_CHANGE_CHANNEL,
  SELECT_PROJECT_CHANNEL,
  UNDO_PROJECT_CHANGE_CHANNEL,
  type RpgmvApi
} from '../shared/contracts'

const api: RpgmvApi = {
  selectProject: () => ipcRenderer.invoke(SELECT_PROJECT_CHANNEL),
  loadMapVisual: (mapId) => ipcRenderer.invoke(LOAD_MAP_VISUAL_CHANNEL, mapId),
  previewProjectChange: (operation) =>
    ipcRenderer.invoke(PREVIEW_PROJECT_CHANGE_CHANNEL, operation),
  applyProjectChange: (previewId) => ipcRenderer.invoke(APPLY_PROJECT_CHANGE_CHANNEL, previewId),
  undoProjectChange: () => ipcRenderer.invoke(UNDO_PROJECT_CHANGE_CHANNEL)
}

contextBridge.exposeInMainWorld('rpgmv', api)
