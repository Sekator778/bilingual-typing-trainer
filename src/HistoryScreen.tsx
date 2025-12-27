import { useRef, useState } from 'react'
import './HistoryScreen.css'
import { loadSessions } from './domain/sessionStore'
import { formatPackLabel } from './domain/packRegistry'
import { formatPresetLabel } from './domain/presets'
import { TRAINING_MODE_LABELS } from './domain/trainingMode'
import type { ExportSnapshot } from './domain/exportSnapshot'
import { buildExportSnapshot } from './domain/exportSnapshot'
import { applyImportSnapshot, validateImportSnapshot } from './domain/importSnapshot'

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
  const [{ sessions, available }, setSessionsState] = useState(() => loadSessions())
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [pendingImport, setPendingImport] = useState<ExportSnapshot | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const snapshot = buildExportSnapshot()
    const json = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    try {
      const link = document.createElement('a')
      link.href = url
      link.download = 'typing-trainer-export.json'
      link.click()
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const handleImportClick = () => {
    setImportError('')
    setImportSuccess('')
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('')
    setImportSuccess('')
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    event.target.value = ''
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const result = validateImportSnapshot(parsed)
      if (!result.ok) {
        setImportError(result.error)
        return
      }
      setPendingImport(result.snapshot)
    } catch {
      setImportError('Invalid JSON file.')
    }
  }

  const handleConfirmImport = () => {
    if (!pendingImport) {
      return
    }
    applyImportSnapshot(pendingImport)
    setPendingImport(null)
    setImportSuccess('Import completed.')
    setSessionsState(loadSessions())
  }

  const handleCancelImport = () => {
    setPendingImport(null)
  }

  return (
    <div className="history">
      <header className="history__header">
        <div>
          <p className="history__eyebrow">History</p>
          <h1 className="history__title">Session history</h1>
        </div>
        <div className="history__actions">
          <button type="button" className="ghost-button" onClick={handleExport}>
            Export progress
          </button>
          <button type="button" className="ghost-button" onClick={handleImportClick}>
            Import progress
          </button>
          <button type="button" className="ghost-button" onClick={onBack}>
            Back
          </button>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="history__file-input"
      />

      {pendingImport && (
        <div className="history__import-warning" role="status">
          <p>
            Import will overwrite your current progress. Continue?
          </p>
          <div className="history__actions">
            <button type="button" className="ghost-button" onClick={handleConfirmImport}>
              Confirm import
            </button>
            <button type="button" className="ghost-button" onClick={handleCancelImport}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {importError && <p className="history__notice">{importError}</p>}
      {importSuccess && <p className="history__success">{importSuccess}</p>}

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
