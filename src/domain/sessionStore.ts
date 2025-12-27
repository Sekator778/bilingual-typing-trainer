import type { StatsSnapshot } from './statsModule'

export type SessionRecord = StatsSnapshot & {
  id: string
}

const STORAGE_KEY = 'typing.history.v1'
const MAX_SESSIONS = 50
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

const isSessionRecord = (value: unknown): value is SessionRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    isNumber(record.startedAt) &&
    isNumber(record.endedAt) &&
    isNumber(record.durationMs) &&
    isNumber(record.typedChars) &&
    isNumber(record.correctChars) &&
    isNumber(record.errors) &&
    isNumber(record.wordsCompleted) &&
    isNumber(record.wordsAttempted) &&
    isNumber(record.wpm) &&
    isNumber(record.accuracy)
  )
}

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const safeRead = (): { sessions: SessionRecord[]; available: boolean } => {
  if (!isStorageAvailable()) {
    return { sessions: [], available: false }
  }

  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { sessions: [], available: false }
  }

  if (!raw) {
    return { sessions: [], available: true }
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return { sessions: [], available: true }
    }
    const sessions = parsed.filter(isSessionRecord)
    return { sessions, available: true }
  } catch {
    return { sessions: [], available: true }
  }
}

export const loadSessions = () => safeRead()

export const appendSession = (
  snapshot: StatsSnapshot,
): { ok: boolean; sessions: SessionRecord[] } => {
  if (!isStorageAvailable()) {
    return { ok: false, sessions: [] }
  }

  const { sessions } = safeRead()
  const record: SessionRecord = {
    id: createSessionId(),
    ...snapshot,
  }
  const nextSessions = [record, ...sessions].slice(0, MAX_SESSIONS)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions))
    return { ok: true, sessions: nextSessions }
  } catch {
    return { ok: false, sessions }
  }
}
