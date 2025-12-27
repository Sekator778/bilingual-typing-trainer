import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StatsSnapshot } from './domain/statsModule'
import { appendSession } from './domain/sessionStore'
import HistoryScreen from './HistoryScreen'

describe('HistoryScreen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders an empty state when no sessions exist', () => {
    render(<HistoryScreen onBack={vi.fn()} />)

    const emptyState = screen.getByTestId('history-empty')
    expect(emptyState).toBeTruthy()
  })

  it('renders one stored session', () => {
    const snapshot: StatsSnapshot = {
      startedAt: 0,
      endedAt: 60000,
      durationMs: 60000,
      typedChars: 25,
      correctChars: 20,
      errors: 5,
      wordsCompleted: 5,
      wordsAttempted: 5,
      wpm: 5,
      accuracy: 0.8,
    }

    appendSession(snapshot)

    render(<HistoryScreen onBack={vi.fn()} />)

    const list = screen.getByTestId('history-list')
    expect(list).toBeTruthy()
    expect(screen.getByText('WPM 5')).toBeTruthy()
    expect(screen.getByText('Accuracy 80%')).toBeTruthy()
  })
})
