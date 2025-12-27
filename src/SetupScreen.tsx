import { useEffect, useMemo, useState } from 'react'
import './SetupScreen.css'
import type { Level } from './domain/levels'
import { getSelectedLevel, setSelectedLevel } from './domain/levelSettings'
import { formatPackLabel, getPackNames } from './domain/packRegistry'

type SetupScreenProps = {
  onStart: (level: Level) => void
  onShowHistory: () => void
}

const SetupScreen = ({ onStart, onShowHistory }: SetupScreenProps) => {
  const [level, setLevel] = useState<Level>(() => getSelectedLevel())
  const availableLevels = useMemo(() => getPackNames(), [])

  useEffect(() => {
    if (availableLevels.length === 0 || availableLevels.includes(level)) {
      return
    }
    setLevel(availableLevels[0])
    setSelectedLevel(availableLevels[0])
  }, [availableLevels, level])

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLevel = event.target.value as Level
    setLevel(nextLevel)
    setSelectedLevel(nextLevel)
  }

  const handleStart = () => {
    setSelectedLevel(level)
    onStart(level)
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
          value={level}
          onChange={handleLevelChange}
        >
          {availableLevels.map((option) => (
            <option key={option} value={option}>
              {formatPackLabel(option)}
            </option>
          ))}
        </select>
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
