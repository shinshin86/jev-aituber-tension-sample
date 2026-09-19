import type { Settings } from '../lib/jev'
import { MODEL_OPTIONS } from '../lib/settings'

type SettingsPanelProps = {
  open: boolean
  draft: Settings
  saved: boolean
  saveFailed: boolean
  onToggle: () => void
  onChange: (settings: Settings) => void
  onSave: () => void
}

export function SettingsPanel({
  open,
  draft,
  saved,
  saveFailed,
  onToggle,
  onChange,
  onSave,
}: SettingsPanelProps) {
  return (
    <section className="settings">
      <button
        className="settings-toggle"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="settings-content"
      >
        <span>SETTINGS</span>
        <span className={saved ? 'key-state key-state--set' : 'key-state'}>
          {saved ? '● KEY SET' : '○ KEY NOT SET'}
        </span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div id="settings-content" className="settings-content">
          <label htmlFor="api-key">
            OpenRouter API Key
            <input
              id="api-key"
              type="password"
              autoComplete="off"
              value={draft.apiKey}
              onChange={(event) => onChange({ ...draft, apiKey: event.target.value })}
              placeholder="API key"
            />
          </label>
          <label htmlFor="model-id">
            Model ID
            <select
              id="model-id"
              value={draft.modelId}
              onChange={(event) => onChange({ ...draft, modelId: event.target.value })}
            >
              {MODEL_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-actions">
            {saveFailed && <span className="save-error">保存できませんでした</span>}
            <button type="button" onClick={onSave}>SAVE</button>
          </div>
        </div>
      )}
    </section>
  )
}
