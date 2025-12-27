import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import wordListRaw from './data/raw/google-10000-english.txt?raw'
import { appendSession } from './domain/sessionStore'
import { loadAutoSpeak, saveAutoSpeak } from './domain/pronunciationSettings'
import { StatsModule } from './domain/statsModule'
import { loadTranslationBundle } from './domain/translationBundle'
import { webSpeechPronunciationProvider } from './domain/webSpeechPronunciationProvider'
import { localTranslationProvider } from './domain/translationProvider'
import { loadTranslationLanguage, saveTranslationLanguage } from './domain/translationSettings'
import type { TranslationLanguage } from './domain/translationTypes'
import { parseWordList } from './domain/wordList'

const WORD_LIST = parseWordList(wordListRaw)

const shuffleWords = (words: string[]) => {
  const shuffled = [...words]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const ERROR_DISPLAY_MS = 700
const STATS_TICK_MS = 1000
const LANGUAGE_OPTIONS: Array<{ code: TranslationLanguage; label: string }> = [
  { code: 'ua', label: 'UA' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
]

type CharState = 'correct' | 'incorrect' | 'pending'

const getCharState = (target: string, typed: string, index: number): CharState => {
  if (index >= typed.length) {
    return 'pending'
  }
  return typed[index] === target[index] ? 'correct' : 'incorrect'
}

const isLetter = (key: string) => /^[a-zA-Z]$/.test(key)

const isFunctionKey = (key: string) => /^F\d+$/.test(key)

type TrainingScreenProps = {
  onShowHistory: () => void
}

const TrainingScreen = ({ onShowHistory }: TrainingScreenProps) => {
  const [wordIndex, setWordIndex] = useState(0)
  const [wordOrder, setWordOrder] = useState(() => shuffleWords(WORD_LIST))
  const [language, setLanguage] = useState<TranslationLanguage>(() =>
    loadTranslationLanguage(),
  )
  const [autoSpeak, setAutoSpeak] = useState(() => loadAutoSpeak())
  const [typed, setTyped] = useState('')
  const [statusText, setStatusText] = useState('')
  const [errorFlash, setErrorFlash] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [, setBundleVersion] = useState(0)
  const [statsView, setStatsView] = useState({
    wpm: 0,
    accuracy: 0,
    wordsCompleted: 0,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const errorTimerRef = useRef<number | null>(null)
  const statsRef = useRef(new StatsModule())
  const hasStoredSessionRef = useRef(false)
  const lastSpokenWordRef = useRef<string | null>(null)

  const target = wordOrder[wordIndex % wordOrder.length]
  const targetLetters = useMemo(() => target.split(''), [target])
  const translation = localTranslationProvider.getTranslation(target, language)
  const isSpeechAvailable = webSpeechPronunciationProvider.isAvailable()

  useEffect(() => {
    inputRef.current?.focus()
  }, [wordIndex])

  useEffect(() => {
    saveTranslationLanguage(language)
  }, [language])

  useEffect(() => {
    let isMounted = true

    loadTranslationBundle().then((bundle) => {
      if (!isMounted || !bundle) {
        return
      }
      localTranslationProvider.setBundle(bundle)
      setBundleVersion((prev) => prev + 1)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    saveAutoSpeak(autoSpeak)
  }, [autoSpeak])

  const updateStatsView = useCallback((now = Date.now()) => {
    const stats = statsRef.current
    setStatsView({
      wpm: stats.getWpm(now),
      accuracy: Math.round(stats.getAccuracy() * 100),
      wordsCompleted: stats.getWordsCompleted(),
    })
  }, [])

  useEffect(() => {
    if (!isSessionActive) {
      return
    }
    const interval = window.setInterval(() => {
      updateStatsView()
    }, STATS_TICK_MS)

    return () => window.clearInterval(interval)
  }, [isSessionActive, updateStatsView])

  const speakCurrentWord = useCallback(() => {
    if (!isSpeechAvailable) {
      return
    }
    webSpeechPronunciationProvider.speak(target)
    inputRef.current?.focus()
  }, [isSpeechAvailable, target])

  useEffect(() => {
    if (!isSessionActive || !autoSpeak || !isSpeechAvailable) {
      return
    }

    if (lastSpokenWordRef.current === target) {
      return
    }

    lastSpokenWordRef.current = target
    webSpeechPronunciationProvider.speak(target)
  }, [autoSpeak, isSessionActive, isSpeechAvailable, target])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      if (event.code !== 'KeyS') {
        return
      }

      event.preventDefault()
      speakCurrentWord()
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [speakCurrentWord])

  const startSession = useCallback(
    (initialChar?: string) => {
      const now = Date.now()
      statsRef.current.reset(now)
      hasStoredSessionRef.current = false
      setIsSessionActive(true)
      setTyped(initialChar ?? '')
      setStatusText('')
      setErrorFlash(false)

      if (initialChar) {
        const isCorrect = initialChar === target[0]
        statsRef.current.onCharTyped(isCorrect)
      }

      updateStatsView(now)
    },
    [target, updateStatsView],
  )

  const finalizeSession = useCallback(() => {
    if (hasStoredSessionRef.current) {
      return
    }
    const stats = statsRef.current
    if (!stats.hasStarted() || !stats.hasActivity()) {
      return
    }
    stats.stop()
    appendSession(stats.getSnapshot())
    hasStoredSessionRef.current = true
  }, [])

  useEffect(() => {
    return () => {
      finalizeSession()
      webSpeechPronunciationProvider.cancel()
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current)
      }
    }
  }, [finalizeSession])

  const advanceWord = useCallback(() => {
    statsRef.current.onWordCompleted()
    updateStatsView()
    setWordIndex((prev) => {
      const nextIndex = prev + 1
      if (nextIndex >= wordOrder.length) {
        setWordOrder(shuffleWords(WORD_LIST))
        return 0
      }
      return nextIndex
    })
    setTyped('')
    setStatusText('')
    setErrorFlash(false)
  }, [updateStatsView, wordOrder.length])

  const triggerError = useCallback(() => {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current)
    }
    setErrorFlash(true)
    setStatusText('Not correct yet.')
    errorTimerRef.current = window.setTimeout(() => {
      setErrorFlash(false)
      setStatusText('')
    }, ERROR_DISPLAY_MS)
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const { key } = event

      if (!isSessionActive) {
        if (key === ' ') {
          event.preventDefault()
          startSession()
          return
        }

        if (isLetter(key)) {
          event.preventDefault()
          const nextChar = key.toLowerCase()
          startSession(nextChar)
          return
        }

        if (
          key === 'Tab' ||
          key.startsWith('Arrow') ||
          key === 'Escape' ||
          isFunctionKey(key)
        ) {
          event.preventDefault()
        }
        return
      }

      if (key === 'Enter') {
        event.preventDefault()
        if (typed.length === target.length && typed === target) {
          advanceWord()
        } else {
          triggerError()
        }
        return
      }

      if (key === 'Backspace') {
        event.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }

      if (key === ' ') {
        event.preventDefault()
        return
      }

      if (isLetter(key)) {
        event.preventDefault()
        if (typed.length >= target.length) {
          return
        }
        const nextChar = key.toLowerCase()
        const isCorrect = nextChar === target[typed.length]
        statsRef.current.onCharTyped(isCorrect)
        updateStatsView()
        setTyped(typed + nextChar)
        return
      }

      if (
        key === 'Tab' ||
        key.startsWith('Arrow') ||
        key === 'Escape' ||
        isFunctionKey(key)
      ) {
        event.preventDefault()
      }
    },
    [
      advanceWord,
      isSessionActive,
      startSession,
      target,
      triggerError,
      typed,
      updateStatsView,
    ],
  )

  const { wpm, accuracy, wordsCompleted } = statsView

  const handleShowHistory = useCallback(() => {
    finalizeSession()
    onShowHistory()
  }, [finalizeSession, onShowHistory])

  return (
    <div className="trainer">
      <header className="trainer__header">
        <div className="trainer__toolbar">
          <p className="trainer__eyebrow">Single-word training</p>
          <div className="trainer__actions">
            <div className="language-toggle" role="group" aria-label="Translation language">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`language-toggle__button ${
                    language === option.code ? 'is-active' : ''
                  }`}
                  onClick={() => setLanguage(option.code)}
                  aria-pressed={language === option.code}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`toggle-button ${autoSpeak ? 'is-active' : ''}`}
              onClick={() => setAutoSpeak((prev) => !prev)}
              aria-pressed={autoSpeak}
              disabled={!isSpeechAvailable}
            >
              Auto speak
            </button>
            <button type="button" className="ghost-button" onClick={handleShowHistory}>
              History
            </button>
          </div>
        </div>
        <h1 className="trainer__title">Type the word exactly</h1>
        <p className="trainer__subhead">
          Press Enter to advance when every letter is correct.
        </p>
      </header>

      <section className="trainer__word" aria-live="polite">
        {!isSessionActive && (
          <div className="session-overlay" role="status" aria-live="polite">
            <span className="session-overlay__content">Press Space to start</span>
          </div>
        )}
        <div className={`word ${errorFlash ? 'word--shake' : ''}`}>
          {targetLetters.map((letter, index) => {
            const state = getCharState(target, typed, index)
            return (
              <span key={`${letter}-${index}`} className={`char char--${state}`}>
                {letter}
              </span>
            )
          })}
        </div>
        <p className="translation" aria-live="polite" data-testid="translation">
          {translation}
        </p>
        <div className="pronunciation-controls">
          <button
            type="button"
            className="ghost-button ghost-button--small"
            onClick={speakCurrentWord}
            disabled={!isSpeechAvailable}
            aria-label="Speak current word (Alt+S)"
          >
            Speak
          </button>
        </div>
        <div className="trainer__meta">
          Word {wordIndex + 1} of {wordOrder.length}
        </div>
      </section>

      <section className="trainer__input">
        <input
          ref={inputRef}
          className={`type-input ${errorFlash ? 'type-input--error' : ''}`}
          value={typed}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          readOnly
          aria-label="Typing area"
          placeholder="Start typing..."
        />
        <div className="trainer__status" role="status" aria-live="polite">
          {statusText}
        </div>
        <div className="stats-strip" aria-live="polite">
          <div className="stats-strip__item">
            <span className="stats-strip__label">WPM</span>
            <span className="stats-strip__value">{wpm}</span>
          </div>
          <div className="stats-strip__item">
            <span className="stats-strip__label">Accuracy</span>
            <span className="stats-strip__value">{accuracy}%</span>
          </div>
          <div className="stats-strip__item">
            <span className="stats-strip__label">Words</span>
            <span className="stats-strip__value">{wordsCompleted}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TrainingScreen
