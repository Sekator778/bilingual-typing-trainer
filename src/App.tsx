import { useState } from 'react'
import './App.css'
import HistoryScreen from './HistoryScreen'
import TrainingScreen from './TrainingScreen'

function App() {
  const [view, setView] = useState<'training' | 'history'>('training')

  return view === 'training' ? (
    <TrainingScreen onShowHistory={() => setView('history')} />
  ) : (
    <HistoryScreen onBack={() => setView('training')} />
  )
}

export default App
