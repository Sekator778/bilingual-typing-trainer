import type { Level } from './levels'
import type { PackResult } from './packLoader'
import { loadPack } from './packLoader'

export type WordSource = {
  level: Level
}

export type WordResult = {
  word: string
  index: number
  total: number
}

export type WordProviderStatus = {
  level: Level
  isFallback: boolean
  total: number
}

type PackLoader = (level: Level) => PackResult

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
  private words: string[] = []
  private cursor = 0
  private level: Level | null = null
  private isFallback = false

  constructor(loader: PackLoader = loadPack) {
    this.loader = loader
  }

  init(source: WordSource): WordProviderStatus {
    const { words, isFallback } = this.loader(source.level)
    this.words = shuffleWords(words)
    this.cursor = 0
    this.level = source.level
    this.isFallback = isFallback
    return {
      level: source.level,
      isFallback,
      total: this.words.length,
    }
  }

  next(): WordResult {
    if (this.words.length === 0) {
      return { word: '', index: 0, total: 0 }
    }
    if (this.cursor >= this.words.length) {
      this.words = shuffleWords(this.words)
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
      isFallback: this.isFallback,
      total: this.words.length,
    }
  }
}
