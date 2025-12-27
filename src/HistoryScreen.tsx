import { useState } from 'react'
import './HistoryScreen.css'
import { loadSessions } from './domain/sessionStore'
import { formatPackLabel } from './domain/packRegistry'
import { formatPresetLabel } from './domain/presets'
import { TRAINING_MODE_LABELS } from './domain/trainingMode'

type HistoryScreenProps = {
  onBack: () => void
}

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

const formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString()
const formatOutcome = (outcome: string) =>
  outcome === 'completed' ? 'Completed' : 'Interrupted'

const HistoryScreen = ({ onBack }: HistoryScreenProps) => {
  const [{ sessions, available }] = useState(() => loadSessions())

  return (
    <div className="history">
      <header className="history__header">
        <div>
          <p className="history__eyebrow">History</p>
          <h1 className="history__title">Session history</h1>
        </div>
        <button type="button" className="ghost-button" onClick={onBack}>
          Back
        </button>
      </header>

      {!available && (
        <p className="history__notice">History unavailable in this browser.</p>
      )}

      {sessions.length === 0 ? (
        <div className="history__empty" data-testid="history-empty">
          No sessions yet.
        </div>
      ) : (
        <ul className="history__list" data-testid="history-list">
          {sessions.map((session) => (
            <li key={session.id} className="history__item">
              <div className="history__item-main">
                <time
                  className="history__item-date"
                  dateTime={new Date(session.startedAt).toISOString()}
                >
                  {formatDateTime(session.startedAt)}
                </time>
                <div className="history__item-meta">
                  <span>WPM {session.wpm}</span>
                  <span>Accuracy {Math.round(session.accuracy * 100)}%</span>
                  <span>Words {session.wordsCompleted}</span>
                </div>
              </div>
              <div className="history__item-sub">
                <span>Duration {formatDuration(session.durationMs)}</span>
                <span>Typed {session.typedChars}</span>
                <span>Preset {formatPresetLabel(session.preset)}</span>
                <span>Outcome {formatOutcome(session.outcome)}</span>
                {session.level && <span>Level {formatPackLabel(session.level)}</span>}
                {session.mode && (
                  <span>Mode {TRAINING_MODE_LABELS[session.mode]}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryScreen
