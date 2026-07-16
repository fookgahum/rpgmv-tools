import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type {
  ApplyChangeResult,
  CommonEventDraft,
  EventCommand,
  MapEventDraft,
  PreviewChangeResult,
  ProjectChangeOperation,
  ProjectMutationErrorCode,
  ProjectSnapshot,
  UndoChangeResult
} from '../shared/contracts'
import { readProject } from './project-reader'

type JsonObject = Record<string, unknown>

interface PendingChange {
  id: string
  filePath: string
  originalText: string
  nextText: string
  fileName: string
  summary: string
  before: string
  after: string
}

interface UndoRecord {
  filePath: string
  beforeText: string
  afterText: string
}

class ProjectMutationError extends Error {
  constructor(
    readonly code: ProjectMutationErrorCode,
    message: string
  ) {
    super(message)
  }
}

function requiredObject(value: unknown, name: string): JsonObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProjectMutationError('invalidChange', `${name} has an invalid structure.`)
  }
  return value as JsonObject
}

function requiredArray(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ProjectMutationError('invalidChange', `${name} has an invalid structure.`)
  }
  return value
}

function parseDocument(text: string): unknown {
  try {
    return JSON.parse(text.replace(/^\uFEFF/, '')) as unknown
  } catch {
    throw new ProjectMutationError('invalidChange', 'The target JSON file is invalid.')
  }
}

function serializeDocument(value: unknown, originalText: string): string {
  const hasBom = originalText.startsWith('\uFEFF')
  const hasFinalNewline = /\r?\n$/.test(originalText)
  const indentation = originalText.includes('\n') ? 2 : undefined
  const newline = originalText.includes('\r\n') ? '\r\n' : '\n'
  const json = JSON.stringify(value, null, indentation).replace(/\n/g, newline)
  return `${hasBom ? '\uFEFF' : ''}${json}${hasFinalNewline ? newline : ''}`
}

function assertInteger(value: number, name: string, minimum: number, maximum: number): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ProjectMutationError('invalidChange', `${name} is outside the supported range.`)
  }
}

function assertText(value: string, name: string, maximum: number): void {
  if (typeof value !== 'string' || value.length > maximum) {
    throw new ProjectMutationError('invalidChange', `${name} is invalid.`)
  }
}

function validateCommands(commands: EventCommand[]): void {
  if (!Array.isArray(commands) || commands.length > 5000) {
    throw new ProjectMutationError('invalidChange', 'The event command list is too large.')
  }

  for (const command of commands) {
    if (command === null || typeof command !== 'object') {
      throw new ProjectMutationError('invalidChange', 'An event command is invalid.')
    }
    assertInteger(command.code, 'Command code', 1, 999)
    assertInteger(command.indent, 'Command indent', 0, 100)
    if (!Array.isArray(command.parameters)) {
      throw new ProjectMutationError('invalidChange', 'Command parameters are invalid.')
    }
  }
}

function commandList(commands: EventCommand[]): EventCommand[] {
  validateCommands(commands)
  return [...commands, { code: 0, indent: 0, parameters: [] }]
}

function nextAvailableId(entries: unknown[]): number {
  for (let id = 1; id < entries.length; id += 1) {
    if (entries[id] === null) return id
  }
  return entries.length === 0 ? 1 : entries.length
}

function setArrayEntry(entries: unknown[], id: number, value: unknown): void {
  while (entries.length <= id) entries.push(null)
  entries[id] = value
}

