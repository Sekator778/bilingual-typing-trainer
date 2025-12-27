import type { Level } from './levels'
import { getPackNames } from './packRegistry'

const STORAGE_KEY = 'typing.level.v1'
const DEFAULT_LEVEL: Level = 'B1'

const normalizeLevel = (value: string) => value.trim().toUpperCase()

const getDefaultLevel = () => {
  const available = getPackNames()
  if (available.includes(DEFAULT_LEVEL)) {
    return DEFAULT_LEVEL
  }
  return available[0] ?? DEFAULT_LEVEL
}

const isLevel = (value: string): value is Level =>
  getPackNames().includes(normalizeLevel(value))

export const getSelectedLevel = (): Level => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return getDefaultLevel()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultLevel()
    }
    const normalized = normalizeLevel(stored)
    return isLevel(normalized) ? normalized : getDefaultLevel()
  } catch {
    return getDefaultLevel()
  }
}

export const setSelectedLevel = (level: Level) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, normalizeLevel(level))
  } catch {
    return
  }
}
