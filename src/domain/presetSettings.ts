import type { Preset } from './presets'
import { getPresetId, getPresetById, isPreset } from './presets'

const STORAGE_KEY = 'typing.preset.v1'
const DEFAULT_PRESET: Preset = { kind: 'infinite' }

export const getPreset = (): Preset => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_PRESET
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_PRESET
    }
    const parsed = JSON.parse(stored)
    if (isPreset(parsed)) {
      return parsed
    }
    if (typeof parsed === 'string') {
      return getPresetById(parsed as never)
    }
    return DEFAULT_PRESET
  } catch {
    return DEFAULT_PRESET
  }
}

export const setPreset = (preset: Preset) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preset))
  } catch {
    return
  }
}

export const getPresetIdFromStorage = () => {
  return getPresetId(getPreset())
}
