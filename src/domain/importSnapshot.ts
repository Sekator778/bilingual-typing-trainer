import type { ExportSnapshot } from './exportSnapshot'
import { isPreset } from './presets'
import type { TrainingMode } from './trainingMode'
import type { TranslationLanguage } from './translationTypes'
import type { SessionRecord } from './sessionStore'
import { replaceSessions } from './sessionStore'
import { loadMistakes, saveMistakes } from './mistakesStore'
import { setSelectedLevel } from './levelSettings'
import { setTrainingMode } from './modeSettings'
import { setPreset } from './presetSettings'
import { saveTranslationLanguage } from './translationSettings'
import { saveAutoAdvance } from './trainingSettings'
import { saveAutoSpeak } from './pronunciationSettings'

type ImportResult =
  | { ok: true; snapshot: ExportSnapshot }
  | { ok: false; error: string }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const isTrainingMode = (value: unknown): value is TrainingMode =>
  value === 'normal' || value === 'mistakes'

const isTranslationLanguage = (value: unknown): value is TranslationLanguage =>
  value === 'ua' || value === 'ru' || value === 'de'

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isSessionRecord = (value: unknown): value is SessionRecord => {
  if (!isPlainObject(value)) {
    return false
  }
  return (
    typeof value.id === 'string' &&
    isNumber(value.startedAt) &&
    isNumber(value.endedAt) &&
    isNumber(value.durationMs) &&
    isNumber(value.typedChars) &&
    isNumber(value.correctChars) &&
    isNumber(value.errors) &&
    isNumber(value.wordsCompleted) &&
    isNumber(value.wordsAttempted) &&
    isNumber(value.wpm) &&
    isNumber(value.accuracy) &&
    isPreset(value.preset) &&
    (value.outcome === 'completed' || value.outcome === 'interrupted')
  )
}

const isMistakesMap = (value: unknown): value is Record<string, unknown> => {
  if (!isPlainObject(value)) {
    return false
  }
  return Object.values(value).every((entry) => {
    if (!isPlainObject(entry)) {
      return false
    }
    if (!isNumber(entry.mistakes) || !isNumber(entry.attempts)) {
      return false
    }
    if (
      entry.lastMistakeAt !== undefined &&
      !isNumber(entry.lastMistakeAt)
    ) {
      return false
    }
    if (entry.lastSeenAt !== undefined && !isNumber(entry.lastSeenAt)) {
      return false
    }
    return true
  })
}

export const validateImportSnapshot = (json: unknown): ImportResult => {
  if (!isPlainObject(json)) {
    return { ok: false, error: 'Invalid JSON structure.' }
  }

  if (json.schemaVersion !== 1) {
    return { ok: false, error: 'Unsupported schema version.' }
  }

  if (!isPlainObject(json.data)) {
    return { ok: false, error: 'Missing data payload.' }
  }

  const settings = json.data.settings
  if (!isPlainObject(settings)) {
    return { ok: false, error: 'Missing settings.' }
  }

  if (typeof settings.level !== 'string') {
    return { ok: false, error: 'Invalid level.' }
  }

  if (!isTrainingMode(settings.mode)) {
    return { ok: false, error: 'Invalid mode.' }
  }

  if (!isPreset(settings.preset)) {
    return { ok: false, error: 'Invalid preset.' }
  }

  if (!isTranslationLanguage(settings.translationLang)) {
    return { ok: false, error: 'Invalid translation language.' }
  }

  if (typeof settings.autoAdvance !== 'boolean' || typeof settings.autoSpeak !== 'boolean') {
    return { ok: false, error: 'Invalid settings flags.' }
  }

  if (!Array.isArray(json.data.history)) {
    return { ok: false, error: 'Invalid history.' }
  }

  if (!json.data.history.every(isSessionRecord)) {
    return { ok: false, error: 'Invalid session record.' }
  }

  if (!isMistakesMap(json.data.mistakes)) {
    return { ok: false, error: 'Invalid mistakes data.' }
  }

  return { ok: true, snapshot: json as ExportSnapshot }
}

export const applyImportSnapshot = (snapshot: ExportSnapshot) => {
  const settings = snapshot.data.settings

  setSelectedLevel(settings.level)
  setTrainingMode(settings.mode)
  setPreset(settings.preset)
  saveTranslationLanguage(settings.translationLang)
  saveAutoAdvance(settings.autoAdvance)
  saveAutoSpeak(settings.autoSpeak)

  replaceSessions(snapshot.data.history)

  const existing = loadMistakes()
  const merged: Record<string, { mistakes: number; attempts: number; lastMistakeAt?: number; lastSeenAt?: number }> = {
    ...existing,
  }

  for (const [word, stats] of Object.entries(snapshot.data.mistakes)) {
    const current = existing[word]
    const nextMistakes = Math.max(current?.mistakes ?? 0, stats.mistakes)
    const nextAttempts = Math.max(current?.attempts ?? 0, stats.attempts)
    const nextLastMistake = Math.max(current?.lastMistakeAt ?? 0, stats.lastMistakeAt ?? 0)
    const nextLastSeen = Math.max(current?.lastSeenAt ?? 0, stats.lastSeenAt ?? 0)

    merged[word] = {
      mistakes: nextMistakes,
      attempts: nextAttempts,
      lastMistakeAt: nextLastMistake || undefined,
      lastSeenAt: nextLastSeen || undefined,
    }
  }

  saveMistakes(merged)
}
