export const RPGMV_TILE_SIZE = 48

const TILE_ID_A5 = 1536
const TILE_ID_A1 = 2048
const TILE_ID_A2 = 2816
const TILE_ID_A3 = 4352
const TILE_ID_A4 = 5888
const TILE_ID_MAX = 8192

type Quarter = readonly [number, number]
type AutotileShape = readonly [Quarter, Quarter, Quarter, Quarter]

// Coordinate tables and source layout follow RPG Maker MV's official Tilemap implementation.
// https://github.com/rpgtkoolmv/corescript/blob/master/js/rpg_core/Tilemap.js
const floorAutotileTable: readonly AutotileShape[] = [
  [
    [2, 4],
    [1, 4],
    [2, 3],
    [1, 3]
  ],
  [
    [2, 0],
    [1, 4],
    [2, 3],
    [1, 3]
  ],
  [
    [2, 4],
    [3, 0],
    [2, 3],
    [1, 3]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 3],
    [1, 3]
  ],
  [
    [2, 4],
    [1, 4],
    [2, 3],
    [3, 1]
  ],
  [
    [2, 0],
    [1, 4],
    [2, 3],
    [3, 1]
  ],
  [
    [2, 4],
    [3, 0],
    [2, 3],
    [3, 1]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 3],
    [3, 1]
  ],
  [
    [2, 4],
    [1, 4],
    [2, 1],
    [1, 3]
  ],
  [
    [2, 0],
    [1, 4],
    [2, 1],
    [1, 3]
  ],
  [
    [2, 4],
    [3, 0],
    [2, 1],
    [1, 3]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 1],
    [1, 3]
  ],
  [
    [2, 4],
    [1, 4],
    [2, 1],
    [3, 1]
  ],
  [
    [2, 0],
    [1, 4],
    [2, 1],
    [3, 1]
  ],
  [
    [2, 4],
    [3, 0],
    [2, 1],
    [3, 1]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 1],
    [3, 1]
  ],
  [
    [0, 4],
    [1, 4],
    [0, 3],
    [1, 3]
  ],
  [
    [0, 4],
    [3, 0],
    [0, 3],
    [1, 3]
  ],
  [
    [0, 4],
    [1, 4],
    [0, 3],
    [3, 1]
  ],
  [
    [0, 4],
    [3, 0],
    [0, 3],
    [3, 1]
  ],
  [
    [2, 2],
    [1, 2],
    [2, 3],
    [1, 3]
  ],
  [
    [2, 2],
    [1, 2],
    [2, 3],
    [3, 1]
  ],
  [
    [2, 2],
    [1, 2],
    [2, 1],
    [1, 3]
  ],
  [
    [2, 2],
    [1, 2],
    [2, 1],
    [3, 1]
  ],
  [
    [2, 4],
    [3, 4],
    [2, 3],
    [3, 3]
  ],
  [
    [2, 4],
    [3, 4],
    [2, 1],
    [3, 3]
  ],
  [
    [2, 0],
    [3, 4],
    [2, 3],
    [3, 3]
  ],
  [
    [2, 0],
    [3, 4],
    [2, 1],
    [3, 3]
  ],
  [
    [2, 4],
    [1, 4],
    [2, 5],
    [1, 5]
  ],
  [
    [2, 0],
    [1, 4],
    [2, 5],
    [1, 5]
  ],
  [
    [2, 4],
    [3, 0],
    [2, 5],
    [1, 5]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 5],
    [1, 5]
  ],
  [
    [0, 4],
    [3, 4],
    [0, 3],
    [3, 3]
  ],
  [
    [2, 2],
    [1, 2],
    [2, 5],
    [1, 5]
  ],
  [
    [0, 2],
    [1, 2],
    [0, 3],
    [1, 3]
  ],
  [
    [0, 2],
    [1, 2],
    [0, 3],
    [3, 1]
  ],
  [
    [2, 2],
    [3, 2],
    [2, 3],
    [3, 3]
  ],
  [
    [2, 2],
    [3, 2],
    [2, 1],
    [3, 3]
  ],
  [
    [2, 4],
    [3, 4],
    [2, 5],
    [3, 5]
  ],
  [
    [2, 0],
    [3, 4],
    [2, 5],
    [3, 5]
  ],
  [
    [0, 4],
    [1, 4],
    [0, 5],
    [1, 5]
  ],
  [
    [0, 4],
    [3, 0],
    [0, 5],
    [1, 5]
  ],
  [
    [0, 2],
    [3, 2],
    [0, 3],
    [3, 3]
  ],
  [
    [0, 2],
    [1, 2],
    [0, 5],
    [1, 5]
  ],
  [
    [0, 4],
    [3, 4],
    [0, 5],
    [3, 5]
  ],
  [
    [2, 2],
    [3, 2],
    [2, 5],
    [3, 5]
  ],
  [
    [0, 2],
    [3, 2],
    [0, 5],
    [3, 5]
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ]
]

const wallAutotileTable: readonly AutotileShape[] = [
  [
    [2, 2],
    [1, 2],
    [2, 1],
    [1, 1]
  ],
  [
    [0, 2],
    [1, 2],
    [0, 1],
    [1, 1]
  ],
  [
    [2, 0],
    [1, 0],
    [2, 1],
    [1, 1]
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ],
  [
    [2, 2],
    [3, 2],
    [2, 1],
    [3, 1]
  ],
  [
    [0, 2],
    [3, 2],
    [0, 1],
    [3, 1]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 1],
    [3, 1]
  ],
  [
    [0, 0],
    [3, 0],
    [0, 1],
    [3, 1]
  ],
  [
    [2, 2],
    [1, 2],
    [2, 3],
    [1, 3]
  ],
  [
    [0, 2],
    [1, 2],
    [0, 3],
    [1, 3]
  ],
  [
    [2, 0],
    [1, 0],
    [2, 3],
    [1, 3]
  ],
  [
    [0, 0],
    [1, 0],
    [0, 3],
    [1, 3]
  ],
  [
    [2, 2],
    [3, 2],
    [2, 3],
    [3, 3]
  ],
  [
    [0, 2],
    [3, 2],
    [0, 3],
    [3, 3]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 3],
    [3, 3]
  ],
  [
    [0, 0],
    [3, 0],
    [0, 3],
    [3, 3]
  ]
]

