import type { Preset } from './presets'
import type { TrainingMode } from './trainingMode'
import type { TranslationLanguage } from './translationTypes'
import type { MistakesMap } from './mistakesStore'
import { loadMistakes } from './mistakesStore'
import { loadSessions } from './sessionStore'
import { getSelectedLevel } from './levelSettings'
import { getTrainingMode } from './modeSettings'
import { getPreset } from './presetSettings'
import { loadTranslationLanguage } from './translationSettings'
import { loadAutoAdvance } from './trainingSettings'
import { loadAutoSpeak } from './pronunciationSettings'
import type { SessionRecord } from './sessionStore'

export type ExportSettings = {
  level: string
  mode: TrainingMode
  preset: Preset
  translationLang: TranslationLanguage
  autoAdvance: boolean
  autoSpeak: boolean
}

export type ExportSnapshot = {
  schemaVersion: number
  exportedAt: string
  appVersion: string
  data: {
    settings: ExportSettings
    history: SessionRecord[]
    mistakes: MistakesMap
  }
}

const SCHEMA_VERSION = 1
const DEFAULT_APP_VERSION = '0.0.0'

export const buildExportSnapshot = (): ExportSnapshot => {
  const { sessions } = loadSessions()
  const settings: ExportSettings = {
    level: getSelectedLevel(),
    mode: getTrainingMode(),
    preset: getPreset(),
    translationLang: loadTranslationLanguage(),
    autoAdvance: loadAutoAdvance(),
    autoSpeak: loadAutoSpeak(),
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: import.meta.env?.VITE_APP_VERSION ?? DEFAULT_APP_VERSION,
    data: {
      settings,
      history: sessions,
      mistakes: loadMistakes(),
    },
  }
}
