import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SessionRecordInput } from './domain/sessionStore'
import { appendSession } from './domain/sessionStore'
import { loadAutoSpeak, saveAutoSpeak } from './domain/pronunciationSettings'
import { loadAutoAdvance, saveAutoAdvance } from './domain/trainingSettings'
import type { Level } from './domain/levels'
import { StatsModule } from './domain/statsModule'
import { loadTranslationBundle } from './domain/translationBundle'
import { webSpeechPronunciationProvider } from './domain/webSpeechPronunciationProvider'
import { localTranslationProvider } from './domain/translationProvider'
import { loadTranslationLanguage, saveTranslationLanguage } from './domain/translationSettings'
import type { TranslationLanguage } from './domain/translationTypes'
import { recordWordResult } from './domain/mistakesStore'
import { WordProvider } from './domain/wordProvider'
import { formatPackLabel } from './domain/packRegistry'
import type { Preset, SessionOutcome } from './domain/presets'
import { formatPresetLabel } from './domain/presets'
import { isPresetCompleteByTime, isPresetCompleteByWords } from './domain/presetUtils'
import type { TrainingMode } from './domain/trainingMode'
import { TRAINING_MODE_LABELS } from './domain/trainingMode'

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

const isStartChar = (key: string) => /^[a-zA-Z]$/.test(key)
const isWordChar = (key: string) => /^[a-zA-Z'-]$/.test(key)

const isFunctionKey = (key: string) => /^F\d+$/.test(key)

type TrainingScreenProps = {
  level: Level
  mode: TrainingMode
  preset: Preset
  onBackToSetup: () => void
  onShowHistory: () => void
  onSessionComplete: (record: SessionRecordInput) => void
}

const TrainingScreen = ({
  level,
  mode,
  preset,
  onBackToSetup,
  onShowHistory,
  onSessionComplete,
}: TrainingScreenProps) => {
  const [target, setTarget] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [wordTotal, setWordTotal] = useState(0)
  const [isFallbackPack, setIsFallbackPack] = useState(false)
  const [language, setLanguage] = useState<TranslationLanguage>(() =>
    loadTranslationLanguage(),
  )
  const [autoSpeak, setAutoSpeak] = useState(() => loadAutoSpeak())
  const [autoAdvance, setAutoAdvance] = useState(() => loadAutoAdvance())
  const [typed, setTyped] = useState('')
  const [statusText, setStatusText] = useState('')
  const [errorFlash, setErrorFlash] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [, setBundleVersion] = useState(0)
  const [statsView, setStatsView] = useState({
    wpm: 0,
    accuracy: 0,
    wordsCompleted: 0,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const errorTimerRef = useRef<number | null>(null)
  const wordErrorsRef = useRef(0)
  const statsRef = useRef(new StatsModule())
  const hasStoredSessionRef = useRef(false)
  const lastSpokenWordRef = useRef<string | null>(null)
  const wordProviderRef = useRef(new WordProvider())

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
    const provider = wordProviderRef.current
    const status = provider.init({ level, mode })
    const nextWord = provider.next()
    setTarget(nextWord.word)
    setWordIndex(nextWord.index)
    setWordTotal(nextWord.total)
    setIsFallbackPack(status.isFallback)
    setIsSessionActive(false)
    setTyped('')
    setStatusText('')
    setErrorFlash(false)
    setStatsView({ wpm: 0, accuracy: 0, wordsCompleted: 0 })
    statsRef.current = new StatsModule()
    wordErrorsRef.current = 0
    lastSpokenWordRef.current = null
  }, [level, mode, preset])

  useEffect(() => {
    saveAutoSpeak(autoSpeak)
  }, [autoSpeak])

  useEffect(() => {
    saveAutoAdvance(autoAdvance)
  }, [autoAdvance])

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
      wordErrorsRef.current = 0

      if (initialChar) {
        const isCorrect = initialChar === target[0]
        statsRef.current.onCharTyped(isCorrect)
        if (!isCorrect) {
          wordErrorsRef.current += 1
        }
      }

      updateStatsView(now)
    },
    [target, updateStatsView],
  )

  const persistSession = useCallback(
    (outcome: SessionOutcome) => {
      if (hasStoredSessionRef.current) {
        return null
      }
      const stats = statsRef.current
      if (!stats.hasStarted() || !stats.hasActivity()) {
        return null
      }
      const now = Date.now()
      stats.stop(now)
      const record: SessionRecordInput = {
        ...stats.getSnapshot(now),
        preset,
        outcome,
        level,
        mode,
      }
      appendSession(record)
      hasStoredSessionRef.current = true
      return record
    },
    [level, mode, preset],
  )

  const completeSession = useCallback(() => {
    setIsSessionActive(false)
    const record = persistSession('completed')
    if (record) {
      onSessionComplete(record)
    }
  }, [onSessionComplete, persistSession])

  const interruptSession = useCallback(() => {
    persistSession('interrupted')
  }, [persistSession])

  useEffect(() => {
    return () => {
      interruptSession()
      webSpeechPronunciationProvider.cancel()
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current)
      }
    }
  }, [interruptSession])

  const advanceWord = useCallback(() => {
    recordWordResult(target, wordErrorsRef.current)
    statsRef.current.onWordCompleted()
    const completedWords = statsRef.current.getWordsCompleted()
    updateStatsView()
    if (isPresetCompleteByWords(preset, completedWords)) {
      completeSession()
      return
    }
    const nextWord = wordProviderRef.current.next()
    setTarget(nextWord.word)
    setWordIndex(nextWord.index)
    setWordTotal(nextWord.total)
    setTyped('')
    setStatusText('')
    setErrorFlash(false)
    wordErrorsRef.current = 0
  }, [completeSession, preset, target, updateStatsView])

  useEffect(() => {
    if (!isSessionActive || preset.kind !== 'byTime') {
      return
    }

    const interval = window.setInterval(() => {
      const elapsed = statsRef.current.getDurationMs(Date.now())
      if (isPresetCompleteByTime(preset, elapsed)) {
        completeSession()
      }
    }, 500)

    return () => window.clearInterval(interval)
  }, [completeSession, isSessionActive, preset])

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

      if (isSettingsOpen) {
        event.preventDefault()
        if (key === 'Escape') {
          setIsSettingsOpen(false)
          inputRef.current?.focus()
        }
        return
      }

      if (!isSessionActive) {
        if (key === ' ') {
          event.preventDefault()
          startSession()
          return
        }

        if (isStartChar(key)) {
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
        if (autoAdvance && typed.length === target.length && typed === target) {
          return
        }
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

      if (isWordChar(key)) {
        event.preventDefault()
        if (typed.length >= target.length) {
          return
        }
        const nextChar = key.toLowerCase()
        const isCorrect = nextChar === target[typed.length]
        statsRef.current.onCharTyped(isCorrect)
        if (!isCorrect) {
          wordErrorsRef.current += 1
        }
        updateStatsView()
        const nextTyped = typed + nextChar
        setTyped(nextTyped)
        if (autoAdvance && nextTyped.length === target.length && nextTyped === target) {
          advanceWord()
        }
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
      autoAdvance,
      isSessionActive,
      isSettingsOpen,
      startSession,
      target,
      triggerError,
      typed,
      updateStatsView,
    ],
  )

  const { wpm, accuracy, wordsCompleted } = statsView

  const handleShowHistory = useCallback(() => {
    interruptSession()
    onShowHistory()
  }, [interruptSession, onShowHistory])

  const handleBackToSetup = useCallback(() => {
    interruptSession()
    onBackToSetup()
  }, [interruptSession, onBackToSetup])

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true)
    inputRef.current?.blur()
  }, [])

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false)
    inputRef.current?.focus()
  }, [])

  return (
    <div className="trainer">
      <header className="trainer__header">
        <div className="trainer__toolbar">
          <div className="trainer__intro">
            <p className="trainer__eyebrow">Single-word training</p>
            <p className="trainer__level">Level: {formatPackLabel(level)}</p>
            <p className="trainer__mode">Mode: {TRAINING_MODE_LABELS[mode]}</p>
            <p className="trainer__preset">Preset: {formatPresetLabel(preset)}</p>
          </div>
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
            <button type="button" className="ghost-button" onClick={handleOpenSettings}>
              Settings
            </button>
            <button type="button" className="ghost-button" onClick={handleBackToSetup}>
              Change level
            </button>
            <button type="button" className="ghost-button" onClick={handleShowHistory}>
              History
            </button>
          </div>
        </div>
        <h1 className="trainer__title">Type the word exactly</h1>
        <p className="trainer__subhead">
          {autoAdvance
            ? 'Words advance automatically when correct.'
            : 'Press Enter to advance when every letter is correct.'}
        </p>
        {isFallbackPack && (
          <p className="trainer__notice">
            Pack unavailable. Using fallback words.
          </p>
        )}
      </header>

      <section className="trainer__word" aria-live="polite">
        {!isSessionActive && (
          <div className="session-overlay" role="status" aria-live="polite">
            <span className="session-overlay__content">Press Space to start</span>
          </div>
        )}
        <div
          className={`word ${errorFlash ? 'word--shake' : ''}`}
          data-testid="target-word"
        >
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
          Word {wordIndex} of {wordTotal}
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

      {isSettingsOpen && (
        <div className="settings-overlay" role="dialog" aria-modal="true">
          <div className="settings-panel">
            <div className="settings-panel__header">
              <div>
                <p className="settings-panel__eyebrow">Settings</p>
                <h2 className="settings-panel__title">Session preferences</h2>
              </div>
              <button
                type="button"
                className="ghost-button ghost-button--small"
                onClick={handleCloseSettings}
              >
                Close
              </button>
            </div>
            <label className="settings-toggle">
              <span>Auto-advance on correct word</span>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(event) => setAutoAdvance(event.target.checked)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingScreen
