import { useEffect, useState } from 'react'
import { LANGUAGE_STORAGE_KEY, getInitialLocale, messages, type Locale } from './i18n'

function App(): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>(() =>
    getInitialLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY), navigator.language)
  )
  const text = messages[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
  }, [locale])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>RPGMV Event Copilot</span>
        </div>

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
      </header>

      <main className="welcome-panel">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p className="description">{text.description}</p>

        <section className="status-card" aria-labelledby="status-title">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <h2 id="status-title">{text.readyTitle}</h2>
            <p>{text.readyDescription}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
