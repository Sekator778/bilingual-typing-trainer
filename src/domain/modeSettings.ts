import type { TrainingMode } from './trainingMode'

const STORAGE_KEY = 'typing.mode.v1'
const DEFAULT_MODE: TrainingMode = 'normal'

const isTrainingMode = (value: string): value is TrainingMode =>
  value === 'normal' || value === 'mistakes'

export const getTrainingMode = (): TrainingMode => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_MODE
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_MODE
    }
    return isTrainingMode(stored) ? stored : DEFAULT_MODE
  } catch {
    return DEFAULT_MODE
  }
}

export const setTrainingMode = (mode: TrainingMode) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    return
  }
}
