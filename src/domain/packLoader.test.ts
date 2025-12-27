import { describe, expect, it } from 'vitest'
import { createPack, parsePack } from './packLoader'

describe('packLoader', () => {
  it('normalizes and deduplicates words', () => {
    const raw = "Hello\nMOTHER-IN-LAW\nit's\nWORLD\nworld\n123\nvalid\nvalid\nwith space\n"
    const result = parsePack(raw)

    expect(result).toEqual(['hello', 'mother-in-law', "it's", 'world', 'valid'])
  })

  it('falls back when pack is empty', () => {
    const result = createPack('  \\n')

    expect(result.words.length).toBeGreaterThan(0)
    expect(result.isFallback).toBe(true)
  })
})
