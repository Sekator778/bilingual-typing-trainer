import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TRANSLATION_PLACEHOLDER } from './domain/translationProvider'

vi.mock('./data/raw/google-10000-english.txt?raw', () => ({
  default: 'untranslated\n',
}))

afterEach(() => {
  cleanup()
})

const renderTrainingScreen = async () => {
  const { default: TrainingScreen } = await import('./TrainingScreen')
  return render(<TrainingScreen onShowHistory={vi.fn()} />)
}

describe('TrainingScreen', () => {
  it('renders the typing area and target word', async () => {
    await renderTrainingScreen()

    const input = screen.getByLabelText(/typing area/i)
    expect(input).toBeTruthy()

    const wordContainer = document.querySelector('.word')
    const chars = document.querySelectorAll('.char')
    expect(wordContainer).not.toBeNull()
    expect(chars.length).toBeGreaterThan(0)
  })

  it('shows placeholder when translation is missing', async () => {
    const { container } = await renderTrainingScreen()

    const translation = within(container).getByTestId('translation')
    expect(translation.textContent).toBe(TRANSLATION_PLACEHOLDER)
  })
})
