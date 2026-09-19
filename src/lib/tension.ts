import type { JevDecision } from './jev'

export const INITIAL_TENSION = 50
export const TENSION_STEP = 15

export type Verdict = 'up' | 'same' | 'down'

export function pickVerdict(decision: JevDecision): Verdict {
  const priority: Verdict[] = ['same', 'up', 'down']
  return priority.reduce((best, candidate) =>
    decision[candidate] > decision[best] ? candidate : best,
  )
}

export function applyVerdict(tension: number, verdict: Verdict): number {
  const change = verdict === 'up' ? TENSION_STEP : verdict === 'down' ? -TENSION_STEP : 0
  return Math.min(100, Math.max(0, tension + change))
}

export function faceFor(tension: number): string {
  if (tension >= 80) return '＼(^o^)／'
  if (tension >= 60) return '(｀・ω・´)'
  if (tension >= 40) return '(・ω・)'
  if (tension >= 20) return '(´・ω・`)'
  return '(；ω；)'
}
