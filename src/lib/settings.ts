import type { Settings } from './jev'

// localStorage への API キー保存は、このローカルデモ専用です。
const STORAGE_KEY = 'jev-tension-demo:settings'

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  modelId: 'typesafe/jev-1.13',
}

export const MODEL_OPTIONS = [
  { value: 'typesafe/jev-1.13', label: 'typesafe/jev-1.13 (default)' },
  { value: '~typesafe/jev-latest', label: '~typesafe/jev-latest' },
] as const

function validModelId(value: unknown): string {
  return typeof value === 'string' && MODEL_OPTIONS.some((option) => option.value === value)
    ? value
    : DEFAULT_SETTINGS.modelId
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SETTINGS }

    const candidate = parsed as Record<string, unknown>
    return {
      apiKey: typeof candidate.apiKey === 'string' ? candidate.apiKey : '',
      modelId: validModelId(candidate.modelId),
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}
