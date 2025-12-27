import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordWordResult } from './domain/mistakesStore'
import SetupScreen from './SetupScreen'

vi.mock('./domain/packRegistry', () => ({
  getPackNames: () => ['B1'],
  getPackRaw: () => 'alpha\nbeta\n',
  formatPackLabel: (level: string) => level,
}))

describe('SetupScreen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('blocks start when mistakes mode has no mistakes', () => {
    const onStart = vi.fn()
    render(<SetupScreen onStart={onStart} onShowHistory={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /mistakes only/i }))
    fireEvent.click(screen.getByRole('button', { name: /start training/i }))

    expect(onStart).not.toHaveBeenCalled()
    expect(screen.getByText(/no mistakes recorded/i)).toBeTruthy()
  })

  it('starts mistakes mode when mistakes exist', () => {
    recordWordResult('alpha', 1)
    const onStart = vi.fn()
    render(<SetupScreen onStart={onStart} onShowHistory={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /mistakes only/i }))
    fireEvent.click(screen.getByRole('button', { name: /start training/i }))

    expect(onStart).toHaveBeenCalledWith('B1', 'mistakes')
  })
})
