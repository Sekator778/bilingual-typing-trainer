import { beforeEach, describe, expect, it } from 'vitest'
import { appendSession } from './sessionStore'
import { recordWordResult } from './mistakesStore'
import { setSelectedLevel } from './levelSettings'
import { setTrainingMode } from './modeSettings'
import { setPreset } from './presetSettings'
import { saveTranslationLanguage } from './translationSettings'
import { saveAutoAdvance } from './trainingSettings'
import { saveAutoSpeak } from './pronunciationSettings'
import { buildExportSnapshot } from './exportSnapshot'

describe('buildExportSnapshot', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('includes settings, history, and mistakes', () => {
    setSelectedLevel('B1')
    setTrainingMode('mistakes')
    setPreset({ kind: 'byWords', targetWords: 25 })
    saveTranslationLanguage('ru')
    saveAutoAdvance(true)
    saveAutoSpeak(false)

    appendSession({
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
      level: 'B1',
      mode: 'normal',
    })

    recordWordResult('alpha', 1)

    const snapshot = buildExportSnapshot()

    expect(snapshot.schemaVersion).toBe(1)
    expect(snapshot.data.settings.level).toBe('B1')
    expect(snapshot.data.settings.mode).toBe('mistakes')
    expect(snapshot.data.settings.preset).toEqual({ kind: 'byWords', targetWords: 25 })
    expect(snapshot.data.settings.translationLang).toBe('ru')
    expect(snapshot.data.settings.autoAdvance).toBe(true)
    expect(snapshot.data.settings.autoSpeak).toBe(false)
    expect(snapshot.data.history.length).toBeGreaterThan(0)
    expect(snapshot.data.mistakes.alpha).toBeTruthy()
  })
})
