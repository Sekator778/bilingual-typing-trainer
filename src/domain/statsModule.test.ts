import { describe, expect, it } from 'vitest'
import { StatsModule } from './statsModule'

describe('StatsModule', () => {
  it('calculates WPM from typed chars and elapsed time', () => {
    const stats = new StatsModule()
    stats.reset(0)

    for (let i = 0; i < 25; i += 1) {
      stats.onCharTyped(true)
    }

    expect(stats.getWpm(60000)).toBe(5)
  })

  it('calculates accuracy from correct and typed chars', () => {
    const stats = new StatsModule()
    stats.reset(0)
    stats.onCharTyped(true)
    stats.onCharTyped(false)

    expect(stats.getAccuracy()).toBeCloseTo(0.5)
  })

  it('creates a snapshot with expected fields', () => {
    const stats = new StatsModule()
    stats.reset(0)
    stats.onCharTyped(true)
    stats.onCharTyped(false)
    stats.onWordCompleted()

    const snapshot = stats.getSnapshot(60000)

    expect(snapshot).toMatchObject({
      startedAt: 0,
      endedAt: 60000,
      durationMs: 60000,
      typedChars: 2,
      correctChars: 1,
      errors: 1,
      wordsCompleted: 1,
      wordsAttempted: 1,
    })
    expect(typeof snapshot.wpm).toBe('number')
    expect(snapshot.accuracy).toBeCloseTo(0.5)
  })
})
