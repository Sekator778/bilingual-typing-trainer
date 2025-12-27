import { describe, expect, it } from 'vitest'
import type { Level } from './levels'
import { WordProvider } from './wordProvider'

describe('WordProvider', () => {
  it('uses words from the selected pack', () => {
    const loader = (level: Level) => ({
      words: level === 'A2' ? ['alpha', 'beta'] : ['gamma'],
      isFallback: false,
    })
    const provider = new WordProvider(loader)
    provider.init({ level: 'A2' })

    const first = provider.next()
    expect(['alpha', 'beta']).toContain(first.word)
  })

  it('reshuffles after exhausting the list', () => {
    const loader = () => ({
      words: ['one', 'two'],
      isFallback: false,
    })
    const provider = new WordProvider(loader)
    provider.init({ level: 'B1' })

    const first = provider.next()
    const second = provider.next()
    const third = provider.next()

    expect([first.word, second.word]).toContain(third.word)
    expect(third.index).toBe(1)
  })
})
