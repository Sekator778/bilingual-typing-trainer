import type { Preset } from './presets'

export const isPresetCompleteByWords = (preset: Preset, wordsCompleted: number) => {
  return preset.kind === 'byWords' && wordsCompleted >= preset.targetWords
}

export const isPresetCompleteByTime = (preset: Preset, elapsedMs: number) => {
  return preset.kind === 'byTime' && elapsedMs >= preset.durationMs
}
