import { useState } from 'react'
import type {
  CommonEvent,
  ProjectChangeOperation,
  ProjectSnapshot
} from '../../../shared/contracts'
import { CommandEditor } from '../components/CommandEditor'
import { EventCommandList } from '../components/EventCommandList'
import { ReferencePanel } from '../components/ReferencePanel'
import type { Locale, MessageSet } from '../i18n'

interface CommonEventsViewProps {
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
  onPreview: (operation: ProjectChangeOperation) => Promise<void>
}

export function CommonEventsView({
  project,
  locale,
  text,
  onPreview
}: CommonEventsViewProps): React.JSX.Element {
  const [eventId, setEventId] = useState(project.commonEvents[0]?.id ?? 0)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view')
  const query = search.trim().toLowerCase()
  const filteredEvents = project.commonEvents.filter(
    (event) =>
      !query || String(event.id).includes(query) || event.name.toLowerCase().includes(query)
  )
  const selectedEvent =
    project.commonEvents.find((event) => event.id === eventId) ?? filteredEvents[0]
  const triggerSwitch = project.switches.find((entry) => entry.id === selectedEvent?.switchId)

  function selectEvent(id: number): void {
    setEventId(id)
    setMode('view')
  }

  return (
    <div className="browser-layout">
      <aside className="record-sidebar">
        <div className="sidebar-title">
          <h2>{text.commonEvents.title}</h2>
          <span>{project.commonEvents.length}</span>
        </div>
        <button
          type="button"
          className="secondary-button sidebar-action"
          onClick={() => setMode('create')}
        >
          + {text.commonEvents.newEvent}
        </button>
        <input
          className="search-input"
          type="search"
          placeholder={text.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <ul className="record-list">
          {filteredEvents.map((event) => (
            <li key={event.id}>
              <button
                className={selectedEvent?.id === event.id && mode !== 'create' ? 'active' : ''}
                onClick={() => selectEvent(event.id)}
              >
                <span>#{String(event.id).padStart(4, '0')}</span>
                <strong>{event.name || text.unnamed}</strong>
                <small>{text.commonEvents.triggers[event.trigger] ?? event.trigger}</small>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="record-detail">
        {mode === 'create' ? (
          <CommonEventForm
            key="new-common-event"
            project={project}
            locale={locale}
            text={text}
            onPreview={onPreview}
            onCancel={() => setMode('view')}
          />
        ) : !selectedEvent ? (
          <p className="empty-state">{text.commonEvents.empty}</p>
        ) : mode === 'edit' ? (
          <CommonEventForm
            key={`${selectedEvent.id}-${selectedEvent.name}-${selectedEvent.commands.length}`}
            project={project}
            locale={locale}
            text={text}
            event={selectedEvent}
            onPreview={onPreview}
            onCancel={() => setMode('view')}
          />
        ) : (
          <>
            <header className="record-header">
              <div>
                <p className="record-kicker">
                  {text.commonEvents.title} #{String(selectedEvent.id).padStart(4, '0')}
                </p>
                <h1>{selectedEvent.name || text.unnamed}</h1>
              </div>
              <button type="button" className="secondary-button" onClick={() => setMode('edit')}>
                {text.commonEvents.editEvent}
              </button>
            </header>
            <section className="detail-section metadata-grid two-columns">
              <div>
                <span>{text.commonEvents.trigger}</span>
                <strong>
                  {text.commonEvents.triggers[selectedEvent.trigger] ?? selectedEvent.trigger}
                </strong>
              </div>
              <div>
                <span>{text.commonEvents.switch}</span>
                <strong>
                  {selectedEvent.trigger === 0
                    ? '—'
                    : `#${String(selectedEvent.switchId).padStart(4, '0')} ${triggerSwitch?.name || text.unnamed}`}
                </strong>
              </div>
            </section>
            <EventCommandList
              commands={selectedEvent.commands}
              project={project}
              locale={locale}
              text={text}
            />
            <ReferencePanel
              project={project}
              target="commonEvent"
              targetId={selectedEvent.id}
              text={text}
            />
          </>
        )}
      </main>
    </div>
  )
}

interface CommonEventFormProps {
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
  event?: CommonEvent
  onPreview: (operation: ProjectChangeOperation) => Promise<void>
  onCancel: () => void
}

function CommonEventForm({
  project,
  locale,
  text,
  event,
  onPreview,
  onCancel
}: CommonEventFormProps): React.JSX.Element {
  const [name, setName] = useState(event?.name ?? '')
  const [trigger, setTrigger] = useState(event?.trigger ?? 0)
  const [switchId, setSwitchId] = useState(event?.switchId ?? project.switches[0]?.id ?? 1)
  const [commands, setCommands] = useState(event?.commands ?? [])

  async function submit(eventData: React.FormEvent): Promise<void> {
    eventData.preventDefault()
    await onPreview({
      kind: 'saveCommonEvent',
      event: { id: event?.id, name, trigger, switchId, commands }
    })
  }

  return (
    <form className="event-editor" onSubmit={(eventData) => void submit(eventData)}>
      <header className="record-header">
        <div>
          <p className="record-kicker">
            {event ? text.commonEvents.editEvent : text.commonEvents.newEvent}
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
          <span>{text.commonEvents.trigger}</span>
          <select value={trigger} onChange={(change) => setTrigger(Number(change.target.value))}>
            {text.commonEvents.triggers.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {trigger !== 0 && (
          <label>
            <span>{text.commonEvents.switch}</span>
            <select
              value={switchId}
              onChange={(change) => setSwitchId(Number(change.target.value))}
            >
              {project.switches.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  #{entry.id} {entry.name || text.unnamed}
                </option>
              ))}
            </select>
          </label>
        )}
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
