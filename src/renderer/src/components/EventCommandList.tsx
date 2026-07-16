import type { EventCommand, ProjectSnapshot } from '../../../shared/contracts'
import { formatEventCommand } from '../event-commands'
import type { Locale, MessageSet } from '../i18n'

interface EventCommandListProps {
  commands: EventCommand[]
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
}

export function EventCommandList({
  commands,
  project,
  locale,
  text
}: EventCommandListProps): React.JSX.Element {
  return (
    <section className="detail-section">
      <div className="section-heading">
        <h3>{text.commands}</h3>
        <span>{commands.length}</span>
      </div>

      {commands.length === 0 ? (
        <p className="empty-state compact">{text.noData}</p>
      ) : (
        <ol className="command-list">
          {commands.map((command, index) => {
            const formatted = formatEventCommand(command, project, locale)
            return (
              <li
                key={`${index}-${command.code}`}
                className="command-row"
                style={{ '--command-indent': command.indent } as React.CSSProperties}
              >
                <span className="command-code">{command.code}</span>
                <div>
                  <strong>{formatted.name}</strong>
                  {formatted.detail && <p>{formatted.detail}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
