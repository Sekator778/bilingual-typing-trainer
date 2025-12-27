import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TrainingScreen from './TrainingScreen'

describe('TrainingScreen', () => {
  it('renders the typing area and target word', () => {
    render(<TrainingScreen />)

    const input = screen.getByLabelText(/typing area/i)
    expect(input).toBeTruthy()

    const wordContainer = document.querySelector('.word')
    const chars = document.querySelectorAll('.char')
    expect(wordContainer).not.toBeNull()
    expect(chars.length).toBeGreaterThan(0)
  })
})
