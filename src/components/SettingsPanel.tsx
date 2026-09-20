import { useEffect, useRef } from 'react'
import type { Settings } from '../lib/jev'
import { MODEL_OPTIONS } from '../lib/settings'

type SettingsPanelProps = {
  open: boolean
  settings: Settings
  saved: boolean
  saveSucceeded: boolean
  focusRequest: number
  saveFailed: boolean
  onToggle: () => void
  onChange: (settings: Settings) => void
}

export function SettingsPanel({
  open,
  settings,
  saved,
  saveSucceeded,
  focusRequest,
  saveFailed,
  onToggle,
  onChange,
}: SettingsPanelProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const apiKeyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return

    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    apiKeyInputRef.current?.focus({ preventScroll: true })
  }, [focusRequest, open])

  return (
    <section className="settings" ref={sectionRef}>
      <button
        className="settings-toggle"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="settings-content"
      >
        <span>⚙ SETTINGS</span>
        <span className="settings-toggle__status" aria-live="polite">
          {saveSucceeded ? (
            <span className="save-success">保存しました</span>
          ) : (
            <span className={saved ? 'settings-key-state settings-key-state--set' : 'settings-key-state'}>
              {saved ? 'KEY SET' : 'KEY NOT SET'}
            </span>
          )}
        </span>
        <span className="settings-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div id="settings-content" className="settings-content">
          <div className="settings-field">
            <label htmlFor="api-key">OpenRouter API Key</label>
            <input
              ref={apiKeyInputRef}
              id="api-key"
              type="password"
              autoComplete="off"
              defaultValue={settings.apiKey}
              onChange={(event) => onChange({ ...settings, apiKey: event.target.value })}
              placeholder="API key"
            />
            <p className="api-key-help">
              入力内容は自動で保存され、API キーはこのブラウザの localStorage にだけ保存されます。
            </p>
          </div>
          <label htmlFor="model-id">
            Model ID
            <select
              id="model-id"
              value={settings.modelId}
              onChange={(event) => onChange({ ...settings, modelId: event.target.value })}
            >
              {MODEL_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {saveFailed && <p className="save-error" role="alert">保存できませんでした</p>}
        </div>
      )}
    </section>
  )
}
