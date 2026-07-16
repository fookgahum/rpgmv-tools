import type { ProjectSnapshot, ReferenceTarget } from '../../../shared/contracts'
import type { MessageSet } from '../i18n'

interface ReferencePanelProps {
  project: ProjectSnapshot
  target: ReferenceTarget
  targetId: number
  text: MessageSet
}

export function ReferencePanel({
  project,
  target,
  targetId,
  text
}: ReferencePanelProps): React.JSX.Element {
  const references = project.references.filter(
    (reference) => reference.target === target && reference.targetId === targetId
  )

  return (
    <section className="detail-section">
      <div className="section-heading">
        <h3>{text.references}</h3>
        <span>{references.length}</span>
      </div>

      {references.length === 0 ? (
        <p className="empty-state compact">{text.noReferences}</p>
      ) : (
        <ul className="reference-list">
          {references.map((reference, index) => {
            const source = reference.source
            const map = project.maps.find((entry) => entry.id === source.mapId)
            const mapEvent = map?.events.find((entry) => entry.id === source.eventId)
            const commonEvent = project.commonEvents.find(
              (entry) => entry.id === source.commonEventId
            )
            const location =
              source.kind === 'mapEvent'
                ? `${text.reference.mapEvent} · #${source.mapId} ${map?.name || ''} · #${source.eventId} ${mapEvent?.name || ''}`
                : `${text.reference.commonEvent} · #${source.commonEventId} ${commonEvent?.name || ''}`
            const suffix = [
              source.pageId ? `${text.reference.page} ${source.pageId}` : '',
              source.commandIndex !== undefined
                ? `${text.reference.command} ${source.commandIndex + 1}`
                : ''
            ]
              .filter(Boolean)
              .join(' · ')

            return (
              <li key={`${location}-${index}`}>
                <span className={`access-badge ${reference.access}`}>
                  {text.reference[reference.access]}
                </span>
                <div>
                  <strong>{location}</strong>
                  {suffix && <p>{suffix}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
