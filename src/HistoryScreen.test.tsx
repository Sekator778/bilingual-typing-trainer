import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StatsSnapshot } from './domain/statsModule'
import { appendSession } from './domain/sessionStore'
import HistoryScreen from './HistoryScreen'
import { buildExportSnapshot } from './domain/exportSnapshot'

vi.mock('./domain/exportSnapshot', () => ({
  buildExportSnapshot: vi.fn(() => ({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.0.0',
    data: {
      settings: {
        level: 'B1',
        mode: 'normal',
        preset: { kind: 'infinite' },
        translationLang: 'ru',
        autoAdvance: false,
        autoSpeak: false,
      },
      history: [],
      mistakes: {},
    },
  })),
}))

describe('HistoryScreen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders an empty state when no sessions exist', () => {
    render(<HistoryScreen onBack={vi.fn()} />)

    const emptyState = screen.getByTestId('history-empty')
    expect(emptyState).toBeTruthy()
    expect(screen.getByRole('button', { name: /export progress/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /import progress/i })).toBeTruthy()
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

    appendSession({
      ...snapshot,
      preset: { kind: 'byWords', targetWords: 25 },
      outcome: 'completed',
      level: 'B1',
      mode: 'normal',
    })

    render(<HistoryScreen onBack={vi.fn()} />)

    const list = screen.getByTestId('history-list')
    expect(list).toBeTruthy()
    expect(screen.getByText('WPM 5')).toBeTruthy()
    expect(screen.getByText('Accuracy 80%')).toBeTruthy()
  })

  it('builds export snapshot on export click', () => {
    render(<HistoryScreen onBack={vi.fn()} />)

    if (!URL.createObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', {
        value: () => 'blob:mock',
        writable: true,
      })
    }
    if (!URL.revokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: () => {},
        writable: true,
      })
    }
    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.spyOn(document, 'createElement')
    const linkMock = {
      click: vi.fn(),
      set href(_value: string) {},
      set download(_value: string) {},
    }
    clickSpy.mockReturnValue(linkMock as never)

    screen.getByRole('button', { name: /export progress/i }).click()

    expect(buildExportSnapshot).toHaveBeenCalled()
    expect(createObjectUrlSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()

    createObjectUrlSpy.mockRestore()
    revokeSpy.mockRestore()
    clickSpy.mockRestore()
  })
})
