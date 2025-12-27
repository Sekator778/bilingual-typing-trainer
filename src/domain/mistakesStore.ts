export type WordMistakeStats = {
  mistakes: number
  attempts: number
  lastMistakeAt?: number
  lastSeenAt?: number
}

export type MistakesMap = Record<string, WordMistakeStats>

const STORAGE_KEY = 'typing.mistakes.v1'
const STORAGE_TEST_KEY = 'btt.storageCheck'

const isStorageAvailable = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false
  }

  try {
    localStorage.setItem(STORAGE_TEST_KEY, '1')
    localStorage.removeItem(STORAGE_TEST_KEY)
    return true
  } catch {
    return false
  }
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isWordMistakeStats = (value: unknown): value is WordMistakeStats => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    isNumber(record.mistakes) &&
    isNumber(record.attempts) &&
    (record.lastMistakeAt === undefined || isNumber(record.lastMistakeAt)) &&
    (record.lastSeenAt === undefined || isNumber(record.lastSeenAt))
  )
}

const safeRead = (): { map: MistakesMap; available: boolean } => {
  if (!isStorageAvailable()) {
    return { map: {}, available: false }
  }

  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { map: {}, available: false }
  }

  if (!raw) {
    return { map: {}, available: true }
  }

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return { map: {}, available: true }
    }
    const map: MistakesMap = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key !== 'string' || !isWordMistakeStats(value)) {
        continue
      }
      map[key] = value
    }
    return { map, available: true }
  } catch {
    return { map: {}, available: true }
  }
}

const safeWrite = (map: MistakesMap) => {
  if (!isStorageAvailable()) {
    return false
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    return true
  } catch {
    return false
  }
}

const normalizeWord = (word: string) => word.trim().toLowerCase()

export const loadMistakes = (): MistakesMap => safeRead().map

export const saveMistakes = (map: MistakesMap): void => {
  safeWrite(map)
}

export const recordWordResult = (word: string, errors: number): void => {
  const normalized = normalizeWord(word)
  if (!normalized) {
    return
  }

  const { map, available } = safeRead()
  const existing = map[normalized] ?? { mistakes: 0, attempts: 0 }
  const now = Date.now()
  const next: WordMistakeStats = {
    mistakes: existing.mistakes + (errors > 0 ? 1 : 0),
    attempts: existing.attempts + 1,
    lastSeenAt: now,
    lastMistakeAt: errors > 0 ? now : existing.lastMistakeAt,
  }

  const nextMap = { ...map, [normalized]: next }
  if (available) {
    safeWrite(nextMap)
  }
}

export const getMistakesForWords = (
  words: string[],
): Array<{ word: string; stats: WordMistakeStats }> => {
  const map = loadMistakes()
  const results: Array<{ word: string; stats: WordMistakeStats }> = []

  for (const word of words) {
    const normalized = normalizeWord(word)
    const stats = map[normalized]
    if (!stats || stats.mistakes <= 0) {
      continue
    }
    results.push({ word: normalized, stats })
  }

  results.sort((a, b) => {
    if (b.stats.mistakes !== a.stats.mistakes) {
      return b.stats.mistakes - a.stats.mistakes
    }
    const bTime = b.stats.lastMistakeAt ?? 0
    const aTime = a.stats.lastMistakeAt ?? 0
    return bTime - aTime
  })

  return results
}
