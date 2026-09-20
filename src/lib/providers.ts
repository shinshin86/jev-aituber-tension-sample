export type ProviderId = 'openrouter' | 'typesafe'

export type ProviderDef = {
  id: ProviderId
  label: string
  endpointLabel: string
  url: string
  models: readonly { value: string; label: string }[]
  defaultModel: string
  extraHeaders?: Record<string, string>
}

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  typesafe: {
    id: 'typesafe',
    label: 'TypeSafe AI',
    endpointLabel: 'TYPESAFE SYSTEM ONE',
    // As of 2026-09 the API rejects browser preflights ("Disallowed CORS origin"),
    // so Vite proxies this same-origin path. Switch to the direct URL if that changes.
    url: '/api/typesafe/v1/systemone',
    models: [
      { value: 'jev-latest', label: 'jev-latest (default)' },
      { value: 'jev-preview', label: 'jev-preview' },
      { value: 'jev-1.13.0', label: 'jev-1.13.0' },
    ],
    defaultModel: 'jev-latest',
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    endpointLabel: 'OPENROUTER DECISIONS',
    url: 'https://openrouter.ai/api/alpha/decisions',
    models: [
      { value: 'typesafe/jev-1.13', label: 'typesafe/jev-1.13 (default)' },
      { value: '~typesafe/jev-latest', label: '~typesafe/jev-latest' },
    ],
    defaultModel: 'typesafe/jev-1.13',
    extraHeaders: { 'X-Title': 'jev-aituber-tension-sample' },
  },
}

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[]

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && value in PROVIDERS
}
