export interface PronunciationProvider {
  isAvailable(): boolean
  speak(text: string): void
  cancel(): void
}
