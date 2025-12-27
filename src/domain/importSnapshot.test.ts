import { beforeEach, describe, expect, it } from 'vitest'
import type { ExportSnapshot } from './exportSnapshot'
import { applyImportSnapshot, validateImportSnapshot } from './importSnapshot'
import { loadSessions } from './sessionStore'
import { loadMistakes, recordWordResult } from './mistakesStore'
import { loadTranslationLanguage } from './translationSettings'
import { loadAutoAdvance } from './trainingSettings'
import { loadAutoSpeak } from './pronunciationSettings'
import { getSelectedLevel } from './levelSettings'
import { getTrainingMode } from './modeSettings'
import { getPreset } from './presetSettings'

const buildSnapshot = (): ExportSnapshot => ({
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  appVersion: '0.1.0',
  data: {
    settings: {
      level: 'B2',
      mode: 'mistakes',
      preset: { kind: 'byWords', targetWords: 25 },
      translationLang: 'de',
      autoAdvance: true,
      autoSpeak: false,
    },
    history: [
      {
        id: 'session-1',
        startedAt: 0,
        endedAt: 1000,
        durationMs: 1000,
        typedChars: 10,
        correctChars: 9,
        errors: 1,
        wordsCompleted: 2,
        wordsAttempted: 2,
        wpm: 10,
        accuracy: 0.9,
        preset: { kind: 'infinite' },
        outcome: 'completed',
        level: 'B2',
        mode: 'mistakes',
      },
    ],
    mistakes: {
      alpha: { mistakes: 2, attempts: 2, lastMistakeAt: 100 },
    },
  },
})

describe('importSnapshot', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('validates a snapshot and applies settings + data', () => {
    const snapshot = buildSnapshot()
    const result = validateImportSnapshot(snapshot)
    expect(result.ok).toBe(true)

    applyImportSnapshot(snapshot)

    expect(getSelectedLevel()).toBe('B2')
    expect(getTrainingMode()).toBe('mistakes')
    expect(getPreset()).toEqual({ kind: 'byWords', targetWords: 25 })
    expect(loadTranslationLanguage()).toBe('de')
    expect(loadAutoAdvance()).toBe(true)
    expect(loadAutoSpeak()).toBe(false)

    const { sessions } = loadSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].id).toBe('session-1')

    const mistakes = loadMistakes()
    expect(mistakes.alpha.mistakes).toBe(2)
  })

  it('merges mistakes using max values', () => {
    recordWordResult('alpha', 1)
    const snapshot = buildSnapshot()

    applyImportSnapshot(snapshot)
    const mistakes = loadMistakes()
    expect(mistakes.alpha.mistakes).toBe(2)
  })
})
