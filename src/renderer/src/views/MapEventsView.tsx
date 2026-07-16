import { useState } from 'react'
import type {
  EventPageConditions,
  MapEvent,
  MapEventPage,
  ProjectChangeOperation,
  ProjectSnapshot
} from '../../../shared/contracts'
import { CommandEditor } from '../components/CommandEditor'
import { EventCommandList } from '../components/EventCommandList'
import type { Locale, MessageSet } from '../i18n'

interface MapEventsViewProps {
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
  onPreview: (operation: ProjectChangeOperation) => Promise<void>
}

function matchesSearch(id: number, name: string, search: string): boolean {
  const query = search.trim().toLowerCase()
  return !query || String(id).includes(query) || name.toLowerCase().includes(query)
}

export function MapEventsView({
  project,
  locale,
  text,
  onPreview
}: MapEventsViewProps): React.JSX.Element {
  const [mapId, setMapId] = useState(project.maps[0]?.id ?? 0)
  const [eventId, setEventId] = useState(0)
  const [pageId, setPageId] = useState(1)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'edit' | 'create' | 'addPage'>('view')
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
    setMode('view')
  }

  function selectEvent(nextEventId: number): void {
    setEventId(nextEventId)
    setPageId(1)
    setMode('view')
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
        <button
          type="button"
          className="secondary-button sidebar-action"
          disabled={!selectedMap}
          onClick={() => setMode('create')}
        >
          + {text.maps.newEvent}
        </button>
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
                className={selectedEvent?.id === event.id && mode !== 'create' ? 'active' : ''}
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
        {mode === 'create' && selectedMap ? (
          <MapEventForm
            key={`new-map-event-${selectedMap.id}`}
            mapId={selectedMap.id}
            project={project}
            locale={locale}
            text={text}
            onPreview={onPreview}
            onCancel={() => setMode('view')}
          />
        ) : !selectedEvent || !selectedPage ? (
          <p className="empty-state">{text.maps.empty}</p>
        ) : mode === 'edit' || mode === 'addPage' ? (
          <MapEventForm
            key={`${mode}-${selectedMap.id}-${selectedEvent.id}-${selectedPage.id}-${selectedEvent.name}`}
            mapId={selectedMap.id}
            project={project}
            locale={locale}
            text={text}
            event={selectedEvent}
            page={mode === 'edit' ? selectedPage : undefined}
            addingPage={mode === 'addPage'}
            onPreview={onPreview}
            onCancel={() => setMode('view')}
          />
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
              <div className="editor-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={selectedEvent.pages.length >= 20}
                  onClick={() => setMode('addPage')}
                >
                  {text.maps.addPage}
                </button>
                <button type="button" className="secondary-button" onClick={() => setMode('edit')}>
                  {text.maps.editEvent}
                </button>
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

interface MapEventFormProps {
  mapId: number
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
  event?: MapEvent
  page?: MapEventPage
  addingPage?: boolean
  onPreview: (operation: ProjectChangeOperation) => Promise<void>
  onCancel: () => void
}

function MapEventForm({
  mapId,
  project,
  locale,
  text,
  event,
  page,
  addingPage = false,
  onPreview,
  onCancel
}: MapEventFormProps): React.JSX.Element {
  const [name, setName] = useState(event?.name ?? '')
  const [note, setNote] = useState(event?.note ?? '')
  const [x, setX] = useState(event?.x ?? 0)
  const [y, setY] = useState(event?.y ?? 0)
  const [trigger, setTrigger] = useState(page?.trigger ?? 0)
  const [priority, setPriority] = useState(page?.priority ?? 1)
  const [moveType, setMoveType] = useState(page?.moveType ?? 0)
  const [imageName, setImageName] = useState(page?.imageName ?? '')
  const [switchOne, setSwitchOne] = useState(page?.conditions.switchIds[0] ?? 0)
  const [switchTwo, setSwitchTwo] = useState(page?.conditions.switchIds[1] ?? 0)
  const [variableId, setVariableId] = useState(page?.conditions.variable?.id ?? 0)
  const [variableMinimum, setVariableMinimum] = useState(page?.conditions.variable?.minimum ?? 0)
  const [selfSwitch, setSelfSwitch] = useState(page?.conditions.selfSwitch ?? '')
  const [itemId, setItemId] = useState(page?.conditions.itemId ?? 0)
  const [actorId, setActorId] = useState(page?.conditions.actorId ?? 0)
  const [commands, setCommands] = useState(page?.commands ?? [])

  async function submit(eventData: React.FormEvent): Promise<void> {
    eventData.preventDefault()
    const switchIds = [switchOne, switchTwo].filter((id) => id > 0)
    await onPreview({
      kind: 'saveMapEvent',
      event: {
        mapId,
        id: event?.id,
        name,
        note,
        x,
        y,
        page: {
          id: page?.id,
          conditions: {
            switchIds,
            ...(variableId > 0 ? { variable: { id: variableId, minimum: variableMinimum } } : {}),
            ...(selfSwitch ? { selfSwitch } : {}),
            ...(itemId > 0 ? { itemId } : {}),
            ...(actorId > 0 ? { actorId } : {})
          },
          trigger,
          priority,
          imageName,
          moveType,
          commands
        }
      }
    })
  }

  return (
    <form className="event-editor" onSubmit={(eventData) => void submit(eventData)}>
      <header className="record-header">
        <div>
          <p className="record-kicker">
            {!event ? text.maps.newEvent : addingPage ? text.maps.addPage : text.maps.editEvent}
          </p>
          <h1>{name || text.unnamed}</h1>
        </div>
        <div className="editor-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {text.editor.cancel}
          </button>
          <button type="submit" className="primary-button compact-button">
            {text.editor.preview}
          </button>
        </div>
      </header>

      <section className="detail-section editor-grid">
        <label>
          <span>{text.editor.name}</span>
          <input value={name} maxLength={200} onChange={(change) => setName(change.target.value)} />
        </label>
        <label>
          <span>{text.editor.x}</span>
          <input
            type="number"
            min="0"
            value={x}
            onChange={(change) => setX(Number(change.target.value))}
          />
        </label>
        <label>
          <span>{text.editor.y}</span>
          <input
            type="number"
            min="0"
            value={y}
            onChange={(change) => setY(Number(change.target.value))}
          />
        </label>
        <label className="wide-field">
          <span>{text.editor.note}</span>
          <textarea
            value={note}
            maxLength={5000}
            onChange={(change) => setNote(change.target.value)}
          />
        </label>
      </section>

      <section className="detail-section editor-grid">
        <label>
          <span>{text.maps.trigger}</span>
          <select value={trigger} onChange={(change) => setTrigger(Number(change.target.value))}>
            {text.maps.triggers.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{text.maps.priority}</span>
          <select value={priority} onChange={(change) => setPriority(Number(change.target.value))}>
            {text.maps.priorities.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{text.maps.movement}</span>
          <select value={moveType} onChange={(change) => setMoveType(Number(change.target.value))}>
            {text.maps.movements.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{text.maps.image}</span>
          <input
            value={imageName}
            maxLength={200}
            onChange={(change) => setImageName(change.target.value)}
          />
        </label>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <h3>{text.maps.conditions}</h3>
        </div>
        <div className="editor-grid">
          <ConditionSelect
            label={text.editor.switchOne}
            value={switchOne}
            entries={project.switches}
            none={text.maps.none}
            unnamed={text.unnamed}
            onChange={setSwitchOne}
          />
          <ConditionSelect
            label={text.editor.switchTwo}
            value={switchTwo}
            entries={project.switches}
            none={text.maps.none}
            unnamed={text.unnamed}
            onChange={setSwitchTwo}
          />
          <ConditionSelect
            label={text.maps.conditionVariable}
            value={variableId}
            entries={project.variables}
            none={text.maps.none}
            unnamed={text.unnamed}
            onChange={setVariableId}
          />
          {variableId > 0 && (
            <label>
              <span>{text.editor.minimum}</span>
              <input
                type="number"
                value={variableMinimum}
                onChange={(change) => setVariableMinimum(Number(change.target.value))}
              />
            </label>
          )}
          <label>
            <span>{text.editor.selfSwitch}</span>
            <select value={selfSwitch} onChange={(change) => setSelfSwitch(change.target.value)}>
              <option value="">{text.maps.none}</option>
              {['A', 'B', 'C', 'D'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <ConditionSelect
            label={text.maps.conditionItem}
            value={itemId}
            entries={project.database.items}
            none={text.maps.none}
            unnamed={text.unnamed}
            onChange={setItemId}
          />
          <label>
            <span>{text.editor.actorId}</span>
            <input
              type="number"
              min="0"
              value={actorId}
              onChange={(change) => setActorId(Number(change.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <h3>{text.commands}</h3>
          <span>{commands.length}</span>
        </div>
        <CommandEditor
          commands={commands}
          project={project}
          locale={locale}
          text={text}
          onChange={setCommands}
        />
      </section>
    </form>
  )
}

interface ConditionSelectProps {
  label: string
  value: number
  entries: Array<{ id: number; name: string }>
  none: string
  unnamed: string
  onChange: (value: number) => void
}

function ConditionSelect({
  label,
  value,
  entries,
  none,
  unnamed,
  onChange
}: ConditionSelectProps): React.JSX.Element {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
        <option value="0">{none}</option>
        {entries.map((entry) => (
          <option key={entry.id} value={entry.id}>
            #{entry.id} {entry.name || unnamed}
          </option>
        ))}
      </select>
    </label>
  )
}
