import { useCallback, useEffect, useState } from 'react'
import './App.css'
import HistoryScreen from './HistoryScreen'
import SetupScreen from './SetupScreen'
import TrainingScreen from './TrainingScreen'
import { getSelectedLevel } from './domain/levelSettings'
import type { TrainingMode } from './domain/trainingMode'

type Route = 'setup' | 'train' | 'history'

const getRouteFromPath = (pathname: string): Route => {
  if (pathname.startsWith('/history')) {
    return 'history'
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
  return '/'
}

function App() {
  const [route, setRoute] = useState<Route>(() =>
    getRouteFromPath(window.location.pathname),
  )
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('normal')

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

  if (route === 'train') {
    return (
      <TrainingScreen
        level={getSelectedLevel()}
        mode={trainingMode}
        onBackToSetup={() => navigate('setup')}
        onShowHistory={() => navigate('history')}
      />
    )
  }

  return (
    <SetupScreen
      onStart={(_, mode) => {
        setTrainingMode(mode)
        navigate('train')
      }}
      onShowHistory={() => navigate('history')}
    />
  )
}

export default App
