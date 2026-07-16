import { readFile, stat } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import type {
  CommonEvent,
  DatabaseEntry,
  DatabaseKind,
  EventCommand,
  EventPageConditions,
  MapEvent,
  MapEventPage,
  NamedEntry,
  ProjectMap,
  ProjectReference,
  ProjectSnapshot,
  ProjectWarning,
  ReferenceAccess,
  ReferenceSource,
  ReferenceTarget
} from '../shared/contracts'

type ProjectReadErrorCode =
  'invalidProjectFile' | 'missingProjectData' | 'invalidJson' | 'unreadableProject'

export class ProjectReadError extends Error {
  constructor(
    readonly code: ProjectReadErrorCode,
    message: string
  ) {
    super(message)
  }
}

type JsonObject = Record<string, unknown>

function objectValue(value: unknown): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {}
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function readJson(filePath: string): Promise<unknown> {
  let content: string

  try {
    content = await readFile(filePath, 'utf8')
  } catch (error) {
    const detail = error instanceof Error ? error.message : filePath
    throw new ProjectReadError('unreadableProject', detail)
  }

  try {
    return JSON.parse(content.replace(/^\uFEFF/, '')) as unknown
  } catch {
    throw new ProjectReadError('invalidJson', basename(filePath))
  }
}

function parseCommand(value: unknown): EventCommand {
  const command = objectValue(value)
  return {
    code: numberValue(command.code),
    indent: numberValue(command.indent),
    parameters: arrayValue(command.parameters)
  }
}

function parseCommands(value: unknown): EventCommand[] {
  return arrayValue(value)
    .map(parseCommand)
    .filter((command) => command.code !== 0)
}

function parseConditions(value: unknown): EventPageConditions {
  const conditions = objectValue(value)
  const switchIds: number[] = []

  if (conditions.switch1Valid === true) switchIds.push(numberValue(conditions.switch1Id))
  if (conditions.switch2Valid === true) switchIds.push(numberValue(conditions.switch2Id))

  return {
    switchIds: switchIds.filter((id) => id > 0),
    ...(conditions.variableValid === true
      ? {
          variable: {
            id: numberValue(conditions.variableId),
            minimum: numberValue(conditions.variableValue)
          }
        }
      : {}),
    ...(conditions.selfSwitchValid === true
      ? { selfSwitch: stringValue(conditions.selfSwitchCh) }
      : {}),
    ...(conditions.itemValid === true ? { itemId: numberValue(conditions.itemId) } : {}),
    ...(conditions.actorValid === true ? { actorId: numberValue(conditions.actorId) } : {})
  }
}

function parsePage(value: unknown, index: number): MapEventPage {
  const page = objectValue(value)
  const image = objectValue(page.image)

  return {
    id: index + 1,
    conditions: parseConditions(page.conditions),
    trigger: numberValue(page.trigger),
    priority: numberValue(page.priorityType, 1),
    imageName: stringValue(image.characterName),
    moveType: numberValue(page.moveType),
    commands: parseCommands(page.list)
  }
}

function parseMapEvent(value: unknown): MapEvent | null {
  if (value === null) return null
  const event = objectValue(value)
  const id = numberValue(event.id)
  if (id <= 0) return null

  return {
    id,
    name: stringValue(event.name),
    note: stringValue(event.note),
    x: numberValue(event.x),
    y: numberValue(event.y),
    pages: arrayValue(event.pages).map(parsePage)
  }
}

function parseCommonEvents(value: unknown): CommonEvent[] {
  return arrayValue(value).flatMap((entry) => {
    if (entry === null) return []
    const event = objectValue(entry)
    const id = numberValue(event.id)
    if (id <= 0) return []

    return [
      {
        id,
        name: stringValue(event.name),
        trigger: numberValue(event.trigger),
        switchId: numberValue(event.switchId),
        commands: parseCommands(event.list)
      }
    ]
  })
}

function parseNamedEntries(value: unknown): NamedEntry[] {
  return arrayValue(value).flatMap((name, id) =>
    id === 0 ? [] : [{ id, name: stringValue(name) }]
  )
}