function buildPage(draft: MapEventDraft['page'], existingValue?: unknown): JsonObject {
  if (!draft || typeof draft !== 'object') {
    throw new ProjectMutationError('invalidChange', 'Event page data is invalid.')
  }
  assertInteger(draft.trigger, 'Trigger', 0, 4)
  assertInteger(draft.priority, 'Priority', 0, 2)
  assertInteger(draft.moveType, 'Movement type', 0, 3)
  assertText(draft.imageName, 'Image name', 200)
  if (!draft.conditions || !Array.isArray(draft.conditions.switchIds)) {
    throw new ProjectMutationError('invalidChange', 'Event page conditions are invalid.')
  }
  if (draft.conditions.switchIds.length > 2) {
    throw new ProjectMutationError('invalidChange', 'An event page supports at most two switches.')
  }

  for (const id of draft.conditions.switchIds) assertInteger(id, 'Switch ID', 1, 9999)
  if (draft.conditions.variable) {
    assertInteger(draft.conditions.variable.id, 'Variable ID', 1, 9999)
    assertInteger(draft.conditions.variable.minimum, 'Variable minimum', -99999999, 99999999)
  }
  if (draft.conditions.itemId !== undefined) {
    assertInteger(draft.conditions.itemId, 'Item ID', 1, 9999)
  }
  if (draft.conditions.actorId !== undefined) {
    assertInteger(draft.conditions.actorId, 'Actor ID', 1, 9999)
  }
  if (
    draft.conditions.selfSwitch !== undefined &&
    !['A', 'B', 'C', 'D'].includes(draft.conditions.selfSwitch)
  ) {
    throw new ProjectMutationError('invalidChange', 'Self switch must be A, B, C, or D.')
  }

  const page =
    existingValue === undefined
      ? {
          conditions: {},
          directionFix: false,
          image: {
            characterIndex: 0,
            characterName: '',
            direction: 2,
            pattern: 1,
            tileId: 0
          },
          list: [],
          moveFrequency: 3,
          moveRoute: {
            list: [{ code: 0, parameters: [] }],
            repeat: true,
            skippable: false,
            wait: false
          },
          moveSpeed: 3,
          moveType: 0,
          priorityType: 1,
          stepAnime: false,
          through: false,
          trigger: 0,
          walkAnime: true
        }
      : requiredObject(existingValue, 'Event page')
  const conditions = requiredObject(page.conditions, 'Event page conditions')
  const image = requiredObject(page.image, 'Event page image')
  const [switch1Id = 1, switch2Id = 1] = draft.conditions.switchIds

  Object.assign(conditions, {
    actorId: draft.conditions.actorId ?? 1,
    actorValid: draft.conditions.actorId !== undefined,
    itemId: draft.conditions.itemId ?? 1,
    itemValid: draft.conditions.itemId !== undefined,
    selfSwitchCh: draft.conditions.selfSwitch ?? 'A',
    selfSwitchValid: draft.conditions.selfSwitch !== undefined,
    switch1Id,
    switch1Valid: draft.conditions.switchIds.length >= 1,
    switch2Id,
    switch2Valid: draft.conditions.switchIds.length >= 2,
    variableId: draft.conditions.variable?.id ?? 1,
    variableValid: draft.conditions.variable !== undefined,
    variableValue: draft.conditions.variable?.minimum ?? 0
  })
  image.characterName = draft.imageName

  return Object.assign(page, {
    conditions,
    image,
    list: commandList(draft.commands),
    moveType: draft.moveType,
    priorityType: draft.priority,
    trigger: draft.trigger
  })
}

function mutateNamedEntry(
  document: unknown,
  operation: Extract<ProjectChangeOperation, { kind: 'renameNamedEntry' }>
): { before: unknown; after: unknown; summary: string } {
  assertInteger(operation.id, 'Entry ID', 1, 9999)
  assertText(operation.name, 'Entry name', 200)
  const root = requiredObject(document, 'System data')
  if (operation.target !== 'switch' && operation.target !== 'variable') {
    throw new ProjectMutationError('invalidChange', 'The named entry type is not supported.')
  }
  const key = operation.target === 'switch' ? 'switches' : 'variables'
  const entries = requiredArray(root[key], key)
  if (operation.id >= entries.length) {
    throw new ProjectMutationError('invalidChange', `${key}[${operation.id}] does not exist.`)
  }
  const before = entries[operation.id]
  entries[operation.id] = operation.name
  root[key] = entries
  return { before, after: operation.name, summary: `${key}[${operation.id}]` }
}

