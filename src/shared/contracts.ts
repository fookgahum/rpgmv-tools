export const SELECT_PROJECT_CHANNEL = 'project:select'
export const LOAD_MAP_VISUAL_CHANNEL = 'project:load-map-visual'
export const PREVIEW_PROJECT_CHANGE_CHANNEL = 'project:preview-change'
export const APPLY_PROJECT_CHANGE_CHANNEL = 'project:apply-change'
export const UNDO_PROJECT_CHANGE_CHANNEL = 'project:undo-change'

export interface EventCommand {
  code: number
  indent: number
  parameters: unknown[]
}

export interface EventPageConditions {
  switchIds: number[]
  variable?: { id: number; minimum: number }
  selfSwitch?: string
  itemId?: number
  actorId?: number
}

export interface MapEventPage {
  id: number
  conditions: EventPageConditions
  trigger: number
  priority: number
  imageName: string
  moveType: number
  commands: EventCommand[]
}

export interface MapEvent {
  id: number
  name: string
  note: string
  x: number
  y: number
  pages: MapEventPage[]
}

export interface ProjectMap {
  id: number
  name: string
  width: number
  height: number
  events: MapEvent[]
}

export interface MapVisualData {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  tilesetId: number
  tilesetName: string
  tileData: number[]
  tilesetFlags: number[]
  tilesetImages: Array<string | null>
  parallaxImage: string | null
  missingImages: string[]
}

export type MapVisualResult =
  | { status: 'loaded'; map: MapVisualData }
  | { status: 'error'; code: 'noProject' | 'invalidMap' | 'unreadableMap'; detail?: string }

export interface CommonEvent {
  id: number
  name: string
  trigger: number
  switchId: number
  commands: EventCommand[]
}

export interface NamedEntry {
  id: number
  name: string
}

export type DatabaseKind = 'item' | 'weapon' | 'armor'

export interface DatabaseEntry extends NamedEntry {
  description: string
  price: number
}

export type ReferenceTarget = DatabaseKind | 'switch' | 'variable' | 'commonEvent'
export type ReferenceAccess = 'read' | 'write' | 'condition' | 'call' | 'use'

export interface ReferenceSource {
  kind: 'mapEvent' | 'commonEvent'
  mapId?: number
  eventId?: number
  pageId?: number
  commonEventId?: number
  commandIndex?: number
}

export interface ProjectReference {
  target: ReferenceTarget
  targetId: number
  access: ReferenceAccess
  source: ReferenceSource
}

export interface ProjectWarning {
  code: 'missingMapFile' | 'invalidMapFile'
  mapId: number
}

export interface ProjectSnapshot {
  rootPath: string
  title: string
  versionId: number
  maps: ProjectMap[]
  commonEvents: CommonEvent[]
  switches: NamedEntry[]
  variables: NamedEntry[]
  database: {
    items: DatabaseEntry[]
    weapons: DatabaseEntry[]
    armors: DatabaseEntry[]
  }
  references: ProjectReference[]
  warnings: ProjectWarning[]
}

export interface CommonEventDraft {
  id?: number
  name: string
  trigger: number
  switchId: number
  commands: EventCommand[]
}

export interface MapEventDraft {
  mapId: number
  id?: number
  name: string
  note: string
  x: number
  y: number
  page: {
    id?: number
    conditions: EventPageConditions
    trigger: number
    priority: number
    imageName: string
    moveType: number
    commands: EventCommand[]
  }
}

export type ProjectChangeOperation =
  | {
      kind: 'renameNamedEntry'
      target: 'switch' | 'variable'
      id: number
      name: string
    }
  | { kind: 'saveCommonEvent'; event: CommonEventDraft }
  | { kind: 'saveMapEvent'; event: MapEventDraft }

export type ProjectMutationErrorCode =
  'noProject' | 'invalidChange' | 'projectChanged' | 'writeFailed'

export interface ChangePreview {
  id: string
  fileName: string
  summary: string
  before: string
  after: string
}

export type PreviewChangeResult =
  | { status: 'ready'; preview: ChangePreview }
  | { status: 'error'; code: ProjectMutationErrorCode; detail?: string }

export type ApplyChangeResult =
  | { status: 'applied'; project: ProjectSnapshot; backupPath: string }
  | { status: 'error'; code: ProjectMutationErrorCode; detail?: string }

export type UndoChangeResult =
  | { status: 'undone'; project: ProjectSnapshot }
  | { status: 'empty' }
  | { status: 'error'; code: ProjectMutationErrorCode; detail?: string }

export type ProjectSelectionResult =
  | { status: 'loaded'; project: ProjectSnapshot }
  | { status: 'cancelled' }
  | {
      status: 'error'
      code: 'invalidProjectFile' | 'missingProjectData' | 'invalidJson' | 'unreadableProject'
      detail?: string
    }

export interface RpgmvApi {
  selectProject: () => Promise<ProjectSelectionResult>
  loadMapVisual: (mapId: number) => Promise<MapVisualResult>
  previewProjectChange: (operation: ProjectChangeOperation) => Promise<PreviewChangeResult>
  applyProjectChange: (previewId: string) => Promise<ApplyChangeResult>
  undoProjectChange: () => Promise<UndoChangeResult>
}
