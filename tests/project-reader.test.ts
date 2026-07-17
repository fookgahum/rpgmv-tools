import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readProject } from '../src/main/project-reader'

const projectFile = resolve('tests/fixtures/minimal-project/Game.rpgproject')

describe('RPG Maker MV project reader', () => {
  it('loads the project index and event command lists', async () => {
    const project = await readProject(projectFile)

    expect(project.title).toBe('Fixture Quest')
    expect(project.versionId).toBe(42)
    expect(project.maps).toHaveLength(1)
    expect(project.maps[0]).toMatchObject({ width: 20, height: 20 })
    expect(project.maps[0].events[0]).toMatchObject({
      id: 1,
      name: 'Reward Chest',
      x: 10,
      y: 12
    })
    expect(project.maps[0].events[0].pages[0].commands).toHaveLength(9)
    expect(project.commonEvents[0].name).toBe('Quest Reward')
    expect(project.switches[1].name).toBe('Chest Open')
    expect(project.variables[1].name).toBe('Reward Amount')
    expect(project.database.items[0].name).toBe('Potion')
    expect(project.warnings).toEqual([])
  })

  it('indexes references from page commands and common events', async () => {
    const project = await readProject(projectFile)

    expect(project.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: 'switch', targetId: 1, access: 'read' }),
        expect.objectContaining({ target: 'switch', targetId: 2, access: 'write' }),
        expect.objectContaining({ target: 'variable', targetId: 1, access: 'write' }),
        expect.objectContaining({ target: 'variable', targetId: 2, access: 'read' }),
        expect.objectContaining({ target: 'item', targetId: 1, access: 'use' }),
        expect.objectContaining({ target: 'commonEvent', targetId: 1, access: 'call' })
      ])
    )
  })

  it('rejects files that are not named Game.rpgproject', async () => {
    await expect(
      readProject(resolve('tests/fixtures/minimal-project/Other.rpgproject'))
    ).rejects.toMatchObject({ code: 'invalidProjectFile' })
  })
})
