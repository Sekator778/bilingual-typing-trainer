import './SummaryScreen.css'
import type { SessionRecordInput } from './domain/sessionStore'
import { formatPackLabel } from './domain/packRegistry'
import { formatPresetLabel } from './domain/presets'
import { TRAINING_MODE_LABELS } from './domain/trainingMode'

type SummaryScreenProps = {
  session: SessionRecordInput
  onStartAgain: () => void
  onShowHistory: () => void
}

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

const SummaryScreen = ({ session, onStartAgain, onShowHistory }: SummaryScreenProps) => {
  return (
    <div className="summary">
      <header className="summary__header">
        <div>
          <p className="summary__eyebrow">Summary</p>
          <h1 className="summary__title">Session complete</h1>
          <p className="summary__subhead">Nice work. Here is how it went.</p>
        </div>
      </header>

      <div className="summary__card">
        <div className="summary__stats">
          <div className="summary__stat">
            <span className="summary__label">WPM</span>
            <span className="summary__value">{session.wpm}</span>
          </div>
          <div className="summary__stat">
            <span className="summary__label">Accuracy</span>
            <span className="summary__value">
              {Math.round(session.accuracy * 100)}%
            </span>
          </div>
          <div className="summary__stat">
            <span className="summary__label">Words</span>
            <span className="summary__value">{session.wordsCompleted}</span>
          </div>
          <div className="summary__stat">
            <span className="summary__label">Duration</span>
            <span className="summary__value">{formatDuration(session.durationMs)}</span>
          </div>
        </div>

        <div className="summary__meta">
          {session.level && (
            <span>Level {formatPackLabel(session.level)}</span>
          )}
          {session.mode && <span>Mode {TRAINING_MODE_LABELS[session.mode]}</span>}
          <span>Preset {formatPresetLabel(session.preset)}</span>
        </div>

        <div className="summary__actions">
          <button type="button" className="primary-button" onClick={onStartAgain}>
            Start again
          </button>
          <button type="button" className="ghost-button" onClick={onShowHistory}>
            History
          </button>
        </div>
      </div>
    </div>
  )
}

export default SummaryScreen
