import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { MapVisualData, ProjectMap } from '../../../shared/contracts'
import type { MessageSet } from '../i18n'
import { RPGMV_TILE_SIZE, tileSourcePieces } from '../rpgmv-tile-renderer'

interface Coordinate {
  x: number
  y: number
}

interface MapCanvasProps {
  map: ProjectMap
  selectedCoordinate: Coordinate | null
  selectedEventId?: number
  eventSelectionEnabled: boolean
  text: MessageSet
  onPickCoordinate: (coordinate: Coordinate) => void
  onSelectEvent: (eventId: number) => void
}

export interface MapCanvasHandle {
  focusCoordinate: (coordinate: { x: number; y: number }) => void
}

interface CanvasResources {
  visual: MapVisualData
  tilesetImages: Array<HTMLImageElement | null>
  parallaxImage: HTMLImageElement | null
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; detail?: string }
  | { status: 'loaded'; resources: CanvasResources }

interface PointerDrag {
  pointerId: number
  startX: number
  startY: number
  cameraX: number
  cameraY: number
  moved: boolean
}

const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2]

function loadImage(source: string | null): Promise<HTMLImageElement | null> {
  if (!source) return Promise.resolve(null)
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = source
  })
}

function clampCamera(
  camera: Coordinate,
  visual: MapVisualData,
  viewport: { width: number; height: number },
  zoom: number
): Coordinate {
  const mapWidth = visual.width * visual.tileWidth
  const mapHeight = visual.height * visual.tileHeight
  return {
    x: Math.min(Math.max(0, camera.x), Math.max(0, mapWidth - viewport.width / zoom)),
    y: Math.min(Math.max(0, camera.y), Math.max(0, mapHeight - viewport.height / zoom))
  }
}

function mapValue(visual: MapVisualData, x: number, y: number, layer: number): number {
  return visual.tileData[(layer * visual.height + y) * visual.width + x] ?? 0
}

function drawTile(
  context: CanvasRenderingContext2D,
  visual: MapVisualData,
  images: Array<HTMLImageElement | null>,
  tileId: number,
  destinationX: number,
  destinationY: number
): boolean {
  const pieces = tileSourcePieces(tileId, visual.tilesetFlags)
  if (pieces.length === 0) return true
  let complete = true
  for (const piece of pieces) {
    const image = images[piece.imageIndex]
    if (!image) {
      complete = false
      continue
    }
    context.drawImage(
      image,
      piece.sourceX,
      piece.sourceY,
      piece.sourceWidth,
      piece.sourceHeight,
      destinationX + piece.destinationX,
      destinationY + piece.destinationY,
      piece.destinationWidth,
      piece.destinationHeight
    )
  }
  return complete
}

