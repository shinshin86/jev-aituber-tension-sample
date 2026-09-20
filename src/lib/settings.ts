import type { Settings } from './jev'
import { isProviderId, PROVIDERS, type ProviderId } from './providers'

// localStorage への API キー保存は、このローカルデモ専用です。
const STORAGE_KEY = 'jev-tension-demo:settings'

export const DEFAULT_SETTINGS: Settings = {
  provider: 'typesafe',
  openrouter: { apiKey: '', modelId: PROVIDERS.openrouter.defaultModel },
  typesafe: { apiKey: '', modelId: PROVIDERS.typesafe.defaultModel },
}

function defaultSettings(): Settings {
  return {
    provider: DEFAULT_SETTINGS.provider,
    openrouter: { ...DEFAULT_SETTINGS.openrouter },
    typesafe: { ...DEFAULT_SETTINGS.typesafe },
  }
}

function validModelId(provider: ProviderId, value: unknown): string {
  return typeof value === 'string' && PROVIDERS[provider].models.some((option) => option.value === value)
    ? value
    : PROVIDERS[provider].defaultModel
}

function providerSettings(provider: ProviderId, value: unknown): Settings[ProviderId] {
  const candidate = typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {}
  return {
    apiKey: typeof candidate.apiKey === 'string' ? candidate.apiKey : '',
    modelId: validModelId(provider, candidate.modelId),
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings()

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultSettings()

    const candidate = parsed as Record<string, unknown>
    const legacy = 'apiKey' in candidate || 'modelId' in candidate
    const settings: Settings = {
      // 旧形式は OpenRouter のキーだけを持つので、移行時は OpenRouter を選んだままにする
      provider: isProviderId(candidate.provider)
        ? candidate.provider
        : legacy ? 'openrouter' : DEFAULT_SETTINGS.provider,
      openrouter: legacy
        ? providerSettings('openrouter', candidate)
        : providerSettings('openrouter', candidate.openrouter),
      typesafe: providerSettings('typesafe', candidate.typesafe),
    }
    if (legacy) saveSettings(settings)
    return settings
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(settings: Settings): boolean {
  try {
    const normalized: Settings = {
      provider: isProviderId(settings.provider) ? settings.provider : DEFAULT_SETTINGS.provider,
      openrouter: providerSettings('openrouter', settings.openrouter),
      typesafe: providerSettings('typesafe', settings.typesafe),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return true
  } catch {
    return false
  }
}
