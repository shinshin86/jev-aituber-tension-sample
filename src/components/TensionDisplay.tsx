import { faceFor } from '../lib/tension'

type TensionDisplayProps = {
  tension: number
  delta: number | null
}

function tensionColor(tension: number): string {
  if (tension >= 60) return 'var(--accent-up)'
  if (tension < 40) return 'var(--accent-down)'
  return 'var(--accent-neutral)'
}

export function TensionDisplay({ tension, delta }: TensionDisplayProps) {
  const deltaLabel = delta === null ? null : delta > 0 ? `+${delta}` : delta === 0 ? '±0' : `${delta}`

  return (
    <section className="tension-display" aria-label={`現在のテンション ${tension}`}>
      <div className="face" aria-hidden="true">
        {faceFor(tension)}
      </div>
      <div className="metric-heading">
        <span className="eyebrow">TENSION</span>
        <div className="metric-value" style={{ color: tensionColor(tension) }}>
          {tension.toString().padStart(3, '0')}
          <span className="metric-unit">/100</span>
          {deltaLabel && (
            <span className={`delta delta--${delta && delta > 0 ? 'up' : delta && delta < 0 ? 'down' : 'same'}`}>
              {deltaLabel}
            </span>
          )}
        </div>
      </div>
      <div className="tension-track" aria-hidden="true">
        <div
          className="tension-fill"
          style={{ width: `${tension}%`, backgroundColor: tensionColor(tension) }}
        />
      </div>
      <div className="scale" aria-hidden="true">
        <span>LOW</span>
        <span>NOMINAL</span>
        <span>HIGH</span>
      </div>
    </section>
  )
}
