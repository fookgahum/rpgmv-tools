import { describe, expect, it } from 'vitest'
import { tileSourcePieces } from '../src/renderer/src/rpgmv-tile-renderer'

describe('RPG Maker MV tile source calculation', () => {
  it('maps B and A5 tiles to their tileset images', () => {
    expect(tileSourcePieces(1, [])).toEqual([
      expect.objectContaining({ imageIndex: 5, sourceX: 48, sourceY: 0 })
    ])
    expect(tileSourcePieces(1536, [])).toEqual([
      expect.objectContaining({ imageIndex: 4, sourceX: 0, sourceY: 0 })
    ])
  })

  it('splits floor autotiles into four source quarters', () => {
    const pieces = tileSourcePieces(2048, [])

    expect(pieces).toHaveLength(4)
    expect(pieces[0]).toMatchObject({
      imageIndex: 0,
      sourceX: 48,
      sourceY: 96,
      sourceWidth: 24,
      sourceHeight: 24,
      destinationX: 0,
      destinationY: 0
    })
  })

  it('uses the A2 image and table-tile split when its flag is enabled', () => {
    const tileId = 2816 + 28
    const flags: number[] = []
    flags[tileId] = 0x80

    expect(tileSourcePieces(tileId, flags)[0].imageIndex).toBe(1)
    expect(tileSourcePieces(tileId, flags).length).toBeGreaterThan(4)
  })

  it('ignores empty and out-of-range tile IDs', () => {
    expect(tileSourcePieces(0, [])).toEqual([])
    expect(tileSourcePieces(8192, [])).toEqual([])
  })
})
