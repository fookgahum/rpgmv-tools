export const SELECT_PROJECT_CHANNEL = 'project:select'

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
  events: MapEvent[]
}

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
}
