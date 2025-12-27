import { useMemo, useState } from 'react'
import './SetupScreen.css'
import type { Level } from './domain/levels'
import { getSelectedLevel, setSelectedLevel } from './domain/levelSettings'
import { parsePack } from './domain/packLoader'
import { formatPackLabel, getPackNames, getPackRaw } from './domain/packRegistry'
import type { TrainingMode } from './domain/trainingMode'
import { TRAINING_MODE_LABELS, TRAINING_MODES } from './domain/trainingMode'
import { getMistakesForWords } from './domain/mistakesStore'
import { getTrainingMode, setTrainingMode } from './domain/modeSettings'
import type { Preset, PresetId } from './domain/presets'
import { getPresetById, getPresetId, PRESET_OPTIONS } from './domain/presets'
import { getPreset, setPreset } from './domain/presetSettings'

type SetupScreenProps = {
  onStart: (level: Level, mode: TrainingMode, preset: Preset) => void
  onShowHistory: () => void
}

const SetupScreen = ({ onStart, onShowHistory }: SetupScreenProps) => {
  const [level, setLevel] = useState<Level>(() => getSelectedLevel())
  const [mode, setMode] = useState<TrainingMode>(() => getTrainingMode())
  const [presetId, setPresetId] = useState<PresetId>(() => getPresetId(getPreset()))
  const [warning, setWarning] = useState('')
  const availableLevels = useMemo(() => getPackNames(), [])
  const resolvedLevel = availableLevels.includes(level)
    ? level
    : availableLevels[0] ?? level
  const packWords = useMemo(() => parsePack(getPackRaw(resolvedLevel)), [resolvedLevel])
  const mistakesForPack = useMemo(
    () => getMistakesForWords(packWords),
    [packWords],
  )
  const hasMistakes = mistakesForPack.length > 0
  const resolvedPresetId = PRESET_OPTIONS.some((option) => option.id === presetId)
    ? presetId
    : 'infinite'

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLevel = event.target.value as Level
    setLevel(nextLevel)
    setSelectedLevel(nextLevel)
    setWarning('')
  }

  const handleModeChange = (nextMode: TrainingMode) => {
    setMode(nextMode)
    setTrainingMode(nextMode)
    setWarning('')
  }

  const handlePresetChange = (nextPresetId: PresetId) => {
    setPresetId(nextPresetId)
    setWarning('')
  }

  const handleStart = () => {
    if (mode === 'mistakes' && !hasMistakes) {
      setWarning('No mistakes recorded yet. Start a normal session first.')
      return
    }
    setWarning('')
    setSelectedLevel(resolvedLevel)
    const preset = getPresetById(resolvedPresetId)
    setPreset(preset)
    setTrainingMode(mode)
    onStart(resolvedLevel, mode, preset)
  }

  return (
    <div className="setup">
      <header className="setup__header">
        <p className="setup__eyebrow">Setup</p>
        <h1 className="setup__title">Choose your level</h1>
        <p className="setup__subhead">
          Pick a word pack so your training stays focused and repeatable.
        </p>
      </header>

      <div className="setup__card">
        <label className="setup__label" htmlFor="level-select">
          Level
        </label>
        <select
          id="level-select"
          className="setup__select"
          value={resolvedLevel}
          onChange={handleLevelChange}
        >
          {availableLevels.map((option) => (
            <option key={option} value={option}>
              {formatPackLabel(option)}
            </option>
          ))}
        </select>
        <div className="setup__mode">
          <span className="setup__label">Mode</span>
          <div className="mode-toggle" role="group" aria-label="Training mode">
            {TRAINING_MODES.map((option) => (
              <button
                key={option}
                type="button"
                className={`mode-toggle__button ${mode === option ? 'is-active' : ''}`}
                onClick={() => handleModeChange(option)}
                aria-pressed={mode === option}
              >
                {TRAINING_MODE_LABELS[option]}
              </button>
            ))}
          </div>
        </div>
        <div className="setup__mode">
          <span className="setup__label">Session length</span>
          <div className="preset-toggle" role="group" aria-label="Session length">
            {PRESET_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`preset-toggle__button ${
                  resolvedPresetId === option.id ? 'is-active' : ''
                }`}
                onClick={() => handlePresetChange(option.id)}
                aria-pressed={resolvedPresetId === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {warning && (
          <p className="setup__warning" role="status">
            {warning}
          </p>
        )}
        <div className="setup__actions">
          <button type="button" className="primary-button" onClick={handleStart}>
            Start training
          </button>
          <button type="button" className="ghost-button" onClick={onShowHistory}>
            History
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupScreen
