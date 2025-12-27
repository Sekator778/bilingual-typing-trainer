export type StatsSnapshot = {
  startedAt: number
  endedAt: number
  durationMs: number
  typedChars: number
  correctChars: number
  errors: number
  wordsCompleted: number
  wordsAttempted: number
  wpm: number
  accuracy: number
}

const MINUTES_FOR_WPM = 0.1

export class StatsModule {
  private startedAt: number | null = null
  private endedAt: number | null = null
  private typedChars = 0
  private correctChars = 0
  private errors = 0
  private wordsCompleted = 0
  private wordsAttempted = 0
  private currentWordTouched = false

  reset(startedAt = Date.now()) {
    this.startedAt = startedAt
    this.endedAt = null
    this.typedChars = 0
    this.correctChars = 0
    this.errors = 0
    this.wordsCompleted = 0
    this.wordsAttempted = 0
    this.currentWordTouched = false
  }

  start(startedAt = Date.now()) {
    if (this.startedAt !== null) {
      return
    }
    this.startedAt = startedAt
    this.endedAt = null
  }

  stop(endedAt = Date.now()) {
    if (this.startedAt === null) {
      return
    }
    this.endedAt = endedAt
  }

  hasStarted() {
    return this.startedAt !== null
  }

  hasActivity() {
    return this.typedChars > 0 || this.wordsCompleted > 0
  }

  onCharTyped(correct: boolean) {
    if (this.startedAt === null) {
      return
    }
    this.typedChars += 1
    if (correct) {
      this.correctChars += 1
    } else {
      this.errors += 1
    }
    if (!this.currentWordTouched) {
      this.wordsAttempted += 1
      this.currentWordTouched = true
    }
  }

  onWordCompleted() {
    if (this.startedAt === null) {
      return
    }
    this.wordsCompleted += 1
    this.currentWordTouched = false
  }

  getWordsCompleted() {
    return this.wordsCompleted
  }

  getWordsAttempted() {
    return this.wordsAttempted
  }

  getTypedChars() {
    return this.typedChars
  }

  getCorrectChars() {
    return this.correctChars
  }

  getErrors() {
    return this.errors
  }

  getAccuracy() {
    if (this.typedChars === 0) {
      return 0
    }
    return this.correctChars / this.typedChars
  }

  getWpm(now = Date.now()) {
    if (this.startedAt === null) {
      return 0
    }
    const durationMs = this.getDurationMs(now)
    const minutes = durationMs / 60000
    if (minutes < MINUTES_FOR_WPM) {
      return 0
    }
    return Math.round((this.typedChars / 5) / minutes)
  }

  getDurationMs(now = Date.now()) {
    if (this.startedAt === null) {
      return 0
    }
    const endedAt = this.endedAt ?? now
    return Math.max(0, endedAt - this.startedAt)
  }

  getSnapshot(now = Date.now()): StatsSnapshot {
    const startedAt = this.startedAt ?? now
    const endedAt = this.endedAt ?? now
    const durationMs = Math.max(0, endedAt - startedAt)
    const accuracy = this.getAccuracy()
    const minutes = durationMs / 60000
    const wpm =
      minutes < MINUTES_FOR_WPM ? 0 : Math.round((this.typedChars / 5) / minutes)

    return {
      startedAt,
      endedAt,
      durationMs,
      typedChars: this.typedChars,
      correctChars: this.correctChars,
      errors: this.errors,
      wordsCompleted: this.wordsCompleted,
      wordsAttempted: this.wordsAttempted,
      wpm,
      accuracy,
    }
  }
}
