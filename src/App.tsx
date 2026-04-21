import React from 'react'
import { GameProvider, useGame } from './GameContext'
import TitleScreen from './screens/TitleScreen'
import PreRunScreen from './screens/PreRunScreen'
import ArenaScreen from './screens/ArenaScreen'
import EndOfRunScreen from './screens/EndOfRunScreen'
import UpgradeScreen from './screens/UpgradeScreen'

function GameRouter() {
  const { screen } = useGame()
  switch (screen) {
    case 'title': return <TitleScreen />
    case 'pre_run': return <PreRunScreen />
    case 'in_run': return <ArenaScreen />
    case 'end_of_run': return <EndOfRunScreen />
    case 'upgrades': return <UpgradeScreen />
    default: return <TitleScreen />
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
