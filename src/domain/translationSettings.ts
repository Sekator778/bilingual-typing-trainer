import type { TranslationLanguage } from './translationTypes'

const STORAGE_KEY = 'btt.translationLanguage'
const DEFAULT_LANGUAGE: TranslationLanguage = 'ua'

const isTranslationLanguage = (value: string): value is TranslationLanguage =>
  value === 'ua' || value === 'ru' || value === 'de'

export const loadTranslationLanguage = (): TranslationLanguage => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && isTranslationLanguage(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export const saveTranslationLanguage = (language: TranslationLanguage) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    return
  }
}
