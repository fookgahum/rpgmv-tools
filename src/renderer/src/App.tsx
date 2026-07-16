import { useEffect, useState } from 'react'
import type { ProjectSnapshot } from '../../shared/contracts'
import { LANGUAGE_STORAGE_KEY, getInitialLocale, messages, type Locale } from './i18n'
import { CommonEventsView } from './views/CommonEventsView'
import { DatabaseView, NamedDataView } from './views/DataViews'
import { MapEventsView } from './views/MapEventsView'
import { OverviewView } from './views/OverviewView'

type View = 'overview' | 'maps' | 'commonEvents' | 'switches' | 'variables' | 'database'
type ErrorCode = keyof (typeof messages)['en']['errors']

function App(): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>(() =>
    getInitialLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY), navigator.language)
  )
  const [project, setProject] = useState<ProjectSnapshot | null>(null)
  const [activeView, setActiveView] = useState<View>('overview')
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [errorDetail, setErrorDetail] = useState('')
  const text = messages[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
  }, [locale])

  async function selectProject(): Promise<void> {
    setLoading(true)
    setErrorCode(null)
    setErrorDetail('')

    try {
      const result = await window.rpgmv.selectProject()
      if (result.status === 'loaded') {
        setProject(result.project)
        setActiveView('overview')
      } else if (result.status === 'error') {
        setErrorCode(result.code)
        setErrorDetail(result.detail ?? '')
      }
    } catch {
      setErrorCode('unexpected')
    } finally {
      setLoading(false)
    }
  }

  const views: Array<{ id: View; label: string; marker: string }> = [
    { id: 'overview', label: text.nav.overview, marker: '⌂' },
    { id: 'maps', label: text.nav.maps, marker: 'M' },
    { id: 'commonEvents', label: text.nav.commonEvents, marker: 'C' },
    { id: 'switches', label: text.nav.switches, marker: 'S' },
    { id: 'variables', label: text.nav.variables, marker: 'V' },
    { id: 'database', label: text.nav.database, marker: 'D' }
  ]

  function currentView(): React.JSX.Element | null {
    if (!project) return null

    switch (activeView) {
      case 'overview':
        return <OverviewView project={project} text={text} />
      case 'maps':
        return <MapEventsView project={project} locale={locale} text={text} />
      case 'commonEvents':
        return <CommonEventsView project={project} locale={locale} text={text} />
      case 'switches':
        return <NamedDataView project={project} kind="switch" text={text} />
      case 'variables':
        return <NamedDataView project={project} kind="variable" text={text} />
      case 'database':
        return <DatabaseView project={project} text={text} />
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <div>
            <strong>RPGMV Event Copilot</strong>
            {project && <small title={project.rootPath}>{project.title}</small>}
          </div>
        </div>

        <div className="header-actions">
          {project && <span className="mode-badge">{text.readOnly}</span>}
          {project && (
            <button className="secondary-button" onClick={selectProject} disabled={loading}>
              {text.changeProject}
            </button>
          )}
          <label className="language-picker">
            <span>{text.language}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              aria-label={text.language}
            >
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </header>

      {!project ? (
        <main className="welcome-panel">
          <p className="eyebrow">{text.welcome.eyebrow}</p>
          <h1>{text.welcome.title}</h1>
          <p className="welcome-description">{text.welcome.description}</p>
          <button className="primary-button" onClick={selectProject} disabled={loading}>
            {loading ? text.loading : text.welcome.select}
          </button>
          <p className="safety-note">
            <span>✓</span>
            {text.welcome.safety}
          </p>
          {errorCode && (
            <div className="error-banner" role="alert">
              <strong>{text.errors[errorCode]}</strong>
              {errorDetail && <span>{errorDetail}</span>}
            </div>
          )}
        </main>
      ) : (
        <div className="workspace">
          <nav className="main-nav">
            {views.map((view) => (
              <button
                key={view.id}
                className={activeView === view.id ? 'active' : ''}
                onClick={() => setActiveView(view.id)}
              >
                <span>{view.marker}</span>
                {view.label}
              </button>
            ))}
            <div className="nav-footer">
              <span>{text.projectPath}</span>
              <p title={project.rootPath}>{project.rootPath}</p>
            </div>
          </nav>
          <main className="workspace-content">{currentView()}</main>
        </div>
      )}
    </div>
  )
}

export default App