function parseDatabase(value: unknown): DatabaseEntry[] {
  return arrayValue(value).flatMap((entry) => {
    if (entry === null) return []
    const data = objectValue(entry)
    const id = numberValue(data.id)
    if (id <= 0) return []

    return [
      {
        id,
        name: stringValue(data.name),
        description: stringValue(data.description),
        price: numberValue(data.price)
      }
    ]
  })
}

function addReference(
  references: ProjectReference[],
  target: ReferenceTarget,
  targetId: unknown,
  access: ReferenceAccess,
  source: ReferenceSource
): void {
  const id = numberValue(targetId)
  if (id > 0) references.push({ target, targetId: id, access, source })
}

function addVariableOperandReference(
  references: ProjectReference[],
  operandType: unknown,
  operand: unknown,
  source: ReferenceSource
): void {
  if (operandType === 1) addReference(references, 'variable', operand, 'read', source)
}

function addRangeReferences(
  references: ProjectReference[],
  target: 'switch' | 'variable',
  firstValue: unknown,
  lastValue: unknown,
  source: ReferenceSource
): void {
  const first = Math.max(1, numberValue(firstValue))
  const last = Math.min(numberValue(lastValue), first + 9999)
  for (let id = first; id <= last; id += 1) {
    addReference(references, target, id, 'write', source)
  }
}

function collectCommandReferences(
  references: ProjectReference[],
  command: EventCommand,
  source: ReferenceSource
): void {
  const parameters = command.parameters

  switch (command.code) {
    case 103:
    case 104:
      addReference(references, 'variable', parameters[0], 'write', source)
      break
    case 111:
      if (parameters[0] === 0) addReference(references, 'switch', parameters[1], 'read', source)
      if (parameters[0] === 1) {
        addReference(references, 'variable', parameters[1], 'read', source)
        addVariableOperandReference(references, parameters[2], parameters[3], source)
      }
      if (parameters[0] === 8) addReference(references, 'item', parameters[1], 'condition', source)
      if (parameters[0] === 9)
        addReference(references, 'weapon', parameters[1], 'condition', source)
      if (parameters[0] === 10)
        addReference(references, 'armor', parameters[1], 'condition', source)
      break
    case 117:
      addReference(references, 'commonEvent', parameters[0], 'call', source)
      break
    case 121:
      addRangeReferences(references, 'switch', parameters[0], parameters[1], source)
      break
    case 122:
      addRangeReferences(references, 'variable', parameters[0], parameters[1], source)
      addVariableOperandReference(references, parameters[3], parameters[4], source)
      break
    case 124:
      addVariableOperandReference(references, parameters[1], parameters[2], source)
      break
    case 125:
      addVariableOperandReference(references, parameters[1], parameters[2], source)
      break
    case 126:
    case 127:
    case 128: {
      const target: DatabaseKind =
        command.code === 126 ? 'item' : command.code === 127 ? 'weapon' : 'armor'
      addReference(references, target, parameters[0], 'use', source)
      addVariableOperandReference(references, parameters[2], parameters[3], source)
      break
    }
    case 201:
      if (parameters[0] === 1) {
        addReference(references, 'variable', parameters[1], 'read', source)
        addReference(references, 'variable', parameters[2], 'read', source)
        addReference(references, 'variable', parameters[3], 'read', source)
      }
      break
    case 285:
      addReference(references, 'variable', parameters[0], 'write', source)
      if (parameters[2] === 1) {
        addReference(references, 'variable', parameters[3], 'read', source)
        addReference(references, 'variable', parameters[4], 'read', source)
      }
      break
    case 301:
      if (parameters[0] === 1) addReference(references, 'variable', parameters[1], 'read', source)
      break
    case 302:
    case 605: {
      const target: DatabaseKind =
        parameters[0] === 0 ? 'item' : parameters[0] === 1 ? 'weapon' : 'armor'
      addReference(references, target, parameters[1], 'use', source)
      break
    }
  }
}

