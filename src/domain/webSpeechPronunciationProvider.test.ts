import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebSpeechPronunciationProvider } from './webSpeechPronunciationProvider'

const globalWithSpeech = globalThis as typeof globalThis & {
  speechSynthesis?: SpeechSynthesis
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance
}
const globalRecord = globalThis as Record<string, unknown>

const windowWithSpeech =
  typeof window !== 'undefined'
    ? (window as typeof window & {
        speechSynthesis?: SpeechSynthesis
        SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance
      })
    : undefined
const windowRecord =
  typeof window !== 'undefined'
    ? (window as unknown as Record<string, unknown>)
    : undefined

const originalSpeechSynthesis = globalWithSpeech.speechSynthesis
const originalWindowSpeechSynthesis = windowWithSpeech?.speechSynthesis
const originalUtterance = globalWithSpeech.SpeechSynthesisUtterance
const originalWindowUtterance = windowWithSpeech?.SpeechSynthesisUtterance

const resetGlobals = () => {
  if (originalSpeechSynthesis) {
    globalWithSpeech.speechSynthesis = originalSpeechSynthesis
  } else {
    delete globalRecord.speechSynthesis
  }

  if (windowWithSpeech) {
    if (originalWindowSpeechSynthesis) {
      windowWithSpeech.speechSynthesis = originalWindowSpeechSynthesis
    } else {
      delete windowRecord?.speechSynthesis
    }
  }

  if (originalUtterance) {
    globalWithSpeech.SpeechSynthesisUtterance = originalUtterance
  } else {
    delete globalRecord.SpeechSynthesisUtterance
  }

  if (windowWithSpeech) {
    if (originalWindowUtterance) {
      windowWithSpeech.SpeechSynthesisUtterance = originalWindowUtterance
    } else {
      delete windowRecord?.SpeechSynthesisUtterance
    }
  }
}

afterEach(() => {
  resetGlobals()
  vi.restoreAllMocks()
})

describe('WebSpeechPronunciationProvider', () => {
  it('reports unavailable when speech synthesis is missing', () => {
    delete globalRecord.speechSynthesis
    delete globalRecord.SpeechSynthesisUtterance
    if (windowWithSpeech) {
      delete windowRecord?.speechSynthesis
      delete windowRecord?.SpeechSynthesisUtterance
    }
    const provider = new WebSpeechPronunciationProvider()

    expect(provider.isAvailable()).toBe(false)
  })

  it('cancels before speaking when available', () => {
    const cancel = vi.fn()
    const speak = vi.fn()
    const getVoices = vi.fn(() => [
      { lang: 'en-US', name: 'Test', voiceURI: 'test' } as SpeechSynthesisVoice,
    ])
    const addEventListener = vi.fn()

    globalWithSpeech.SpeechSynthesisUtterance = class {
      text: string
      lang = ''
      voice?: SpeechSynthesisVoice
      constructor(text: string) {
        this.text = text
      }
    } as unknown as typeof SpeechSynthesisUtterance

    const synthesis = {
      cancel,
      speak,
      getVoices,
      addEventListener,
    } as unknown as SpeechSynthesis

    globalWithSpeech.speechSynthesis = synthesis
    if (windowWithSpeech) {
      windowWithSpeech.speechSynthesis = synthesis
      windowWithSpeech.SpeechSynthesisUtterance =
        globalWithSpeech.SpeechSynthesisUtterance as typeof SpeechSynthesisUtterance
    }

    const provider = new WebSpeechPronunciationProvider()
    provider.speak('hello')

    expect(cancel).toHaveBeenCalledTimes(1)
    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0]?.[0] as { text: string }
    expect(utterance.text).toBe('hello')
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(
      speak.mock.invocationCallOrder[0],
    )
  })
})
