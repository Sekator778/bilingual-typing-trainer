import { useCallback, useEffect, useState } from 'react'
import './App.css'
import HistoryScreen from './HistoryScreen'
import SetupScreen from './SetupScreen'
import SummaryScreen from './SummaryScreen'
import TrainingScreen from './TrainingScreen'
import { getSelectedLevel } from './domain/levelSettings'
import type { TrainingMode } from './domain/trainingMode'
import type { Preset } from './domain/presets'
import { getPreset } from './domain/presetSettings'
import type { SessionRecordInput } from './domain/sessionStore'

type Route = 'setup' | 'train' | 'history' | 'summary'

const getRouteFromPath = (pathname: string): Route => {
  if (pathname.startsWith('/history')) {
    return 'history'
  }
  if (pathname.startsWith('/summary')) {
    return 'summary'
  }
  if (pathname.startsWith('/train')) {
    return 'train'
  }
  return 'setup'
}

const routeToPath = (route: Route) => {
  if (route === 'train') {
    return '/train'
  }
  if (route === 'history') {
    return '/history'
  }
  if (route === 'summary') {
    return '/summary'
  }
  return '/'
}

function App() {
  const [route, setRoute] = useState<Route>(() =>
    getRouteFromPath(window.location.pathname),
  )
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('normal')
  const [trainingPreset, setTrainingPreset] = useState<Preset>(() => getPreset())
  const [lastSession, setLastSession] = useState<SessionRecordInput | null>(null)

  const navigate = useCallback((nextRoute: Route) => {
    const path = routeToPath(nextRoute)
    window.history.pushState({}, '', path)
    setRoute(nextRoute)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (route === 'history') {
    return <HistoryScreen onBack={() => navigate('setup')} />
  }

  if (route === 'summary') {
    if (!lastSession) {
      return <HistoryScreen onBack={() => navigate('setup')} />
    }
    return (
      <SummaryScreen
        session={lastSession}
        onStartAgain={() => navigate('train')}
        onShowHistory={() => navigate('history')}
      />
    )
  }

  if (route === 'train') {
    return (
      <TrainingScreen
        level={getSelectedLevel()}
        mode={trainingMode}
        preset={trainingPreset}
        onBackToSetup={() => navigate('setup')}
        onShowHistory={() => navigate('history')}
        onSessionComplete={(record) => {
          setLastSession(record)
          setTrainingMode(record.mode ?? 'normal')
          setTrainingPreset(record.preset)
          navigate('summary')
        }}
      />
    )
  }

  return (
    <SetupScreen
      onStart={(_, mode, preset) => {
        setTrainingMode(mode)
        setTrainingPreset(preset)
        navigate('train')
      }}
      onShowHistory={() => navigate('history')}
    />
  )
}

export default App
