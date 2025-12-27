import { describe, expect, it } from 'vitest'
import {
  applyCacheToBundle,
  filterBundle,
  getMissingWords,
  isMissingRu,
  normalizeRu,
} from './dict-refresh-ru-lib.mjs'

describe('dict-refresh-ru-lib', () => {
  it('normalizes RU values and detects missing entries', () => {
    expect(normalizeRu('')).toBe('')
    expect(normalizeRu('—')).toBe('')
    expect(normalizeRu(' undefined ')).toBe('')
    expect(normalizeRu('привет')).toBe('привет')

    expect(isMissingRu({})).toBe(true)
    expect(isMissingRu({ ru: '' })).toBe(true)
    expect(isMissingRu({ ru: 'тест' })).toBe(false)
  })

  it('filters bundle by allowed words and keeps object entries', () => {
    const raw = {
      keep: { ru: 'ok', de: 'gut' },
      drop: { ru: 'nope' },
      bad: 'string',
    }
    const filtered = filterBundle(raw, new Set(['keep', 'bad']))

    expect(filtered).toEqual({
      keep: { ru: 'ok', de: 'gut' },
      bad: {},
    })
  })

  it('uses cache to fill missing RU without overwriting existing', () => {
    const words = ['alpha', 'beta']
    const bundle = { alpha: { ru: 'старое' }, beta: {} }
    const cache = { alpha: 'новое', beta: 'перевод' }

    const { bundle: next, updatedFromCache } = applyCacheToBundle(words, bundle, cache)

    expect(updatedFromCache).toBe(true)
    expect(next.alpha.ru).toBe('старое')
    expect(next.beta.ru).toBe('перевод')
  })

  it('returns only words missing and not cached', () => {
    const words = ['alpha', 'beta', 'gamma']
    const bundle = { alpha: { ru: 'есть' }, beta: {}, gamma: {} }
    const cache = { gamma: 'кэш' }

    expect(getMissingWords(words, bundle, cache)).toEqual(['beta'])
  })
})