function mutateCommonEvent(
  document: unknown,
  draft: CommonEventDraft
): { before: unknown; after: unknown; summary: string } {
  if (!draft || typeof draft !== 'object') {
    throw new ProjectMutationError('invalidChange', 'Common event data is invalid.')
  }
  assertText(draft.name, 'Common event name', 200)
  assertInteger(draft.trigger, 'Common event trigger', 0, 2)
  if (draft.trigger !== 0) assertInteger(draft.switchId, 'Switch ID', 1, 9999)
  const entries = requiredArray(document, 'Common events')
  const id = draft.id ?? nextAvailableId(entries)
  assertInteger(id, 'Common event ID', 1, 9999)
  const existing = entries[id]
  if (draft.id !== undefined && (existing === null || existing === undefined)) {
    throw new ProjectMutationError('invalidChange', `Common event ${id} does not exist.`)
  }
  const before = existing === null || existing === undefined ? null : structuredClone(existing)
  const after =
    existing === null || existing === undefined ? {} : requiredObject(existing, 'Common event')
  Object.assign(after, {
    id,
    list: commandList(draft.commands),
    name: draft.name,
    switchId: draft.trigger === 0 ? 1 : draft.switchId,
    trigger: draft.trigger
  })
  setArrayEntry(entries, id, after)
  return { before, after, summary: `commonEvents[${id}]` }
}

function mutateMapEvent(
  document: unknown,
  draft: MapEventDraft
): { before: unknown; after: unknown; summary: string } {
  if (!draft || typeof draft !== 'object') {
    throw new ProjectMutationError('invalidChange', 'Map event data is invalid.')
  }
  assertInteger(draft.mapId, 'Map ID', 1, 9999)
  assertText(draft.name, 'Map event name', 200)
  assertText(draft.note, 'Map event note', 5000)
  assertInteger(draft.x, 'Map X', 0, 9999)
  assertInteger(draft.y, 'Map Y', 0, 9999)
  const root = requiredObject(document, 'Map data')
  if (typeof root.width === 'number' && draft.x >= root.width) {
    throw new ProjectMutationError('invalidChange', 'Map X is outside the map.')
  }
  if (typeof root.height === 'number' && draft.y >= root.height) {
    throw new ProjectMutationError('invalidChange', 'Map Y is outside the map.')
  }
  const events = requiredArray(root.events, 'Map events')
  const id = draft.id ?? nextAvailableId(events)
  assertInteger(id, 'Map event ID', 1, 9999)
  const existing = events[id]
  if (draft.id !== undefined && (existing === null || existing === undefined)) {
    throw new ProjectMutationError('invalidChange', `Map event ${id} does not exist.`)
  }

  const before = existing === null || existing === undefined ? null : structuredClone(existing)
  const event =
    existing === null || existing === undefined ? {} : requiredObject(existing, 'Map event')
  const pages =
    existing === null || existing === undefined ? [] : requiredArray(event.pages, 'Map event pages')
  const pageIndex = draft.page.id === undefined ? pages.length : draft.page.id - 1
  assertInteger(pageIndex, 'Event page index', 0, 19)
  if (draft.page.id !== undefined && pages[pageIndex] === undefined) {
    throw new ProjectMutationError('invalidChange', `Event page ${draft.page.id} does not exist.`)
  }
  if (pages.length >= 20 && draft.page.id === undefined) {
    throw new ProjectMutationError('invalidChange', 'A map event supports at most 20 pages.')
  }

  pages[pageIndex] = buildPage(draft.page, pages[pageIndex])
  Object.assign(event, {
    id,
    name: draft.name,
    note: draft.note,
    pages,
    x: draft.x,
    y: draft.y
  })
  setArrayEntry(events, id, event)
  root.events = events
  return {
    before,
    after: event,
    summary: `Map${String(draft.mapId).padStart(3, '0')}.events[${id}]`
  }
}

