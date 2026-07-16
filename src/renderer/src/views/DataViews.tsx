import { useState } from 'react'
import type {
  DatabaseEntry,
  DatabaseKind,
  NamedEntry,
  ProjectChangeOperation,
  ProjectSnapshot
} from '../../../shared/contracts'
import { ReferencePanel } from '../components/ReferencePanel'
import type { MessageSet } from '../i18n'

interface NamedDataViewProps {
  project: ProjectSnapshot
  kind: 'switch' | 'variable'
  text: MessageSet
  onPreview: (operation: ProjectChangeOperation) => Promise<void>
}

function matches(entry: NamedEntry, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  return (
    !normalized ||
    String(entry.id).includes(normalized) ||
    entry.name.toLowerCase().includes(normalized)
  )
}

export function NamedDataView({
  project,
  kind,
  text,
  onPreview
}: NamedDataViewProps): React.JSX.Element {
  const entries = kind === 'switch' ? project.switches : project.variables
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? 0)
  const [search, setSearch] = useState('')
  const filteredEntries = entries.filter((entry) => matches(entry, search))
  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? filteredEntries[0]
  const title = kind === 'switch' ? text.data.switchesTitle : text.data.variablesTitle

  return (
    <div className="browser-layout">
      <aside className="record-sidebar">
        <div className="sidebar-title">
          <h2>{title}</h2>
          <span>{entries.length}</span>
        </div>
        <input
          className="search-input"
          type="search"
          placeholder={text.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <ul className="record-list dense">
          {filteredEntries.map((entry) => (
            <li key={entry.id}>
              <button
                className={selectedEntry?.id === entry.id ? 'active' : ''}
                onClick={() => setSelectedId(entry.id)}
              >
                <span>#{String(entry.id).padStart(4, '0')}</span>
                <strong>{entry.name || text.unnamed}</strong>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="record-detail">
        {!selectedEntry ? (
          <p className="empty-state">{text.noData}</p>
        ) : (
          <>
            <header className="record-header">
              <div>
                <p className="record-kicker">
                  {title} #{String(selectedEntry.id).padStart(4, '0')}
                </p>
                <h1>{selectedEntry.name || text.unnamed}</h1>
              </div>
            </header>
            <section className="detail-section metadata-grid two-columns">
              <div>
                <span>{text.data.id}</span>
                <strong>{selectedEntry.id}</strong>
              </div>
              <div>
                <span>{text.data.name}</span>
                <strong>{selectedEntry.name || text.unnamed}</strong>
              </div>
            </section>
            <NamedEntryEditor
              key={`${kind}-${selectedEntry.id}-${selectedEntry.name}`}
              entry={selectedEntry}
              kind={kind}
              text={text}
              onPreview={onPreview}
            />
            <ReferencePanel
              project={project}
              target={kind}
              targetId={selectedEntry.id}
              text={text}
            />
          </>
        )}
      </main>
    </div>
  )
}

interface NamedEntryEditorProps {
  entry: NamedEntry
  kind: 'switch' | 'variable'
  text: MessageSet
  onPreview: (operation: ProjectChangeOperation) => Promise<void>
}

function NamedEntryEditor({
  entry,
  kind,
  text,
  onPreview
}: NamedEntryEditorProps): React.JSX.Element {
  const [name, setName] = useState(entry.name)

  return (
    <section className="detail-section inline-editor">
      <label>
        <span>{text.editor.name}</span>
        <input value={name} maxLength={200} onChange={(event) => setName(event.target.value)} />
      </label>
      <button
        type="button"
        className="primary-button compact-button"
        disabled={name === entry.name}
        onClick={() =>
          void onPreview({
            kind: 'renameNamedEntry',
            target: kind,
            id: entry.id,
            name
          })
        }
      >
        {text.editor.preview}
      </button>
    </section>
  )
}

interface DatabaseViewProps {
  project: ProjectSnapshot
  text: MessageSet
}

export function DatabaseView({ project, text }: DatabaseViewProps): React.JSX.Element {
  const [kind, setKind] = useState<DatabaseKind>('item')
  const [selectedId, setSelectedId] = useState(0)
  const [search, setSearch] = useState('')
  const entries: DatabaseEntry[] =
    kind === 'item'
      ? project.database.items
      : kind === 'weapon'
        ? project.database.weapons
        : project.database.armors
  const filteredEntries = entries.filter((entry) => matches(entry, search))
  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? filteredEntries[0]
  const labels: Record<DatabaseKind, string> = {
    item: text.data.items,
    weapon: text.data.weapons,
    armor: text.data.armors
  }

  function selectKind(nextKind: DatabaseKind): void {
    setKind(nextKind)
    setSelectedId(0)
    setSearch('')
  }

  return (
    <div className="browser-layout">
      <aside className="record-sidebar">
        <div className="segment-control">
          {(Object.keys(labels) as DatabaseKind[]).map((entryKind) => (
            <button
              key={entryKind}
              className={kind === entryKind ? 'active' : ''}
              onClick={() => selectKind(entryKind)}
            >
              {labels[entryKind]}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          type="search"
          placeholder={text.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="record-count">
          {filteredEntries.length} {text.data.entries}
        </div>
        <ul className="record-list dense">
          {filteredEntries.map((entry) => (
            <li key={entry.id}>
              <button
                className={selectedEntry?.id === entry.id ? 'active' : ''}
                onClick={() => setSelectedId(entry.id)}
              >
                <span>#{String(entry.id).padStart(4, '0')}</span>
                <strong>{entry.name || text.unnamed}</strong>
                <small>{entry.price}</small>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="record-detail">
        {!selectedEntry ? (
          <p className="empty-state">{text.noData}</p>
        ) : (
          <>
            <header className="record-header">
              <div>
                <p className="record-kicker">
                  {labels[kind]} #{String(selectedEntry.id).padStart(4, '0')}
                </p>
                <h1>{selectedEntry.name || text.unnamed}</h1>
                {selectedEntry.description && <p>{selectedEntry.description}</p>}
              </div>
            </header>
            <section className="detail-section metadata-grid two-columns">
              <div>
                <span>{text.data.id}</span>
                <strong>{selectedEntry.id}</strong>
              </div>
              <div>
                <span>{text.data.price}</span>
                <strong>{selectedEntry.price}</strong>
              </div>
            </section>
            <ReferencePanel
              project={project}
              target={kind}
              targetId={selectedEntry.id}
              text={text}
            />
          </>
        )}
      </main>
    </div>
  )
}
