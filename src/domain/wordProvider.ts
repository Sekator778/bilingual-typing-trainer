import type { Level } from './levels'
import type { TrainingMode } from './trainingMode'
import type { WordMistakeStats } from './mistakesStore'
import { getMistakesForWords } from './mistakesStore'
import type { PackResult } from './packLoader'
import { loadPack } from './packLoader'

export type WordSource = {
  level: Level
  mode: TrainingMode
}

export type WordResult = {
  word: string
  index: number
  total: number
}

export type WordProviderStatus = {
  level: Level
  mode: TrainingMode
  isFallback: boolean
  total: number
  isEmpty: boolean
}

type PackLoader = (level: Level) => PackResult
type MistakesSelector = (words: string[]) => Array<{ word: string; stats: WordMistakeStats }>

const shuffleWords = (words: string[]) => {
  const shuffled = [...words]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export class WordProvider {
  private readonly loader: PackLoader
  private readonly selectMistakes: MistakesSelector
  private words: string[] = []
  private cursor = 0
  private level: Level | null = null
  private isFallback = false
  private mode: TrainingMode = 'normal'
  private isEmpty = false

  constructor(loader: PackLoader = loadPack, selectMistakes: MistakesSelector = getMistakesForWords) {
    this.loader = loader
    this.selectMistakes = selectMistakes
  }

  init(source: WordSource): WordProviderStatus {
    const { words, isFallback } = this.loader(source.level)
    let nextWords = words
    let isEmpty = false

    if (source.mode === 'mistakes') {
      const mistakes = this.selectMistakes(words)
      nextWords = mistakes.map((entry) => entry.word)
      isEmpty = nextWords.length === 0
    } else {
      nextWords = shuffleWords(words)
    }

    this.words = nextWords
    this.cursor = 0
    this.level = source.level
    this.isFallback = isFallback
    this.mode = source.mode
    this.isEmpty = isEmpty
    return {
      level: source.level,
      mode: source.mode,
      isFallback,
      total: this.words.length,
      isEmpty,
    }
  }

  next(): WordResult {
    if (this.words.length === 0) {
      return { word: '', index: 0, total: 0 }
    }
    if (this.cursor >= this.words.length) {
      if (this.mode === 'normal') {
        this.words = shuffleWords(this.words)
      }
      this.cursor = 0
    }
    const word = this.words[this.cursor]
    const index = this.cursor + 1
    this.cursor += 1
    return { word, index, total: this.words.length }
  }

  getStatus(): WordProviderStatus | null {
    if (!this.level) {
      return null
    }
    return {
      level: this.level,
      mode: this.mode,
      isFallback: this.isFallback,
      total: this.words.length,
      isEmpty: this.isEmpty,
    }
  }
}
