import type { Verdict } from '../lib/tension'

export type HistoryEntry = {
  id: number
  comment: string
  verdict: Verdict
  probability: number
}

type HistoryProps = {
  entries: HistoryEntry[]
}

export function History({ entries }: HistoryProps) {
  return (
    <section className="history">
      <div className="section-heading">
        <span className="section-index">03</span>
        <h2>RECENT SIGNALS</h2>
        <span className="history-count">{entries.length}/5</span>
      </div>

      {entries.length === 0 ? (
        <p className="history-empty">No signals recorded.</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <span className="history-comment">“{entry.comment}”</span>
              <span className={`history-verdict history-verdict--${entry.verdict}`}>
                {entry.verdict.toUpperCase()} {Math.round(entry.probability * 100)}%
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
