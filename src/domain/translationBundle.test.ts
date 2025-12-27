import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearTranslationBundleCache, loadTranslationBundle } from './translationBundle'

const globalRecord = globalThis as Record<string, unknown>
const originalFetch = globalThis.fetch

afterEach(() => {
  clearTranslationBundleCache()
  if (originalFetch) {
    globalThis.fetch = originalFetch
  } else {
    delete globalRecord.fetch
  }
  vi.restoreAllMocks()
})

describe('translationBundle', () => {
  it('returns null when fetch is unavailable', async () => {
    delete globalRecord.fetch
    const bundle = await loadTranslationBundle()
    expect(bundle).toBeNull()
  })

  it('loads and caches the bundle data', async () => {
    const json = vi.fn(async () => ({
      gym: { ru: 'спортзал' },
    }))
    globalThis.fetch = (vi.fn(async () => ({
      ok: true,
      json,
    })) as unknown) as typeof fetch

    const first = await loadTranslationBundle()
    const second = await loadTranslationBundle()

    expect(first).toEqual({ gym: { ru: 'спортзал' } })
    expect(second).toEqual(first)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })
})
