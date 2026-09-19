import { useRef, useState } from 'react'
import { CommentInput } from './components/CommentInput'
import { History, type HistoryEntry } from './components/History'
import { JevDecisionPanel } from './components/JevDecisionPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { TensionDisplay } from './components/TensionDisplay'
import { JevError, judgeTension, type JevDecision, type Settings } from './lib/jev'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './lib/settings'
import { applyVerdict, INITIAL_TENSION, pickVerdict, TENSION_STEP } from './lib/tension'

type UiError = {
  summary: string
  detail?: string
}

function safeErrorDetail(message: string, apiKey: string): string {
  const singleLine = message.replace(/\s+/g, ' ').trim()
  const withoutBearer = singleLine.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
  return apiKey.trim()
    ? withoutBearer.replaceAll(apiKey.trim(), '[API key redacted]')
    : withoutBearer
}

function messageForError(error: unknown, apiKey: string): UiError {
  if (!(error instanceof JevError)) {
    return { summary: '予期しないエラーが発生しました。' }
  }

  const withDetail = (summary: string): UiError => ({
    summary,
    detail: safeErrorDetail(error.message, apiKey),
  })

  switch (error.kind) {
    case 'missing_api_key':
      return { summary: 'Settings で OpenRouter API Key を設定してください。' }
    case 'empty_comment':
      return { summary: 'コメントを入力してください。' }
    case 'auth':
      return withDetail('API キーが正しくありません。Settings を確認してください。')
    case 'payment':
      return withDetail('OpenRouter のクレジットが不足しています。')
    case 'rate_limit':
      return withDetail('Rate Limit に達しました。少し待ってから再実行してください。')
    case 'network':
      return { summary: 'OpenRouter に接続できませんでした。通信状態を確認してください。' }
    case 'parse':
      return { summary: 'Jev の応答を読み取れませんでした。' }
    case 'api':
      return withDetail(
        `OpenRouter API でエラーが発生しました${error.status ? ` (${error.status})` : ''}。`,
      )
  }
}

function App() {
  const [tension, setTension] = useState(INITIAL_TENSION)
  const [latestComment, setLatestComment] = useState<string | null>(null)
  const [decision, setDecision] = useState<JevDecision | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<UiError | null>(null)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [comment, setComment] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState<Settings>(settings)
  const [settingsSaveFailed, setSettingsSaveFailed] = useState(false)
  const [delta, setDelta] = useState<number | null>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (loading) return
    setDelta(null)
    if (!comment.trim()) {
      setError({ summary: 'コメントを入力してください。' })
      return
    }
    if (!settings.apiKey.trim()) {
      setError({ summary: 'Settings で OpenRouter API Key を設定してください。' })
      setSettingsOpen(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const trimmedComment = comment.trim()
      const nextDecision = await judgeTension(trimmedComment, tension, settings)
      const verdict = pickVerdict(nextDecision)
      const change = verdict === 'up' ? TENSION_STEP : verdict === 'down' ? -TENSION_STEP : 0

      setLatestComment(trimmedComment)
      setDecision(nextDecision)
      setTension((current) => applyVerdict(current, verdict))
      setDelta(change)
      setHistory((current) => [
        {
          id: Date.now(),
          comment: trimmedComment,
          verdict,
          probability: nextDecision[verdict],
        },
        ...current,
      ].slice(0, 5))
      setComment('')
    } catch (caught) {
      setError(messageForError(caught, settings.apiKey))
    } finally {
      setLoading(false)
      window.requestAnimationFrame(() => commentInputRef.current?.focus())
    }
  }

  const handleSaveSettings = () => {
    const nextSettings = {
      apiKey: settingsDraft.apiKey.trim(),
      modelId: settingsDraft.modelId || DEFAULT_SETTINGS.modelId,
    }
    const didSave = saveSettings(nextSettings)
    setSettingsSaveFailed(!didSave)
    if (didSave) {
      setSettings(nextSettings)
      setSettingsDraft(nextSettings)
      setError(null)
      setSettingsOpen(false)
    }
  }

  return (
    <main className="app-shell">
      <article className="console-card">
        <header className="app-header">
          <div>
            <p className="system-label">SYSTEM ONE // LIVE INFERENCE</p>
            <h1>AITUBER <span>TENSION MONITOR</span></h1>
          </div>
          <div
            className={`jev-badge ${
              !settings.apiKey.trim()
                ? 'jev-badge--unset'
                : loading
                  ? 'jev-badge--judging'
                  : 'jev-badge--ready'
            }`}
          >
            <span /> JEV {!settings.apiKey.trim() ? 'KEY NOT SET' : loading ? 'JUDGING' : 'READY'}
          </div>
        </header>

        <div className="latest-comment">
          <span>Latest comment</span>
          <strong>{latestComment ? `“${latestComment}”` : 'No comment yet'}</strong>
        </div>

        <div className="primary-grid">
          <div>
            <div className="section-heading section-heading--tension">
              <span className="section-index">01</span>
              <h2>CHARACTER STATE</h2>
            </div>
            <TensionDisplay tension={tension} delta={delta} />
          </div>
          <JevDecisionPanel decision={decision} />
        </div>

        {error && (
          <div className="error-message" role="alert">
            <div>! {error.summary}</div>
            {error.detail && <small>{error.detail}</small>}
          </div>
        )}

        <CommentInput
          value={comment}
          loading={loading}
          inputRef={commentInputRef}
          onChange={setComment}
          onSubmit={handleSend}
        />

        <SettingsPanel
          open={settingsOpen}
          draft={settingsDraft}
          saved={Boolean(settings.apiKey.trim())}
          saveFailed={settingsSaveFailed}
          onToggle={() => {
            setSettingsDraft(settings)
            setSettingsSaveFailed(false)
            setSettingsOpen((current) => !current)
          }}
          onChange={setSettingsDraft}
          onSave={handleSaveSettings}
        />

        <History entries={history} />

        <footer>
          <span>MODEL // {settings.modelId}</span>
          <span>ENDPOINT // OPENROUTER DECISIONS</span>
        </footer>
      </article>
    </main>
  )
}

export default App
