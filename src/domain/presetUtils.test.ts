import { describe, expect, it } from 'vitest'
import type { Preset } from './presets'
import { isPresetCompleteByTime, isPresetCompleteByWords } from './presetUtils'

describe('presetUtils', () => {
  it('completes by words when target reached', () => {
    const preset: Preset = { kind: 'byWords', targetWords: 25 }
    expect(isPresetCompleteByWords(preset, 24)).toBe(false)
    expect(isPresetCompleteByWords(preset, 25)).toBe(true)
  })

  it('completes by time when duration reached', () => {
    const preset: Preset = { kind: 'byTime', durationMs: 3 * 60 * 1000 }
    expect(isPresetCompleteByTime(preset, 1000)).toBe(false)
    expect(isPresetCompleteByTime(preset, 3 * 60 * 1000)).toBe(true)
  })
})
