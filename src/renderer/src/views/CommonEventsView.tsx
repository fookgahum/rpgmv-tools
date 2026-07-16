import { useState } from 'react'
import type { ProjectSnapshot } from '../../../shared/contracts'
import { EventCommandList } from '../components/EventCommandList'
import { ReferencePanel } from '../components/ReferencePanel'
import type { Locale, MessageSet } from '../i18n'

interface CommonEventsViewProps {
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
}

export function CommonEventsView({
  project,
  locale,
  text
}: CommonEventsViewProps): React.JSX.Element {
  const [eventId, setEventId] = useState(project.commonEvents[0]?.id ?? 0)
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const filteredEvents = project.commonEvents.filter(
    (event) =>
      !query || String(event.id).includes(query) || event.name.toLowerCase().includes(query)
  )
  const selectedEvent =
    project.commonEvents.find((event) => event.id === eventId) ?? filteredEvents[0]
  const triggerSwitch = project.switches.find((entry) => entry.id === selectedEvent?.switchId)

  return (
    <div className="browser-layout">
      <aside className="record-sidebar">
        <div className="sidebar-title">
          <h2>{text.commonEvents.title}</h2>
          <span>{project.commonEvents.length}</span>
        </div>
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
                className={selectedEvent?.id === event.id ? 'active' : ''}
                onClick={() => setEventId(event.id)}
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
        {!selectedEvent ? (
          <p className="empty-state">{text.commonEvents.empty}</p>
        ) : (
          <>
            <header className="record-header">
              <div>
                <p className="record-kicker">
                  {text.commonEvents.title} #{String(selectedEvent.id).padStart(4, '0')}
                </p>
                <h1>{selectedEvent.name || text.unnamed}</h1>
              </div>
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
