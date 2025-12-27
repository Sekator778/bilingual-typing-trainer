import { TRANSLATIONS } from '../data/translations'
import type { TranslationEntry, TranslationLanguage } from './translationTypes'

export const TRANSLATION_PLACEHOLDER = '—'

export interface TranslationProvider {
  getTranslation: (word: string, language: TranslationLanguage) => string
}

export class LocalTranslationProvider implements TranslationProvider {
  private readonly dictionary: Record<string, TranslationEntry>

  constructor(dictionary: Record<string, TranslationEntry>) {
    this.dictionary = dictionary
  }

  getTranslation(word: string, language: TranslationLanguage): string {
    try {
      const normalized = word.trim().toLowerCase()
      if (!normalized) {
        return TRANSLATION_PLACEHOLDER
      }
      const entry = this.dictionary[normalized]
      return entry?.[language] ?? TRANSLATION_PLACEHOLDER
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn('Translation lookup failed.', error)
      }
      return TRANSLATION_PLACEHOLDER
    }
  }
}

export const localTranslationProvider = new LocalTranslationProvider(TRANSLATIONS)
