const STORAGE_KEY = 'btt.autoAdvance'
const DEFAULT_AUTO_ADVANCE = false

export const loadAutoAdvance = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_AUTO_ADVANCE
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) {
      return DEFAULT_AUTO_ADVANCE
    }
    return stored === 'true'
  } catch {
    return DEFAULT_AUTO_ADVANCE
  }
}

export const saveAutoAdvance = (enabled: boolean) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    return
  }
}
