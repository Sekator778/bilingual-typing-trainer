import type { TranslationEntry } from './translationTypes'

type TranslationBundle = Record<string, TranslationEntry>

let cachedBundle: TranslationBundle | null = null
let bundlePromise: Promise<TranslationBundle | null> | null = null

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

export const loadTranslationBundle = async () => {
  if (cachedBundle) {
    return cachedBundle
  }

  if (bundlePromise) {
    return bundlePromise
  }

  if (typeof fetch === 'undefined') {
    return null
  }

  bundlePromise = (async () => {
    try {
      const response = await fetch('/translations.v1.json')
      if (!response.ok) {
        return null
      }
      const data = await response.json()
      if (!isPlainObject(data)) {
        return null
      }
      cachedBundle = data as TranslationBundle
      return cachedBundle
    } catch {
      return null
    }
  })()

  return bundlePromise
}

export const clearTranslationBundleCache = () => {
  cachedBundle = null
  bundlePromise = null
}
