export type TrainingMode = 'normal' | 'mistakes'

export const TRAINING_MODES: TrainingMode[] = ['normal', 'mistakes']

export const TRAINING_MODE_LABELS: Record<TrainingMode, string> = {
  normal: 'Normal',
  mistakes: 'Mistakes only',
}
