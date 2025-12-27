export type Preset =
  | { kind: 'infinite' }
  | { kind: 'byWords'; targetWords: number }
  | { kind: 'byTime'; durationMs: number }

export type SessionOutcome = 'completed' | 'interrupted'

export type PresetId = 'infinite' | '25w' | '50w' | '100w' | '3m' | '5m' | '10m'

export type PresetOption = {
  id: PresetId
  label: string
  preset: Preset
}

export const PRESET_OPTIONS: PresetOption[] = [
  { id: 'infinite', label: 'Infinite', preset: { kind: 'infinite' } },
  { id: '25w', label: '25 words', preset: { kind: 'byWords', targetWords: 25 } },
  { id: '50w', label: '50 words', preset: { kind: 'byWords', targetWords: 50 } },
  { id: '100w', label: '100 words', preset: { kind: 'byWords', targetWords: 100 } },
  { id: '3m', label: '3 min', preset: { kind: 'byTime', durationMs: 3 * 60 * 1000 } },
  { id: '5m', label: '5 min', preset: { kind: 'byTime', durationMs: 5 * 60 * 1000 } },
  { id: '10m', label: '10 min', preset: { kind: 'byTime', durationMs: 10 * 60 * 1000 } },
]

export const isPreset = (value: unknown): value is Preset => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  if (record.kind === 'infinite') {
    return true
  }
  if (record.kind === 'byWords') {
    return typeof record.targetWords === 'number' && record.targetWords > 0
  }
  if (record.kind === 'byTime') {
    return typeof record.durationMs === 'number' && record.durationMs > 0
  }
  return false
}

export const getPresetById = (id: PresetId): Preset => {
  const match = PRESET_OPTIONS.find((option) => option.id === id)
  return match?.preset ?? { kind: 'infinite' }
}

export const getPresetId = (preset: Preset): PresetId => {
  const match = PRESET_OPTIONS.find((option) => isSamePreset(option.preset, preset))
  return match?.id ?? 'infinite'
}

export const formatPresetLabel = (preset: Preset): string => {
  if (preset.kind === 'infinite') {
    return '∞'
  }
  if (preset.kind === 'byWords') {
    return `${preset.targetWords} words`
  }
  const minutes = Math.round(preset.durationMs / 60000)
  return `${minutes} min`
}

const isSamePreset = (a: Preset, b: Preset) => {
  if (a.kind !== b.kind) {
    return false
  }
  if (a.kind === 'infinite' && b.kind === 'infinite') {
    return true
  }
  if (a.kind === 'byWords' && b.kind === 'byWords') {
    return a.targetWords === b.targetWords
  }
  if (a.kind === 'byTime' && b.kind === 'byTime') {
    return a.durationMs === b.durationMs
  }
  return false
}
