import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadMapVisual } from '../src/main/map-visual'

const projectRoot = resolve('tests/fixtures/minimal-project')

describe('RPG Maker MV map visual loader', () => {
  it('loads and normalizes the six map layers on demand', async () => {
    const result = await loadMapVisual(projectRoot, 1)

    expect(result.status).toBe('loaded')
    if (result.status !== 'loaded') return
    expect(result.map).toMatchObject({
      width: 20,
      height: 20,
      tileWidth: 48,
      tileHeight: 48,
      tilesetId: 1,
      tilesetName: 'Fixture Outdoors',
      missingImages: []
    })
    expect(result.map.tileData).toHaveLength(20 * 20 * 6)
    expect(result.map.tilesetImages).toHaveLength(9)
  })

  it('rejects map IDs outside the supported RPGMV range', async () => {
    await expect(loadMapVisual(projectRoot, 0)).resolves.toMatchObject({
      status: 'error',
      code: 'invalidMap'
    })
  })
})