function drawShadow(
  context: CanvasRenderingContext2D,
  shadowBits: number,
  destinationX: number,
  destinationY: number
): void {
  if ((shadowBits & 0x0f) === 0) return
  const half = RPGMV_TILE_SIZE / 2
  context.fillStyle = 'rgb(0 0 0 / 45%)'
  for (let index = 0; index < 4; index += 1) {
    if ((shadowBits & (1 << index)) !== 0) {
      context.fillRect(
        destinationX + (index % 2) * half,
        destinationY + Math.floor(index / 2) * half,
        half,
        half
      )
    }
  }
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  {
    map,
    selectedCoordinate,
    selectedEventId,
    eventSelectionEnabled,
    text,
    onPickCoordinate,
    onSelectEvent
  },
  ref
): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef<PointerDrag | null>(null)
  const initialCoordinateRef = useRef(selectedCoordinate)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [viewport, setViewport] = useState({ width: 1, height: 1 })
  const [camera, setCamera] = useState<Coordinate>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    let cancelled = false
    void window.rpgmv.loadMapVisual(map.id).then(async (result) => {
      if (cancelled) return
      if (result.status === 'error') {
        setLoadState({ status: 'error', detail: result.detail })
        return
      }
      const [tilesetImages, parallaxImage] = await Promise.all([
        Promise.all(result.map.tilesetImages.map(loadImage)),
        loadImage(result.map.parallaxImage)
      ])
      if (!cancelled) {
        setLoadState({
          status: 'loaded',
          resources: { visual: result.map, tilesetImages, parallaxImage }
        })
        const initialCoordinate = initialCoordinateRef.current
        const container = containerRef.current
        if (initialCoordinate && container) {
          const initialViewport = {
            width: Math.max(1, container.clientWidth),
            height: Math.max(1, container.clientHeight)
          }
          setCamera(
            clampCamera(
              {
                x:
                  initialCoordinate.x * result.map.tileWidth +
                  result.map.tileWidth / 2 -
                  initialViewport.width / 2,
                y:
                  initialCoordinate.y * result.map.tileHeight +
                  result.map.tileHeight / 2 -
                  initialViewport.height / 2
              },
              result.map,
              initialViewport,
              1
            )
          )
        }
      }
    })
    return () => {
      cancelled = true
    }
  }, [map.id])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setViewport({
          width: Math.max(1, Math.floor(entry.contentRect.width)),
          height: Math.max(1, Math.floor(entry.contentRect.height))
        })
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      focusCoordinate(coordinate): void {
        if (loadState.status !== 'loaded') return
        const visual = loadState.resources.visual
        setCamera(
          clampCamera(
            {
              x: coordinate.x * visual.tileWidth + visual.tileWidth / 2 - viewport.width / zoom / 2,
              y:
                coordinate.y * visual.tileHeight +
                visual.tileHeight / 2 -
                viewport.height / zoom / 2
            },
            visual,
            viewport,
            zoom
          )
        )
      }
    }),
    [loadState, viewport, zoom]
  )

  useEffect(() => {
    if (loadState.status !== 'loaded') return
    setCamera((current) => clampCamera(current, loadState.resources.visual, viewport, zoom))
  }, [loadState, viewport, zoom])

  useEffect(() => {
    if (loadState.status !== 'loaded') return
    const canvas = canvasRef.current
    if (!canvas) return
    const { visual, tilesetImages, parallaxImage } = loadState.resources
    const pixelRatio = window.devicePixelRatio || 1
    const canvasWidth = Math.max(1, Math.floor(viewport.width * pixelRatio))
    const canvasHeight = Math.max(1, Math.floor(viewport.height * pixelRatio))
    if (canvas.width !== canvasWidth) canvas.width = canvasWidth
    if (canvas.height !== canvasHeight) canvas.height = canvasHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.clearRect(0, 0, viewport.width, viewport.height)
    context.fillStyle = '#121a20'
    context.fillRect(0, 0, viewport.width, viewport.height)
    context.imageSmoothingEnabled = false
    context.setTransform(
      pixelRatio * zoom,
      0,
      0,
      pixelRatio * zoom,
      -camera.x * pixelRatio * zoom,
      -camera.y * pixelRatio * zoom
    )

    if (parallaxImage) {
      const pattern = context.createPattern(parallaxImage, 'repeat')
      if (pattern) {
        context.fillStyle = pattern
        context.fillRect(camera.x, camera.y, viewport.width / zoom, viewport.height / zoom)
      }
    }

    const firstX = Math.max(0, Math.floor(camera.x / visual.tileWidth))
    const firstY = Math.max(0, Math.floor(camera.y / visual.tileHeight))
    const lastX = Math.min(
      visual.width - 1,
      Math.ceil((camera.x + viewport.width / zoom) / visual.tileWidth)
    )
    const lastY = Math.min(
      visual.height - 1,
      Math.ceil((camera.y + viewport.height / zoom) / visual.tileHeight)
    )

    for (let y = firstY; y <= lastY; y += 1) {
      for (let x = firstX; x <= lastX; x += 1) {
        const destinationX = x * visual.tileWidth
        const destinationY = y * visual.tileHeight
        let missingTile = false
        for (let layer = 0; layer < 2; layer += 1) {
          const tileId = mapValue(visual, x, y, layer)
          if (!drawTile(context, visual, tilesetImages, tileId, destinationX, destinationY)) {
            missingTile = true
          }
        }
        drawShadow(context, mapValue(visual, x, y, 4), destinationX, destinationY)
        for (let layer = 2; layer < 4; layer += 1) {
          const tileId = mapValue(visual, x, y, layer)
          if (!drawTile(context, visual, tilesetImages, tileId, destinationX, destinationY)) {
            missingTile = true
          }
        }
        if (missingTile) {
          context.fillStyle = 'rgb(251 191 36 / 16%)'
          context.fillRect(destinationX, destinationY, visual.tileWidth, visual.tileHeight)
        }
      }
    }

    context.strokeStyle = 'rgb(255 255 255 / 9%)'
    context.lineWidth = 1 / zoom
    context.beginPath()
    for (let x = firstX; x <= lastX + 1; x += 1) {
      context.moveTo(x * visual.tileWidth, firstY * visual.tileHeight)
      context.lineTo(x * visual.tileWidth, (lastY + 1) * visual.tileHeight)
    }
    for (let y = firstY; y <= lastY + 1; y += 1) {
      context.moveTo(firstX * visual.tileWidth, y * visual.tileHeight)
      context.lineTo((lastX + 1) * visual.tileWidth, y * visual.tileHeight)
    }
    context.stroke()

    for (const event of map.events) {
      if (event.x < firstX || event.x > lastX || event.y < firstY || event.y > lastY) continue
      const eventX = event.x * visual.tileWidth
      const eventY = event.y * visual.tileHeight
      const selected = event.id === selectedEventId
      context.fillStyle = selected ? 'rgb(45 212 191 / 78%)' : 'rgb(15 23 42 / 78%)'
      context.strokeStyle = selected ? '#99f6e4' : '#fbbf24'
      context.lineWidth = selected ? 3 / zoom : 2 / zoom
      context.fillRect(eventX + 4, eventY + 4, visual.tileWidth - 8, visual.tileHeight - 8)
      context.strokeRect(eventX + 4, eventY + 4, visual.tileWidth - 8, visual.tileHeight - 8)
      context.fillStyle = selected ? '#042f2e' : '#fef3c7'
      context.font = 'bold 11px system-ui'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(
        `#${event.id}`,
        eventX + visual.tileWidth / 2,
        eventY + visual.tileHeight / 2
      )
    }

    if (selectedCoordinate) {
      context.strokeStyle = '#22d3ee'
      context.lineWidth = 3 / zoom
      context.strokeRect(
        selectedCoordinate.x * visual.tileWidth + 2,
        selectedCoordinate.y * visual.tileHeight + 2,
        visual.tileWidth - 4,
        visual.tileHeight - 4
      )
    }
  }, [camera, loadState, map.events, selectedCoordinate, selectedEventId, viewport, zoom])

  function updateZoom(nextZoom: number): void {
    if (loadState.status !== 'loaded') return
    const visual = loadState.resources.visual
    const mapCenter = {
      x: camera.x + viewport.width / zoom / 2,
      y: camera.y + viewport.height / zoom / 2
    }
    const nextCamera = clampCamera(
      {
        x: mapCenter.x - viewport.width / nextZoom / 2,
        y: mapCenter.y - viewport.height / nextZoom / 2
      },
      visual,
      viewport,
      nextZoom
    )
    setZoom(nextZoom)
    setCamera(nextCamera)
  }

  function moveCamera(nextCamera: Coordinate): void {
    if (loadState.status !== 'loaded') return
    setCamera(clampCamera(nextCamera, loadState.resources.visual, viewport, zoom))
  }

  function pickCoordinate(clientX: number, clientY: number): void {
    if (loadState.status !== 'loaded') return
    const canvas = canvasRef.current
    if (!canvas) return
    const bounds = canvas.getBoundingClientRect()
    const x = Math.floor((camera.x + (clientX - bounds.left) / zoom) / RPGMV_TILE_SIZE)
    const y = Math.floor((camera.y + (clientY - bounds.top) / zoom) / RPGMV_TILE_SIZE)
    const visual = loadState.resources.visual
    if (x < 0 || y < 0 || x >= visual.width || y >= visual.height) return
    const event = map.events.find((candidate) => candidate.x === x && candidate.y === y)
    onPickCoordinate({ x, y })
    if (event && eventSelectionEnabled) onSelectEvent(event.id)
  }

  function centerCoordinate(): void {
    if (loadState.status !== 'loaded' || !selectedCoordinate) return
    moveCamera({
      x: selectedCoordinate.x * RPGMV_TILE_SIZE + RPGMV_TILE_SIZE / 2 - viewport.width / zoom / 2,
      y: selectedCoordinate.y * RPGMV_TILE_SIZE + RPGMV_TILE_SIZE / 2 - viewport.height / zoom / 2
    })
  }

  function resetView(): void {
    setZoom(1)
    setCamera({ x: 0, y: 0 })
  }

  const zoomIndex = zoomLevels.indexOf(zoom)

  return (
    <section className="map-canvas-panel" aria-label={text.maps.canvas}>
      <header className="map-canvas-toolbar">
        <div>
          <strong>{text.maps.canvas}</strong>
          {loadState.status === 'loaded' && (
            <span>
              {loadState.resources.visual.width} × {loadState.resources.visual.height} · #
              {loadState.resources.visual.tilesetId} {loadState.resources.visual.tilesetName}
            </span>
          )}
          {selectedCoordinate && (
            <span>
              {text.maps.selectedCoordinate}: {selectedCoordinate.x}, {selectedCoordinate.y}
            </span>
          )}
        </div>
        <div className="map-canvas-actions">
          <button
            type="button"
            title={text.maps.zoomOut}
            disabled={zoomIndex <= 0}
            onClick={() => updateZoom(zoomLevels[Math.max(0, zoomIndex - 1)])}
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            title={text.maps.zoomIn}
            disabled={zoomIndex >= zoomLevels.length - 1}
            onClick={() => updateZoom(zoomLevels[Math.min(zoomLevels.length - 1, zoomIndex + 1)])}
          >
            +
          </button>
          <button type="button" title={text.maps.resetView} onClick={resetView}>
            ↺
          </button>
          <button type="button" disabled={!selectedCoordinate} onClick={centerCoordinate}>
            ◎
          </button>
        </div>
      </header>

      <div className="map-canvas-viewport" ref={containerRef}>
        {loadState.status === 'loading' && <p>{text.maps.loadingCanvas}</p>}
        {loadState.status === 'error' && (
          <div className="map-canvas-error">
            <strong>{text.maps.canvasError}</strong>
            {loadState.detail && <span>{loadState.detail}</span>}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={loadState.status === 'loaded' ? 'ready' : ''}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            pointerRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              cameraX: camera.x,
              cameraY: camera.y,
              moved: false
            }
          }}
          onPointerMove={(event) => {
            const pointer = pointerRef.current
            if (!pointer || pointer.pointerId !== event.pointerId) return
            const deltaX = event.clientX - pointer.startX
            const deltaY = event.clientY - pointer.startY
            if (Math.abs(deltaX) + Math.abs(deltaY) > 4) pointer.moved = true
            if (pointer.moved) {
              moveCamera({
                x: pointer.cameraX - deltaX / zoom,
                y: pointer.cameraY - deltaY / zoom
              })
            }
          }}
          onPointerUp={(event) => {
            const pointer = pointerRef.current
            pointerRef.current = null
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
            if (pointer && !pointer.moved) pickCoordinate(event.clientX, event.clientY)
          }}
          onPointerCancel={() => {
            pointerRef.current = null
          }}
          onWheel={(event) => {
            event.preventDefault()
            moveCamera({ x: camera.x + event.deltaX / zoom, y: camera.y + event.deltaY / zoom })
          }}
        />
      </div>

      <footer>
        <span>{text.maps.canvasHint}</span>
        {loadState.status === 'loaded' && loadState.resources.visual.missingImages.length > 0 && (
          <span
            className="missing-assets"
            title={loadState.resources.visual.missingImages.join('\n')}
          >
            {text.maps.missingAssets}: {loadState.resources.visual.missingImages.length}
          </span>
        )}
      </footer>
    </section>
  )
})
