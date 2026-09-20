import { useEffect, useRef } from 'react'
import type { Settings } from '../lib/jev'
import { PROVIDER_IDS, PROVIDERS, type ProviderId } from '../lib/providers'

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
  const provider = PROVIDERS[settings.provider]
  const providerSettings = settings[settings.provider]

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
          <label htmlFor="provider">
            Provider
            <select
              id="provider"
              value={settings.provider}
              onChange={(event) => onChange({
                ...settings,
                provider: event.target.value as ProviderId,
              })}
            >
              {PROVIDER_IDS.map((providerId) => (
                <option value={providerId} key={providerId}>
                  {PROVIDERS[providerId].label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="model-id">
            Model ID
            <select
              id="model-id"
              value={providerSettings.modelId}
              onChange={(event) => onChange({
                ...settings,
                [settings.provider]: {
                  ...providerSettings,
                  modelId: event.target.value,
                },
              })}
            >
              {provider.models.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-field">
            <label htmlFor="api-key">{provider.label} API Key</label>
            <input
              key={settings.provider}
              ref={apiKeyInputRef}
              id="api-key"
              type="password"
              autoComplete="off"
              defaultValue={providerSettings.apiKey}
              onChange={(event) => onChange({
                ...settings,
                [settings.provider]: {
                  ...providerSettings,
                  apiKey: event.target.value,
                },
              })}
              placeholder="API key"
            />
            <p className="api-key-help">
              入力内容は自動で保存され、API キーはこのブラウザの localStorage にだけ保存されます。
            </p>
          </div>
          {settings.provider === 'typesafe' && (
            <p className="provider-note">
              現時点ではブラウザから TypeSafe AI を直接呼び出せないため、開発サーバー(npm run dev)経由で接続します。
            </p>
          )}
          {saveFailed && <p className="save-error" role="alert">保存できませんでした</p>}
        </div>
      )}
    </section>
  )
}
