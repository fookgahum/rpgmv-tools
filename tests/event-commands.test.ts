import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { readProject } from '../src/main/project-reader'
import { formatEventCommand } from '../src/renderer/src/event-commands'
import type { ProjectSnapshot } from '../src/shared/contracts'

let project: ProjectSnapshot

beforeAll(async () => {
  project = await readProject(resolve('tests/fixtures/minimal-project/Game.rpgproject'))
})

describe('event command formatting', () => {
  it('formats switch commands with project names', () => {
    const result = formatEventCommand(
      { code: 121, indent: 0, parameters: [2, 2, 0] },
      project,
      'zh-CN'
    )

    expect(result).toEqual({ name: '控制开关', detail: '#0002 Chest Open = ON' })
  })

  it('formats inventory changes with names and amounts', () => {
    const result = formatEventCommand(
      { code: 126, indent: 0, parameters: [1, 0, 0, 2] },
      project,
      'en'
    )

    expect(result).toEqual({ name: 'Change Items', detail: '#0001 Potion +2' })
  })

  it('preserves unknown commands as readable raw data', () => {
    const result = formatEventCommand(
      { code: 999, indent: 0, parameters: ['custom', 7] },
      project,
      'en'
    )

    expect(result).toEqual({ name: 'Unknown command 999', detail: 'custom, 7' })
  })

  it('formats variable operations and conditional branches', () => {
    expect(
      formatEventCommand({ code: 122, indent: 0, parameters: [1, 1, 1, 0, 3, 0] }, project, 'en')
        .detail
    ).toBe('#0001 Quest Stage += 3')
    expect(
      formatEventCommand({ code: 111, indent: 0, parameters: [0, 2, 0] }, project, 'zh-CN').detail
    ).toBe('#0002 Chest Open = ON')
  })
})
