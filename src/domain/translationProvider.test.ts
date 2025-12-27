import { describe, expect, it } from 'vitest'
import { LocalTranslationProvider, TRANSLATION_PLACEHOLDER } from './translationProvider'

describe('LocalTranslationProvider', () => {
  it('returns translation for known word and language', () => {
    const provider = new LocalTranslationProvider({
      focus: { ua: 'фокус', ru: 'фокус' },
    })

    expect(provider.getTranslation('focus', 'ua')).toBe('фокус')
    expect(provider.getTranslation('Focus', 'ru')).toBe('фокус')
  })

  it('returns placeholder when word or language is missing', () => {
    const provider = new LocalTranslationProvider({
      focus: { ua: 'фокус' },
    })

    expect(provider.getTranslation('focus', 'de')).toBe(TRANSLATION_PLACEHOLDER)
    expect(provider.getTranslation('unknown', 'ua')).toBe(TRANSLATION_PLACEHOLDER)
  })

  it('prefers bundle translations when available', () => {
    const provider = new LocalTranslationProvider({
      gym: { ru: 'спортзал' },
      focus: { ua: 'фокус' },
    })

    provider.setBundle({
      gym: { ru: 'тренажерный зал' },
      focus: { ru: 'фокус' },
    })

    expect(provider.getTranslation('gym', 'ru')).toBe('тренажерный зал')
    expect(provider.getTranslation('focus', 'ua')).toBe('фокус')
  })
})
