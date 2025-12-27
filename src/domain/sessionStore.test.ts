import { beforeEach, describe, expect, it } from 'vitest'
import type { StatsSnapshot } from './statsModule'
import { appendSession, loadSessions } from './sessionStore'

describe('sessionStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores sessions with the expected shape', () => {
    const snapshot: StatsSnapshot = {
      startedAt: 0,
      endedAt: 60000,
      durationMs: 60000,
      typedChars: 25,
      correctChars: 20,
      errors: 5,
      wordsCompleted: 5,
      wordsAttempted: 5,
      wpm: 5,
      accuracy: 0.8,
    }

    const result = appendSession({
      ...snapshot,
      preset: { kind: 'infinite' },
      outcome: 'completed',
      level: 'B1',
      mode: 'normal',
    })
    expect(result.ok).toBe(true)

    const { sessions, available } = loadSessions()
    expect(available).toBe(true)
    expect(sessions).toHaveLength(1)
    expect(typeof sessions[0].id).toBe('string')
    expect(sessions[0]).toMatchObject({
      ...snapshot,
      preset: { kind: 'infinite' },
      outcome: 'completed',
      level: 'B1',
      mode: 'normal',
    })
  })
})
