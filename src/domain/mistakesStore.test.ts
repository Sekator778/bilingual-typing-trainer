import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMistakesForWords, loadMistakes, recordWordResult } from './mistakesStore'

describe('mistakesStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('records attempts and mistakes per word', () => {
    recordWordResult('hello', 2)
    recordWordResult('hello', 0)

    const map = loadMistakes()
    expect(map.hello.mistakes).toBe(1)
    expect(map.hello.attempts).toBe(2)
  })

  it('orders mistakes by count and last mistake time', () => {
    const nowSpy = vi.spyOn(Date, 'now')
    nowSpy.mockReturnValue(1000)
    recordWordResult('alpha', 1)
    nowSpy.mockReturnValue(2000)
    recordWordResult('beta', 1)
    nowSpy.mockReturnValue(3000)
    recordWordResult('beta', 1)
    nowSpy.mockReturnValue(4000)
    recordWordResult('gamma', 1)

    const results = getMistakesForWords(['alpha', 'beta', 'gamma'])
    expect(results.map((entry) => entry.word)).toEqual(['beta', 'gamma', 'alpha'])
  })

  it('does not crash when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('no storage')
      },
      setItem: () => {
        throw new Error('no storage')
      },
      removeItem: () => {
        throw new Error('no storage')
      },
    })

    expect(() => recordWordResult('hello', 1)).not.toThrow()
    expect(loadMistakes()).toEqual({})
  })
})
