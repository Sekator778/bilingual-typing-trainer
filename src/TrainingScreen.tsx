import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import wordListRaw from './data/raw/google-10000-english.txt?raw'
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

type CharState = 'correct' | 'incorrect' | 'pending'

const getCharState = (target: string, typed: string, index: number): CharState => {
  if (index >= typed.length) {
    return 'pending'
  }
  return typed[index] === target[index] ? 'correct' : 'incorrect'
}

const isLetter = (key: string) => /^[a-zA-Z]$/.test(key)

const isFunctionKey = (key: string) => /^F\d+$/.test(key)

const TrainingScreen = () => {
  const [wordIndex, setWordIndex] = useState(0)
  const [wordOrder, setWordOrder] = useState(() => shuffleWords(WORD_LIST))
  const [typed, setTyped] = useState('')
  const [statusText, setStatusText] = useState('')
  const [errorFlash, setErrorFlash] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const errorTimerRef = useRef<number | null>(null)

  const target = wordOrder[wordIndex % wordOrder.length]
  const targetLetters = useMemo(() => target.split(''), [target])

  useEffect(() => {
    inputRef.current?.focus()
  }, [wordIndex])

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current)
      }
    }
  }, [])

  const advanceWord = useCallback(() => {
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
  }, [])

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

      if (isLetter(key)) {
        event.preventDefault()
        setTyped((prev) => {
          if (prev.length >= target.length) {
            return prev
          }
          return prev + key.toLowerCase()
        })
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
    [advanceWord, target, triggerError, typed],
  )

  return (
    <div className="trainer">
      <header className="trainer__header">
        <p className="trainer__eyebrow">Single-word training</p>
        <h1 className="trainer__title">Type the word exactly</h1>
        <p className="trainer__subhead">
          Press Enter to advance when every letter is correct.
        </p>
      </header>

      <section className="trainer__word" aria-live="polite">
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
      </section>
    </div>
  )
}

export default TrainingScreen
