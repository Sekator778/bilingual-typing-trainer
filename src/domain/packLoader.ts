import type { Level } from './levels'
import { getPackRaw } from './packRegistry'

export type PackResult = {
  words: string[]
  isFallback: boolean
}

export const FALLBACK_WORDS = ['gym', 'health', 'code', 'bank', 'spring']

export const parsePack = (raw: string): string[] => {
  const words: string[] = []
  const seen = new Set<string>()

  for (const line of raw.split(/\r?\n/)) {
    const normalized = line.trim().toLowerCase()
    if (
      !normalized ||
      !/^[a-z]+(?:[-'][a-z]+)*$/.test(normalized) ||
      seen.has(normalized)
    ) {
      continue
    }
    seen.add(normalized)
    words.push(normalized)
  }

  return words
}

export const createPack = (raw: string): PackResult => {
  const words = parsePack(raw)
  if (words.length === 0) {
    return { words: FALLBACK_WORDS, isFallback: true }
  }
  return { words, isFallback: false }
}

export const loadPack = (level: Level): PackResult => {
  return createPack(getPackRaw(level))
}
