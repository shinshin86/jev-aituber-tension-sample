import type { JevDecision } from '../lib/jev'
import { pickVerdict, type Verdict } from '../lib/tension'

type JevDecisionPanelProps = {
  decision: JevDecision | null
}

const ROWS: Array<{ verdict: Verdict; label: string; symbol: string }> = [
  { verdict: 'up', label: 'UP', symbol: '↑' },
  { verdict: 'same', label: 'SAME', symbol: '−' },
  { verdict: 'down', label: 'DOWN', symbol: '↓' },
]

const WAITING_DECISION: JevDecision = { up: 0.33, same: 0.34, down: 0.33 }

export function JevDecisionPanel({ decision }: JevDecisionPanelProps) {
  const displayed = decision ?? WAITING_DECISION
  const winner = decision ? pickVerdict(decision) : null

  return (
    <section className={`decision-panel${decision ? '' : ' decision-panel--waiting'}`}>
      <div className="section-heading">
        <h2>JEV DECISION</h2>
      </div>

      <div className="decision-rows">
        {ROWS.map(({ verdict, label, symbol }) => {
          const percent = Math.round(displayed[verdict] * 100)
          const active = winner === verdict
          return (
            <div className={`decision-row decision-row--${verdict}${active ? ' is-active' : ''}`} key={verdict}>
              <span className="winner-marker" aria-hidden="true">
                {active ? '›' : ''}
              </span>
              <span className="decision-label">
                <span aria-hidden="true">{symbol}</span> {label}
              </span>
              <div className="probability-track" aria-hidden="true">
                <div className="probability-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="probability-value">{percent}%</span>
            </div>
          )
        })}
      </div>

      {!decision && <p className="waiting-note">// waiting for first comment</p>}
    </section>
  )
}