const waterfallAutotileTable: readonly AutotileShape[] = [
  [
    [2, 0],
    [1, 0],
    [2, 1],
    [1, 1]
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ],
  [
    [2, 0],
    [3, 0],
    [2, 1],
    [3, 1]
  ],
  [
    [0, 0],
    [3, 0],
    [0, 1],
    [3, 1]
  ]
]

interface TileSourcePiece {
  imageIndex: number
  sourceX: number
  sourceY: number
  sourceWidth: number
  sourceHeight: number
  destinationX: number
  destinationY: number
  destinationWidth: number
  destinationHeight: number
}

function normalTilePieces(tileId: number): TileSourcePiece[] {
  const imageIndex = tileId >= TILE_ID_A5 && tileId < TILE_ID_A1 ? 4 : 5 + Math.floor(tileId / 256)
  const sourceX = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * RPGMV_TILE_SIZE
  const sourceY = (Math.floor((tileId % 256) / 8) % 16) * RPGMV_TILE_SIZE
  return [
    {
      imageIndex,
      sourceX,
      sourceY,
      sourceWidth: RPGMV_TILE_SIZE,
      sourceHeight: RPGMV_TILE_SIZE,
      destinationX: 0,
      destinationY: 0,
      destinationWidth: RPGMV_TILE_SIZE,
      destinationHeight: RPGMV_TILE_SIZE
    }
  ]
}

function autotilePieces(
  tileId: number,
  flags: number[],
  animationFrame: number
): TileSourcePiece[] {
  const kind = Math.floor((tileId - TILE_ID_A1) / 48)
  const shape = (tileId - TILE_ID_A1) % 48
  const tx = kind % 8
  const ty = Math.floor(kind / 8)
  let imageIndex = 0
  let blockX = 0
  let blockY = 0
  let table = floorAutotileTable
  let tableTile = false

  if (tileId < TILE_ID_A2) {
    const waterSurfaceIndex = [0, 1, 2, 1][animationFrame % 4]
    if (kind === 0) {
      blockX = waterSurfaceIndex * 2
    } else if (kind === 1) {
      blockX = waterSurfaceIndex * 2
      blockY = 3
    } else if (kind === 2) {
      blockX = 6
    } else if (kind === 3) {
      blockX = 6
      blockY = 3
    } else {
      blockX = Math.floor(tx / 4) * 8
      blockY = ty * 6 + (Math.floor(tx / 2) % 2) * 3
      if (kind % 2 === 0) {
        blockX += waterSurfaceIndex * 2
      } else {
        blockX += 6
        blockY += animationFrame % 3
        table = waterfallAutotileTable
      }
    }
  } else if (tileId < TILE_ID_A3) {
    imageIndex = 1
    blockX = tx * 2
    blockY = (ty - 2) * 3
    tableTile = (flags[tileId] & 0x80) !== 0
  } else if (tileId < TILE_ID_A4) {
    imageIndex = 2
    blockX = tx * 2
    blockY = (ty - 6) * 2
    table = wallAutotileTable
  } else {
    imageIndex = 3
    blockX = tx * 2
    blockY = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0))
    if (ty % 2 === 1) table = wallAutotileTable
  }

  const quarters = table[shape]
  if (!quarters) return []
  const half = RPGMV_TILE_SIZE / 2
  return quarters.flatMap(([quarterX, quarterY], index) => {
    const destinationX = (index % 2) * half
    const destinationY = Math.floor(index / 2) * half
    const sourceX = (blockX * 2 + quarterX) * half
    const sourceY = (blockY * 2 + quarterY) * half
    if (tableTile && (quarterY === 1 || quarterY === 5)) {
      const baseQuarterX = quarterY === 1 ? [0, 3, 2, 1][quarterX] : quarterX
      return [
        {
          imageIndex,
          sourceX: (blockX * 2 + baseQuarterX) * half,
          sourceY: (blockY * 2 + 3) * half,
          sourceWidth: half,
          sourceHeight: half,
          destinationX,
          destinationY,
          destinationWidth: half,
          destinationHeight: half
        },
        {
          imageIndex,
          sourceX,
          sourceY,
          sourceWidth: half,
          sourceHeight: half / 2,
          destinationX,
          destinationY: destinationY + half / 2,
          destinationWidth: half,
          destinationHeight: half / 2
        }
      ]
    }
    return [
      {
        imageIndex,
        sourceX,
        sourceY,
        sourceWidth: half,
        sourceHeight: half,
        destinationX,
        destinationY,
        destinationWidth: half,
        destinationHeight: half
      }
    ]
  })
}

export function tileSourcePieces(
  tileId: number,
  flags: number[],
  animationFrame = 0
): TileSourcePiece[] {
  if (!Number.isInteger(tileId) || tileId <= 0 || tileId >= TILE_ID_MAX) return []
  return tileId >= TILE_ID_A1
    ? autotilePieces(tileId, flags, animationFrame)
    : normalTilePieces(tileId)
}
