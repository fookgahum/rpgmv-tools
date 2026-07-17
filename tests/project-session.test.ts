import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ProjectSession } from '../src/main/project-session'

const fixtureRoot = resolve('tests/fixtures/minimal-project')
let projectRoot: string
let projectFile: string

async function readJson(fileName: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(projectRoot, 'data', fileName), 'utf8')) as unknown
}

beforeEach(async () => {
  projectRoot = await mkdtemp(resolve('.tmp-test-project-'))
  await cp(fixtureRoot, projectRoot, { recursive: true })
  projectFile = resolve(projectRoot, 'Game.rpgproject')
})

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true })
})

describe('project write session', () => {
  it('previews, backs up, applies, and undoes a variable rename', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    const preview = await session.preview({
      kind: 'renameNamedEntry',
      target: 'variable',
      id: 1,
      name: 'Current Quest Stage'
    })

    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return
    expect(preview.preview).toMatchObject({ fileName: 'System.json', before: '"Quest Stage"' })

    const applied = await session.apply(preview.preview.id)
    expect(applied.status).toBe('applied')
    if (applied.status !== 'applied') return
    expect(applied.project.variables[0].name).toBe('Current Quest Stage')
    await expect(stat(applied.backupPath)).resolves.toBeDefined()
    await expect(readJson('System.json')).resolves.toMatchObject({
      variables: ['', 'Current Quest Stage', 'Reward Amount']
    })

    const undone = await session.undo()
    expect(undone.status).toBe('undone')
    if (undone.status === 'undone') {
      expect(undone.project.variables[0].name).toBe('Quest Stage')
    }
  })

  it('creates a common event with a valid command terminator', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    const preview = await session.preview({
      kind: 'saveCommonEvent',
      event: {
        name: 'Give Starting Gold',
        trigger: 0,
        switchId: 1,
        commands: [{ code: 125, indent: 0, parameters: [0, 0, 100] }]
      }
    })

    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return
    const applied = await session.apply(preview.preview.id)
    expect(applied.status).toBe('applied')
    if (applied.status !== 'applied') return
    expect(applied.project.commonEvents.at(-1)).toMatchObject({
      id: 2,
      name: 'Give Starting Gold'
    })
    const commonEvents = (await readJson('CommonEvents.json')) as Array<{
      list: Array<{ code: number }>
    } | null>
    expect(commonEvents[2]?.list.at(-1)?.code).toBe(0)
  })

  it('updates an existing common event in place', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    const preview = await session.preview({
      kind: 'saveCommonEvent',
      event: {
        id: 1,
        name: 'Updated Quest Reward',
        trigger: 0,
        switchId: 1,
        commands: [{ code: 230, indent: 0, parameters: [30] }]
      }
    })

    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return
    const applied = await session.apply(preview.preview.id)
    expect(applied.status).toBe('applied')
    if (applied.status === 'applied') {
      expect(applied.project.commonEvents[0]).toMatchObject({
        id: 1,
        name: 'Updated Quest Reward',
        trigger: 0
      })
    }
  })

  it('preserves unknown fields when updating an existing common event', async () => {
    const commonEventsPath = resolve(projectRoot, 'data', 'CommonEvents.json')
    const commonEvents = (await readJson('CommonEvents.json')) as Array<Record<
      string,
      unknown
    > | null>
    if (commonEvents[1]) commonEvents[1].pluginMetadata = { owner: 'fixture-plugin' }
    await writeFile(commonEventsPath, JSON.stringify(commonEvents), 'utf8')

    const session = new ProjectSession()
    await session.open(projectFile)
    const preview = await session.preview({
      kind: 'saveCommonEvent',
      event: {
        id: 1,
        name: 'Plugin-safe update',
        trigger: 0,
        switchId: 1,
        commands: []
      }
    })

    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return
    await session.apply(preview.preview.id)
    const updated = (await readJson('CommonEvents.json')) as Array<Record<string, unknown> | null>
    expect(updated[1]?.pluginMetadata).toEqual({ owner: 'fixture-plugin' })
  })

  it('creates a map event with one editable page', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    const preview = await session.preview({
      kind: 'saveMapEvent',
      event: {
        mapId: 1,
        name: 'Welcome NPC',
        note: '',
        x: 3,
        y: 4,
        page: {
          conditions: { switchIds: [] },
          trigger: 0,
          priority: 1,
          imageName: '',
          moveType: 0,
          commands: [
            { code: 101, indent: 0, parameters: ['', 0, 0, 2] },
            { code: 401, indent: 0, parameters: ['Welcome!'] }
          ]
        }
      }
    })

    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return
    const applied = await session.apply(preview.preview.id)
    expect(applied.status).toBe('applied')
    if (applied.status === 'applied') {
      expect(applied.project.maps[0].events.at(-1)).toMatchObject({
        id: 2,
        name: 'Welcome NPC',
        x: 3,
        y: 4
      })
    }
  })

  it('rejects an event coordinate outside the selected map', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    await expect(
      session.preview({
        kind: 'saveMapEvent',
        event: {
          mapId: 1,
          name: 'Out of bounds',
          note: '',
          x: 20,
          y: 0,
          page: {
            conditions: { switchIds: [] },
            trigger: 0,
            priority: 1,
            imageName: '',
            moveType: 0,
            commands: []
          }
        }
      })
    ).resolves.toMatchObject({ status: 'error', code: 'invalidChange' })
  })

  it('adds a page without replacing an existing map event page', async () => {
    const session = new ProjectSession()
    const project = await session.open(projectFile)
    const existing = project.maps[0].events[0]
    const preview = await session.preview({
      kind: 'saveMapEvent',
      event: {
        mapId: 1,
        id: existing.id,
        name: existing.name,
        note: existing.note,
        x: existing.x,
        y: existing.y,
        page: {
          conditions: { switchIds: [2] },
          trigger: 0,
          priority: 1,
          imageName: '!Chest',
          moveType: 0,
          commands: [
            { code: 101, indent: 0, parameters: ['', 0, 0, 2] },
            { code: 401, indent: 0, parameters: ['The chest is empty.'] }
          ]
        }
      }
    })

    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return
    const applied = await session.apply(preview.preview.id)
    expect(applied.status).toBe('applied')
    if (applied.status === 'applied') {
      expect(applied.project.maps[0].events[0].pages).toHaveLength(2)
      expect(applied.project.maps[0].events[0].pages[0].commands[0].code).toBe(101)
      expect(applied.project.maps[0].events[0].pages[1].conditions.switchIds).toEqual([2])
    }
  })

  it('rejects a preview when the source file changes before apply', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    const preview = await session.preview({
      kind: 'renameNamedEntry',
      target: 'switch',
      id: 1,
      name: 'Changed by Copilot'
    })
    expect(preview.status).toBe('ready')
    if (preview.status !== 'ready') return

    const systemPath = resolve(projectRoot, 'data', 'System.json')
    const systemText = await readFile(systemPath, 'utf8')
    await writeFile(systemPath, `${systemText}\n`, 'utf8')
    await expect(session.apply(preview.preview.id)).resolves.toMatchObject({
      status: 'error',
      code: 'projectChanged'
    })
  })

  it('rejects valid JSON with an unexpected target structure', async () => {
    const systemPath = resolve(projectRoot, 'data', 'System.json')
    const system = (await readJson('System.json')) as Record<string, unknown>
    system.switches = { 1: 'not-an-array' }
    await writeFile(systemPath, JSON.stringify(system), 'utf8')

    const session = new ProjectSession()
    await session.open(projectFile)
    await expect(
      session.preview({ kind: 'renameNamedEntry', target: 'switch', id: 1, name: 'Blocked' })
    ).resolves.toMatchObject({ status: 'error', code: 'invalidChange' })
  })

  it('does not create a preview for a no-op rename', async () => {
    const session = new ProjectSession()
    await session.open(projectFile)
    await expect(
      session.preview({ kind: 'renameNamedEntry', target: 'variable', id: 1, name: 'Quest Stage' })
    ).resolves.toMatchObject({ status: 'error', code: 'invalidChange' })
  })
})
