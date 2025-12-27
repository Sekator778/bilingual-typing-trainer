import { describe, expect, it } from 'vitest'
import { FALLBACK_WORDS, parseWordList } from './wordList'

describe('parseWordList', () => {
  it('filters invalid words and lowercases', () => {
    const raw = "Gym\nco-op\ncan't\nhello2\nOK\n  bank  \n\n"
    const result = parseWordList(raw)
    expect(result).toEqual(['gym', 'co-op', "can't", 'ok', 'bank'])
  })

  it('removes empty lines', () => {
    const raw = '\n\nhello\n\nworld\n'
    const result = parseWordList(raw)
    expect(result).toEqual(['hello', 'world'])
  })

  it('falls back when input has no valid words', () => {
    const raw = '123\nco op\n\n'
    const result = parseWordList(raw)
    expect(result).toEqual(FALLBACK_WORDS)
  })
})
