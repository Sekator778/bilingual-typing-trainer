const STORAGE_KEY = 'btt.autoSpeak'
const DEFAULT_AUTO_SPEAK = false

export const loadAutoSpeak = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_AUTO_SPEAK
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) {
      return DEFAULT_AUTO_SPEAK
    }
    return stored === 'true'
  } catch {
    return DEFAULT_AUTO_SPEAK
  }
}

export const saveAutoSpeak = (enabled: boolean) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    return
  }
}
