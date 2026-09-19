// ブラウザから API キーを直接送る方式はローカルデモ専用です。
// 公開 Web サービスでは利用者にキーが露出するため、サーバー側プロキシを使用してください。

export type JevDecision = { up: number; same: number; down: number }
export type Settings = { apiKey: string; modelId: string }

export type JevErrorKind =
  | 'missing_api_key'
  | 'empty_comment'
  | 'auth'
  | 'payment'
  | 'rate_limit'
  | 'api'
  | 'parse'
  | 'network'

export class JevError extends Error {
  kind: JevErrorKind
  status?: number

  constructor(kind: JevErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'JevError'
    this.kind = kind
    this.status = status
  }
}

const OPENROUTER = {
  url: 'https://openrouter.ai/api/alpha/decisions',
  title: 'jev-aituber-tension-sample',
} as const

const TENSION_QUESTION = {
  type: 'choice',
  instructions:
    "A live-streaming character just received this viewer comment. Judge how the comment affects the character's tension (mood/energy).",
  criteria: {
    up: 'The comment is praise, support, affection, excitement, or otherwise makes the character happier or more energetic.',
    same: "The comment is a neutral greeting, a plain question, or unrelated chatter that does not change the character's mood.",
    down: 'The comment is rejection, insult, boredom, a request to stop, or otherwise discourages the character.',
  },
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseProbability(
  probabilities: Record<string, unknown>,
  key: keyof JevDecision,
): number {
  const value = probabilities[key] ?? 0
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new JevError('parse', `Invalid probability: ${key}`)
  }
  return value
}

export function toJevDecision(raw: unknown): JevDecision {
  if (!isRecord(raw) || !isRecord(raw.answers)) {
    throw new JevError('parse', 'Jev response does not contain answers')
  }

  const answer = raw.answers.tension
  if (!isRecord(answer) || answer.type !== 'choice') {
    throw new JevError('parse', 'Jev response does not contain a choice answer')
  }

  if (answer.probabilities !== undefined) {
    if (!isRecord(answer.probabilities)) {
      throw new JevError('parse', 'Jev probabilities are invalid')
    }

    const decision = {
      up: parseProbability(answer.probabilities, 'up'),
      same: parseProbability(answer.probabilities, 'same'),
      down: parseProbability(answer.probabilities, 'down'),
    }
    const total = decision.up + decision.same + decision.down

    if (!Number.isFinite(total) || total <= 0) {
      throw new JevError('parse', 'Jev probabilities total must be positive')
    }

    return {
      up: decision.up / total,
      same: decision.same / total,
      down: decision.down / total,
    }
  }

  // API が確率を返さなかった場合のフォールバック
  if (answer.choice === 'up' || answer.choice === 'same' || answer.choice === 'down') {
    return {
      up: answer.choice === 'up' ? 1 : 0,
      same: answer.choice === 'same' ? 1 : 0,
      down: answer.choice === 'down' ? 1 : 0,
    }
  }

  throw new JevError('parse', 'Jev response does not contain a usable decision')
}

function errorKindForStatus(status: number): JevErrorKind {
  if (status === 401 || status === 403) return 'auth'
  if (status === 402) return 'payment'
  if (status === 429) return 'rate_limit'
  return 'api'
}

function errorMessageFromBody(body: string): string | undefined {
  if (!body) return undefined

  try {
    const parsed: unknown = JSON.parse(body)
    if (
      isRecord(parsed) &&
      isRecord(parsed.error) &&
      typeof parsed.error.message === 'string'
    ) {
      return parsed.error.message
    }
  } catch {
    return undefined
  }

  return undefined
}

function createOpenRouterRequest(
  comment: string,
  currentTension: number,
  settings: Settings,
  signal: AbortSignal,
): { url: string; init: RequestInit } {
  return {
    url: OPENROUTER.url,
    init: {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${settings.apiKey.trim()}`,
        'Content-Type': 'application/json',
        'X-Title': OPENROUTER.title,
      },
      body: JSON.stringify({
        model: settings.modelId.trim(),
        state: {
          current_tension: currentTension,
          viewer_comment: comment,
        },
        questions: { tension: TENSION_QUESTION },
      }),
    },
  }
}

export async function judgeTension(
  comment: string,
  currentTension: number,
  settings: Settings,
): Promise<JevDecision> {
  const trimmedComment = comment.trim()
  if (!trimmedComment) {
    throw new JevError('empty_comment', 'Comment is empty')
  }
  if (!settings.apiKey.trim()) {
    throw new JevError('missing_api_key', 'OpenRouter API Key is missing')
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15_000)

  try {
    const request = createOpenRouterRequest(
      trimmedComment,
      currentTension,
      settings,
      controller.signal,
    )
    const response = await fetch(request.url, request.init)

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      const detail = errorMessageFromBody(body)
      const message = detail
        ? `OpenRouter API error (${response.status}): ${detail}`
        : `OpenRouter API error (${response.status})`
      throw new JevError(errorKindForStatus(response.status), message, response.status)
    }

    let raw: unknown
    try {
      raw = await response.json()
    } catch {
      throw new JevError('parse', 'OpenRouter returned invalid JSON')
    }

    return toJevDecision(raw)
  } catch (error) {
    if (error instanceof JevError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new JevError('network', 'OpenRouter request timed out')
    }
    throw new JevError('network', 'Could not connect to OpenRouter')
  } finally {
    window.clearTimeout(timeout)
  }
}
