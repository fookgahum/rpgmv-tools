import type { ProjectSnapshot } from '../../../shared/contracts'
import type { MessageSet } from '../i18n'

interface OverviewViewProps {
  project: ProjectSnapshot
  text: MessageSet
}

export function OverviewView({ project, text }: OverviewViewProps): React.JSX.Element {
  const mapEventCount = project.maps.reduce((total, map) => total + map.events.length, 0)
  const commandCount =
    project.commonEvents.reduce((total, event) => total + event.commands.length, 0) +
    project.maps.reduce(
      (mapTotal, map) =>
        mapTotal +
        map.events.reduce(
          (eventTotal, event) =>
            eventTotal +
            event.pages.reduce((pageTotal, page) => pageTotal + page.commands.length, 0),
          0
        ),
      0
    )
  const databaseCount =
    project.database.items.length + project.database.weapons.length + project.database.armors.length
  const unnamedCount =
    project.switches.filter((entry) => !entry.name).length +
    project.variables.filter((entry) => !entry.name).length
  const cards = [
    [text.overview.maps, project.maps.length],
    [text.overview.mapEvents, mapEventCount],
    [text.overview.commonEvents, project.commonEvents.length],
    [text.overview.switches, project.switches.length],
    [text.overview.variables, project.variables.length],
    [text.overview.database, databaseCount],
    [text.overview.eventCommands, commandCount]
  ] as const

  return (
    <div className="view-stack">
      <div className="view-heading">
        <div>
          <p className="eyebrow">RPG Maker MV</p>
          <h1>{text.overview.title}</h1>
          <p>{text.overview.description}</p>
        </div>
      </div>

      <div className="metric-grid">
        {cards.map(([label, value]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="overview-grid">
        <section className="info-card">
          <h2>{text.overview.projectInfo}</h2>
          <dl className="info-list">
            <div>
              <dt>{text.overview.gameTitle}</dt>
              <dd>{project.title}</dd>
            </div>
            <div>
              <dt>{text.overview.versionId}</dt>
              <dd>{project.versionId || '—'}</dd>
            </div>
            <div>
              <dt>{text.overview.unnamedData}</dt>
              <dd>{unnamedCount}</dd>
            </div>
            <div>
              <dt>{text.projectPath}</dt>
              <dd className="path-value" title={project.rootPath}>
                {project.rootPath}
              </dd>
            </div>
          </dl>
        </section>

        <section className="info-card">
          <h2>{text.overview.scanResult}</h2>
          {project.warnings.length === 0 ? (
            <div className="health-message healthy">
              <span>✓</span>
              <p>{text.overview.healthy}</p>
            </div>
          ) : (
            <>
              <div className="health-message warning">
                <span>!</span>
                <p>{text.overview.warnings}</p>
              </div>
              <ul className="warning-list">
                {project.warnings.map((warning) => (
                  <li key={`${warning.code}-${warning.mapId}`}>
                    {warning.code === 'missingMapFile'
                      ? text.overview.missingMap
                      : text.overview.invalidMap}{' '}
                    · Map{String(warning.mapId).padStart(3, '0')}.json
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
