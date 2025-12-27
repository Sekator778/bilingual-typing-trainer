import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./domain/packRegistry', () => ({
  getPackNames: () => ['TECH'],
  getPackRaw: (level: string) => (level === 'TECH' ? 'socket\nserver\n' : ''),
  formatPackLabel: (level: string) => level,
}))

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('starts training with the selected level pack', () => {
    render(<App />)

    const select = screen.getByLabelText(/level/i)
    fireEvent.change(select, { target: { value: 'TECH' } })

    const startButton = screen.getByRole('button', { name: /start training/i })
    fireEvent.click(startButton)

    const levelLabel = screen.getByText(/Level: TECH/i)
    expect(levelLabel).toBeTruthy()

    const word = screen.getByTestId('target-word').textContent
    expect(['socket', 'server']).toContain(word)
  })
})