function mutationError(error: unknown): {
  status: 'error'
  code: ProjectMutationErrorCode
  detail?: string
} {
  return {
    status: 'error',
    code: error instanceof ProjectMutationError ? error.code : 'writeFailed',
    detail: error instanceof Error ? error.message : undefined
  }
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const temporaryPath = `${filePath}.rpgmv-copilot-${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, content, 'utf8')
    await rename(temporaryPath, filePath)
  } catch (error) {
    await rm(temporaryPath, { force: true })
    throw error
  }
}

export class ProjectSession {
  private projectFile: string | null = null
  private project: ProjectSnapshot | null = null
  private pending: PendingChange | null = null
  private undoRecord: UndoRecord | null = null

  async open(projectFile: string): Promise<ProjectSnapshot> {
    const project = await readProject(projectFile)
    this.projectFile = projectFile
    this.project = project
    this.pending = null
    this.undoRecord = null
    return project
  }

  async preview(operation: ProjectChangeOperation): Promise<PreviewChangeResult> {
    if (!this.projectFile || !this.project) return { status: 'error', code: 'noProject' }

    try {
      if (
        !operation ||
        typeof operation !== 'object' ||
        !['renameNamedEntry', 'saveCommonEvent', 'saveMapEvent'].includes(operation.kind)
      ) {
        throw new ProjectMutationError('invalidChange', 'The change type is not supported.')
      }
      let filePath: string
      if (operation.kind === 'renameNamedEntry') {
        filePath = join(this.project.rootPath, 'data', 'System.json')
      } else if (operation.kind === 'saveCommonEvent') {
        filePath = join(this.project.rootPath, 'data', 'CommonEvents.json')
      } else {
        if (!operation.event || typeof operation.event !== 'object') {
          throw new ProjectMutationError('invalidChange', 'Map event data is invalid.')
        }
        if (!this.project.maps.some((map) => map.id === operation.event.mapId)) {
          throw new ProjectMutationError('invalidChange', 'The selected map does not exist.')
        }
        filePath = join(
          this.project.rootPath,
          'data',
          `Map${String(operation.event.mapId).padStart(3, '0')}.json`
        )
      }

      const originalText = await readFile(filePath, 'utf8')
      const document = parseDocument(originalText)
      const mutation =
        operation.kind === 'renameNamedEntry'
          ? mutateNamedEntry(document, operation)
          : operation.kind === 'saveCommonEvent'
            ? mutateCommonEvent(document, operation.event)
            : mutateMapEvent(document, operation.event)
      const before = JSON.stringify(mutation.before ?? null, null, 2)
      const after = JSON.stringify(mutation.after ?? null, null, 2)
      if (before === after) {
        throw new ProjectMutationError('invalidChange', 'The operation does not change the file.')
      }
      const nextText = serializeDocument(document, originalText)
      if (nextText === originalText) {
        throw new ProjectMutationError('invalidChange', 'The operation does not change the file.')
      }
      const pending: PendingChange = {
        id: randomUUID(),
        filePath,
        originalText,
        nextText,
        fileName: basename(filePath),
        summary: mutation.summary,
        before,
        after
      }
      this.pending = pending
      return {
        status: 'ready',
        preview: {
          id: pending.id,
          fileName: pending.fileName,
          summary: pending.summary,
          before: pending.before,
          after: pending.after
        }
      }
    } catch (error) {
      return mutationError(error)
    }
  }

  async apply(previewId: string): Promise<ApplyChangeResult> {
    if (!this.projectFile || !this.project) return { status: 'error', code: 'noProject' }
    if (!this.pending || this.pending.id !== previewId) {
      return { status: 'error', code: 'invalidChange' }
    }

    try {
      const currentText = await readFile(this.pending.filePath, 'utf8')
      if (currentText !== this.pending.originalText) {
        this.pending = null
        throw new ProjectMutationError('projectChanged', 'The project changed after preview.')
      }

      const backupDirectory = join(
        this.project.rootPath,
        '.rpgmv-copilot',
        'backups',
        `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`,
        'data'
      )
      await mkdir(backupDirectory, { recursive: true })
      const backupPath = join(backupDirectory, this.pending.fileName)
      await writeFile(backupPath, this.pending.originalText, 'utf8')
      await atomicWrite(this.pending.filePath, this.pending.nextText)
      this.undoRecord = {
        filePath: this.pending.filePath,
        beforeText: this.pending.originalText,
        afterText: this.pending.nextText
      }
      this.pending = null
      this.project = await readProject(this.projectFile)
      return { status: 'applied', project: this.project, backupPath }
    } catch (error) {
      return mutationError(error)
    }
  }

  async undo(): Promise<UndoChangeResult> {
    if (!this.projectFile || !this.project) return { status: 'error', code: 'noProject' }
    if (!this.undoRecord) return { status: 'empty' }

    try {
      const currentText = await readFile(this.undoRecord.filePath, 'utf8')
      if (currentText !== this.undoRecord.afterText) {
        this.undoRecord = null
        throw new ProjectMutationError(
          'projectChanged',
          'The project changed after the last write.'
        )
      }
      await atomicWrite(this.undoRecord.filePath, this.undoRecord.beforeText)
      this.undoRecord = null
      this.pending = null
      this.project = await readProject(this.projectFile)
      return { status: 'undone', project: this.project }
    } catch (error) {
      return mutationError(error)
    }
  }
}