function collectReferences(maps: ProjectMap[], commonEvents: CommonEvent[]): ProjectReference[] {
  const references: ProjectReference[] = []

  for (const map of maps) {
    for (const event of map.events) {
      for (const page of event.pages) {
        const pageSource: ReferenceSource = {
          kind: 'mapEvent',
          mapId: map.id,
          eventId: event.id,
          pageId: page.id
        }

        for (const switchId of page.conditions.switchIds) {
          addReference(references, 'switch', switchId, 'condition', pageSource)
        }
        if (page.conditions.variable) {
          addReference(references, 'variable', page.conditions.variable.id, 'condition', pageSource)
        }
        addReference(references, 'item', page.conditions.itemId, 'condition', pageSource)

        page.commands.forEach((command, commandIndex) =>
          collectCommandReferences(references, command, { ...pageSource, commandIndex })
        )
      }
    }
  }

  for (const event of commonEvents) {
    const source: ReferenceSource = { kind: 'commonEvent', commonEventId: event.id }
    if (event.trigger !== 0) {
      addReference(references, 'switch', event.switchId, 'condition', source)
    }
    event.commands.forEach((command, commandIndex) =>
      collectCommandReferences(references, command, { ...source, commandIndex })
    )
  }

  return references
}

async function readMap(
  dataPath: string,
  id: number,
  name: string,
  warnings: ProjectWarning[]
): Promise<ProjectMap> {
  const filePath = join(dataPath, `Map${String(id).padStart(3, '0')}.json`)

  try {
    const map = objectValue(await readJson(filePath))
    return {
      id,
      name,
      events: arrayValue(map.events).flatMap((entry) => {
        const event = parseMapEvent(entry)
        return event ? [event] : []
      })
    }
  } catch (error) {
    const code =
      error instanceof ProjectReadError && error.code === 'invalidJson'
        ? 'invalidMapFile'
        : 'missingMapFile'
    warnings.push({ code, mapId: id })
    return { id, name, events: [] }
  }
}

async function readRequiredData(dataPath: string, fileName: string): Promise<unknown> {
  try {
    return await readJson(join(dataPath, fileName))
  } catch (error) {
    if (error instanceof ProjectReadError && error.code === 'invalidJson') throw error
    const detail = error instanceof Error ? error.message : fileName
    throw new ProjectReadError('missingProjectData', detail)
  }
}

export async function readProject(projectFile: string): Promise<ProjectSnapshot> {
  if (basename(projectFile).toLowerCase() !== 'game.rpgproject') {
    throw new ProjectReadError('invalidProjectFile', basename(projectFile))
  }

  try {
    const projectStat = await stat(projectFile)
    if (!projectStat.isFile()) throw new Error('Not a file')
  } catch {
    throw new ProjectReadError('invalidProjectFile', projectFile)
  }

  const rootPath = dirname(projectFile)
  const dataPath = join(rootPath, 'data')
  const [systemData, mapInfos, commonEventData, itemData, weaponData, armorData] =
    await Promise.all([
      readRequiredData(dataPath, 'System.json'),
      readRequiredData(dataPath, 'MapInfos.json'),
      readRequiredData(dataPath, 'CommonEvents.json'),
      readRequiredData(dataPath, 'Items.json'),
      readRequiredData(dataPath, 'Weapons.json'),
      readRequiredData(dataPath, 'Armors.json')
    ])
  const system = objectValue(systemData)

  const warnings: ProjectWarning[] = []
  const maps = await Promise.all(
    arrayValue(mapInfos).flatMap((entry) => {
      if (entry === null) return []
      const mapInfo = objectValue(entry)
      const id = numberValue(mapInfo.id)
      return id > 0 ? [readMap(dataPath, id, stringValue(mapInfo.name), warnings)] : []
    })
  )
  const commonEvents = parseCommonEvents(commonEventData)
  const items = parseDatabase(itemData)
  const weapons = parseDatabase(weaponData)
  const armors = parseDatabase(armorData)

  return {
    rootPath,
    title: stringValue(system.gameTitle) || basename(rootPath),
    versionId: numberValue(system.versionId),
    maps,
    commonEvents,
    switches: parseNamedEntries(system.switches),
    variables: parseNamedEntries(system.variables),
    database: { items, weapons, armors },
    references: collectReferences(maps, commonEvents),
    warnings
  }
}
