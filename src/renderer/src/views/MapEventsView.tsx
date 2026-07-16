import { useState } from 'react'
import type { EventPageConditions, ProjectSnapshot } from '../../../shared/contracts'
import { EventCommandList } from '../components/EventCommandList'
import type { Locale, MessageSet } from '../i18n'

interface MapEventsViewProps {
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
}

function matchesSearch(id: number, name: string, search: string): boolean {
  const query = search.trim().toLowerCase()
  return !query || String(id).includes(query) || name.toLowerCase().includes(query)
}

export function MapEventsView({ project, locale, text }: MapEventsViewProps): React.JSX.Element {
  const [mapId, setMapId] = useState(project.maps[0]?.id ?? 0)
  const [eventId, setEventId] = useState(0)
  const [pageId, setPageId] = useState(1)
  const [search, setSearch] = useState('')
  const selectedMap = project.maps.find((map) => map.id === mapId) ?? project.maps[0]
  const filteredEvents =
    selectedMap?.events.filter((event) => matchesSearch(event.id, event.name, search)) ?? []
  const selectedEvent =
    selectedMap?.events.find((event) => event.id === eventId) ?? filteredEvents[0]
  const selectedPage =
    selectedEvent?.pages.find((page) => page.id === pageId) ?? selectedEvent?.pages[0]

  function selectMap(nextMapId: number): void {
    setMapId(nextMapId)
    setEventId(0)
    setPageId(1)
    setSearch('')
  }

  function selectEvent(nextEventId: number): void {
    setEventId(nextEventId)
    setPageId(1)
  }

  function entryName(type: 'switch' | 'variable' | 'item', id: number): string {
    const entries =
      type === 'switch'
        ? project.switches
        : type === 'variable'
          ? project.variables
          : project.database.items
    return `#${String(id).padStart(4, '0')} ${entries.find((entry) => entry.id === id)?.name || text.unnamed}`
  }

  function conditionLabels(conditions: EventPageConditions): string[] {
    return [
      ...conditions.switchIds.map(
        (id) => `${text.maps.conditionSwitch}: ${entryName('switch', id)}`
      ),
      ...(conditions.variable
        ? [
            `${text.maps.conditionVariable}: ${entryName('variable', conditions.variable.id)} ≥ ${conditions.variable.minimum}`
          ]
        : []),
      ...(conditions.selfSwitch
        ? [`${text.maps.conditionSelfSwitch}: ${conditions.selfSwitch} = ON`]
        : []),
      ...(conditions.itemId
        ? [`${text.maps.conditionItem}: ${entryName('item', conditions.itemId)}`]
        : []),
      ...(conditions.actorId
        ? [`${text.maps.conditionActor}: #${String(conditions.actorId).padStart(4, '0')}`]
        : [])
    ]
  }

  const selectedConditions = selectedPage ? conditionLabels(selectedPage.conditions) : []

  return (
    <div className="browser-layout">
      <aside className="record-sidebar">
        <div className="sidebar-title">
          <h2>{text.maps.title}</h2>
          <span>{project.maps.length}</span>
        </div>
        <label className="field-label" htmlFor="map-select">
          {text.maps.map}
        </label>
        <select
          id="map-select"
          className="field-control"
          value={selectedMap?.id ?? ''}
          onChange={(event) => selectMap(Number(event.target.value))}
        >
          {project.maps.map((map) => (
            <option key={map.id} value={map.id}>
              #{String(map.id).padStart(3, '0')} {map.name || text.unnamed}
            </option>
          ))}
        </select>
        <input
          className="search-input"
          type="search"
          placeholder={text.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="record-count">
          {filteredEvents.length} {text.maps.events}
        </div>
        <ul className="record-list">
          {filteredEvents.map((event) => (
            <li key={event.id}>
              <button
                className={selectedEvent?.id === event.id ? 'active' : ''}
                onClick={() => selectEvent(event.id)}
              >
                <span>#{String(event.id).padStart(3, '0')}</span>
                <strong>{event.name || text.unnamed}</strong>
                <small>
                  ({event.x}, {event.y}) · {event.pages.length} {text.maps.pages}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="record-detail">
        {!selectedEvent || !selectedPage ? (
          <p className="empty-state">{text.maps.empty}</p>
        ) : (
          <>
            <header className="record-header">
              <div>
                <p className="record-kicker">
                  {text.maps.event} #{String(selectedEvent.id).padStart(3, '0')}
                </p>
                <h1>{selectedEvent.name || text.unnamed}</h1>
                <p>
                  {text.maps.coordinates}: {selectedEvent.x}, {selectedEvent.y}
                </p>
              </div>
            </header>

            <div className="page-tabs" aria-label={text.maps.pages}>
              {selectedEvent.pages.map((page) => (
                <button
                  key={page.id}
                  className={selectedPage.id === page.id ? 'active' : ''}
                  onClick={() => setPageId(page.id)}
                >
                  {text.maps.page.replace('{id}', String(page.id))}
                </button>
              ))}
            </div>

            <section className="detail-section">
              <div className="section-heading">
                <h3>{text.maps.conditions}</h3>
              </div>
              <div className="condition-list">
                {selectedConditions.length === 0 ? (
                  <span className="meta-chip muted">{text.maps.noConditions}</span>
                ) : (
                  selectedConditions.map((condition) => (
                    <span className="meta-chip" key={condition}>
                      {condition}
                    </span>
                  ))
                )}
              </div>
            </section>

            <section className="detail-section metadata-grid">
              <div>
                <span>{text.maps.trigger}</span>
                <strong>{text.maps.triggers[selectedPage.trigger] ?? selectedPage.trigger}</strong>
              </div>
              <div>
                <span>{text.maps.priority}</span>
                <strong>
                  {text.maps.priorities[selectedPage.priority] ?? selectedPage.priority}
                </strong>
              </div>
              <div>
                <span>{text.maps.movement}</span>
                <strong>
                  {text.maps.movements[selectedPage.moveType] ?? selectedPage.moveType}
                </strong>
              </div>
              <div>
                <span>{text.maps.image}</span>
                <strong>{selectedPage.imageName || text.maps.none}</strong>
              </div>
            </section>

            {selectedEvent.note && (
              <section className="detail-section">
                <div className="section-heading">
                  <h3>{text.maps.note}</h3>
                </div>
                <p className="body-copy">{selectedEvent.note}</p>
              </section>
            )}

            <EventCommandList
              commands={selectedPage.commands}
              project={project}
              locale={locale}
              text={text}
            />
          </>
        )}
      </main>
    </div>
  )
}
