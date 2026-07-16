import { useEffect, useRef, useState } from 'react'
import type { ChangePreview, ProjectChangeOperation, ProjectSnapshot } from '../../shared/contracts'
import { LANGUAGE_STORAGE_KEY, getInitialLocale, messages, type Locale } from './i18n'
import { CommonEventsView } from './views/CommonEventsView'
import { DatabaseView, NamedDataView } from './views/DataViews'
import { MapEventsView } from './views/MapEventsView'
import { OverviewView } from './views/OverviewView'

type View = 'overview' | 'maps' | 'commonEvents' | 'switches' | 'variables' | 'database'
type ErrorCode = keyof (typeof messages)['en']['errors']
type Notice =
  | { kind: 'error'; code: ErrorCode; detail?: string }
  | { kind: 'success'; message: 'changeApplied' | 'changeUndone'; detail?: string }

function App(): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>(() =>
    getInitialLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY), navigator.language)
  )
  const [project, setProject] = useState<ProjectSnapshot | null>(null)
  const [projectRevision, setProjectRevision] = useState(0)
  const [activeView, setActiveView] = useState<View>('overview')
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [errorDetail, setErrorDetail] = useState('')
  const [preview, setPreview] = useState<ChangePreview | null>(null)
  const [mutationBusy, setMutationBusy] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const mutationLock = useRef(false)
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
        setProjectRevision((revision) => revision + 1)
        setActiveView('overview')
        setCanUndo(false)
        setPreview(null)
        setNotice(null)
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

  async function requestPreview(operation: ProjectChangeOperation): Promise<void> {
    if (mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    setNotice(null)
    try {
      const result = await window.rpgmv.previewProjectChange(operation)
      if (result.status === 'ready') {
        setPreview(result.preview)
        return
      }
      setNotice({ kind: 'error', code: result.code, detail: result.detail })
    } catch {
      setNotice({ kind: 'error', code: 'unexpected' })
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  async function applyPreview(): Promise<void> {
    if (!preview || mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    try {
      const result = await window.rpgmv.applyProjectChange(preview.id)
      if (result.status === 'applied') {
        setProject(result.project)
        setProjectRevision((revision) => revision + 1)
        setCanUndo(true)
        setPreview(null)
        setNotice({
          kind: 'success',
          message: 'changeApplied',
          detail: `${text.editor.backup}: ${result.backupPath}`
        })
      } else {
        setPreview(null)
        setNotice({ kind: 'error', code: result.code, detail: result.detail })
      }
    } catch {
      setNotice({ kind: 'error', code: 'unexpected' })
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
    }
  }

  async function undoChange(): Promise<void> {
    if (mutationLock.current) return
    mutationLock.current = true
    setMutationBusy(true)
    try {
      const result = await window.rpgmv.undoProjectChange()
      if (result.status === 'undone') {
        setProject(result.project)
        setProjectRevision((revision) => revision + 1)
        setCanUndo(false)
        setNotice({ kind: 'success', message: 'changeUndone' })
      } else if (result.status === 'empty') {
        setCanUndo(false)
      } else {
        setCanUndo(false)
        setNotice({ kind: 'error', code: result.code, detail: result.detail })
      }
    } catch {
      setNotice({ kind: 'error', code: 'unexpected' })
    } finally {
      mutationLock.current = false
      setMutationBusy(false)
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
        return (
          <MapEventsView
            key={projectRevision}
            project={project}
            locale={locale}
            text={text}
            onPreview={requestPreview}
          />
        )
      case 'commonEvents':
        return (
          <CommonEventsView
            key={projectRevision}
            project={project}
            locale={locale}
            text={text}
            onPreview={requestPreview}
          />
        )
      case 'switches':
        return (
          <NamedDataView
            key={projectRevision}
            project={project}
            kind="switch"
            text={text}
            onPreview={requestPreview}
          />
        )
      case 'variables':
        return (
          <NamedDataView
            key={projectRevision}
            project={project}
            kind="variable"
            text={text}
            onPreview={requestPreview}
          />
        )
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
          {project && <span className="mode-badge">{text.safeWrite}</span>}
          {project && (
            <button
              className="secondary-button"
              onClick={() => void undoChange()}
              disabled={!canUndo || mutationBusy}
            >
              {text.editor.undo}
            </button>
          )}
          {project && (
            <button
              className="secondary-button"
              onClick={selectProject}
              disabled={loading || mutationBusy}
            >
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
        <>
          {notice && (
            <div className={`workspace-notice ${notice.kind}`} role="status">
              <strong>
                {notice.kind === 'error' ? text.errors[notice.code] : text.editor[notice.message]}
              </strong>
              {notice.detail && <span>{notice.detail}</span>}
              <button type="button" onClick={() => setNotice(null)}>
                ×
              </button>
            </div>
          )}
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
        </>
      )}

      {preview && (
        <div className="modal-backdrop" role="presentation">
          <section className="diff-dialog" role="dialog" aria-modal="true">
            <header>
              <div>
                <p className="record-kicker">{preview.fileName}</p>
                <h2>{text.editor.previewTitle}</h2>
                <p>{text.editor.previewDescription}</p>
              </div>
              <button type="button" disabled={mutationBusy} onClick={() => setPreview(null)}>
                ×
              </button>
            </header>
            <div className="diff-summary">{preview.summary}</div>
            <div className="diff-grid">
              <div>
                <strong>{text.editor.before}</strong>
                <pre>{preview.before}</pre>
              </div>
              <div>
                <strong>{text.editor.after}</strong>
                <pre>{preview.after}</pre>
              </div>
            </div>
            <footer>
              <button
                type="button"
                className="secondary-button"
                disabled={mutationBusy}
                onClick={() => setPreview(null)}
              >
                {text.editor.cancel}
              </button>
              <button
                type="button"
                className="primary-button compact-button"
                disabled={mutationBusy}
                onClick={() => void applyPreview()}
              >
                {mutationBusy ? text.editor.applying : text.editor.confirmWrite}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
