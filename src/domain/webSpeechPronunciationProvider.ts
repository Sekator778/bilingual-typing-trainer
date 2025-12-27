import type { PronunciationProvider } from './pronunciationProvider'

const DEFAULT_LANG = 'en-US'

export class WebSpeechPronunciationProvider implements PronunciationProvider {
  private voice: SpeechSynthesisVoice | null = null
  private hasVoiceListener = false

  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.speechSynthesis !== 'undefined' &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    )
  }

  speak(text: string) {
    const synthesis = this.getSynthesis()
    if (!synthesis) {
      return
    }

    const normalized = text.trim()
    if (!normalized) {
      return
    }

    try {
      this.ensureVoice(synthesis)
      synthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(normalized)
      if (this.voice) {
        utterance.voice = this.voice
        utterance.lang = this.voice.lang
      } else {
        utterance.lang = DEFAULT_LANG
      }
      synthesis.speak(utterance)
    } catch {
      return
    }
  }

  cancel() {
    const synthesis = this.getSynthesis()
    if (!synthesis) {
      return
    }
    try {
      synthesis.cancel()
    } catch {
      return
    }
  }

  private getSynthesis() {
    if (!this.isAvailable()) {
      return null
    }
    return window.speechSynthesis
  }

  private ensureVoice(synthesis: SpeechSynthesis) {
    if (this.voice) {
      return
    }

    const voices = synthesis.getVoices()
    if (voices.length > 0) {
      this.voice = this.pickVoice(voices)
      return
    }

    if (this.hasVoiceListener || typeof synthesis.addEventListener !== 'function') {
      return
    }

    this.hasVoiceListener = true
    synthesis.addEventListener(
      'voiceschanged',
      () => {
        const nextVoices = synthesis.getVoices()
        if (nextVoices.length > 0) {
          this.voice = this.pickVoice(nextVoices)
        }
      },
      { once: true },
    )
  }

  private pickVoice(voices: SpeechSynthesisVoice[]) {
    const englishVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith('en'),
    )
    return englishVoice ?? voices[0] ?? null
  }
}

export const webSpeechPronunciationProvider = new WebSpeechPronunciationProvider()
