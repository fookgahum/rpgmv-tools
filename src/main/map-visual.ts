import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { MapVisualData, MapVisualResult } from '../shared/contracts'

type JsonObject = Record<string, unknown>

function objectValue(value: unknown): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function readJsonObject(filePath: string): Promise<JsonObject> {
  const text = await readFile(filePath, 'utf8')
  const value = objectValue(JSON.parse(text.replace(/^\uFEFF/, '')) as unknown)
  if (!value) throw new Error(`${basename(filePath)} does not contain a JSON object.`)
  return value
}

function safeAssetName(value: unknown): string {
  const name = stringValue(value)
  if (
    name.length === 0 ||
    name.length > 200 ||
    basename(name) !== name ||
    /[<>:"/\\|?*]/.test(name) ||
    [...name].some((character) => character.charCodeAt(0) < 32)
  ) {
    return ''
  }
  return name
}

async function readPng(
  rootPath: string,
  directory: 'tilesets' | 'parallaxes',
  name: string,
  missingImages: string[]
): Promise<string | null> {
  if (!name) return null
  const relativePath = `img/${directory}/${name}.png`
  try {
    const image = await readFile(join(rootPath, 'img', directory, `${name}.png`))
    return `data:image/png;base64,${image.toString('base64')}`
  } catch {
    missingImages.push(relativePath)
    return null
  }
}

export async function loadMapVisual(rootPath: string, mapId: number): Promise<MapVisualResult> {
  if (!Number.isInteger(mapId) || mapId < 1 || mapId > 999) {
    return { status: 'error', code: 'invalidMap' }
  }

  try {
    const dataPath = join(rootPath, 'data')
    const [map, tilesetsDocument] = await Promise.all([
      readJsonObject(join(dataPath, `Map${String(mapId).padStart(3, '0')}.json`)),
      readFile(join(dataPath, 'Tilesets.json'), 'utf8').then(
        (text) => JSON.parse(text.replace(/^\uFEFF/, '')) as unknown
      )
    ])
    const width = numberValue(map.width)
    const height = numberValue(map.height)
    const tilesetId = numberValue(map.tilesetId)
    const cellCount = width * height
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      cellCount > 262_144 ||
      !Number.isInteger(tilesetId) ||
      tilesetId < 1
    ) {
      return { status: 'error', code: 'invalidMap', detail: 'Invalid map dimensions or tileset.' }
    }

    const tilesets = Array.isArray(tilesetsDocument) ? tilesetsDocument : []
    const tileset = objectValue(tilesets[tilesetId])
    if (!tileset) {
      return { status: 'error', code: 'invalidMap', detail: `Tileset ${tilesetId} is missing.` }
    }

    const rawData = Array.isArray(map.data) ? map.data : []
    const expectedLength = cellCount * 6
    const tileData = Array.from({ length: expectedLength }, (_, index) =>
      Math.max(0, Math.trunc(numberValue(rawData[index])))
    )
    const rawFlags = Array.isArray(tileset.flags) ? tileset.flags : []
    const tilesetFlags = rawFlags.map((flag) => Math.max(0, Math.trunc(numberValue(flag))))
    const rawNames = Array.isArray(tileset.tilesetNames) ? tileset.tilesetNames : []
    const imageNames = Array.from({ length: 9 }, (_, index) => safeAssetName(rawNames[index]))
    const missingImages: string[] = []
    const tilesetImages = await Promise.all(
      imageNames.map((name) => readPng(rootPath, 'tilesets', name, missingImages))
    )
    const parallaxName = safeAssetName(map.parallaxName)
    const parallaxImage = await readPng(rootPath, 'parallaxes', parallaxName, missingImages)

    const visual: MapVisualData = {
      width,
      height,
      tileWidth: 48,
      tileHeight: 48,
      tilesetId,
      tilesetName: stringValue(tileset.name),
      tileData,
      tilesetFlags,
      tilesetImages,
      parallaxImage,
      missingImages
    }
    return { status: 'loaded', map: visual }
  } catch (error) {
    return {
      status: 'error',
      code: 'unreadableMap',
      detail: error instanceof Error ? error.message : undefined
    }
  }
}
