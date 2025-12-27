export const FALLBACK_WORDS = ['gym', 'health', 'code', 'bank', 'spring']

export const parseWordList = (raw: string): string[] => {
  const words: string[] = []
  const seen = new Set<string>()

  for (const line of raw.split(/\r?\n/)) {
    const normalized = line.trim().toLowerCase()
    if (!normalized || !/^[a-z]+$/.test(normalized) || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    words.push(normalized)
  }

  return words.length > 0 ? words : FALLBACK_WORDS
}
