import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { MetaState, LifetimeStats } from './types/state'
import type { EndType } from './types/data'
import { loadMeta, saveMeta } from './persistence/localStorageAdapter'

export type Screen = 'title' | 'pre_run' | 'in_run' | 'end_of_run' | 'upgrades'

export interface RunEndResult {
  endType: EndType
  unsecuredBefore: number
  lostScrap: number
  bankedScrap: number
  highestWave: number
}

interface GameContextValue {
  meta: MetaState
  screen: Screen
  lastRunResult: RunEndResult | null
  goToTitle: () => void
  goToPreRun: () => void
  goToRun: () => void
  goToUpgrades: () => void
  finishRun: (result: RunEndResult) => void
  addSecuredScrap: (amount: number) => void
  spendSecuredScrap: (amount: number) => boolean
  setUpgradeLevel: (id: string, level: number) => void
}

function defaultLifetimeStats(): LifetimeStats {
  return { totalRuns: 0, totalCashouts: 0, totalDeaths: 0, totalRigOverruns: 0, highestWave: 0, lifetimeScrapEarned: 0 }
}

function defaultMeta(): MetaState {
  return { securedScrap: 0, upgradeLevels: {}, lifetimeStats: defaultLifetimeStats(), settings: {} }
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<MetaState>(() => {
    const saved = loadMeta()
    return saved ?? defaultMeta()
  })
  const [screen, setScreen] = useState<Screen>('title')
  const [lastRunResult, setLastRunResult] = useState<RunEndResult | null>(null)

  useEffect(() => { saveMeta(meta) }, [meta])

  const goToTitle = useCallback(() => setScreen('title'), [])
  const goToPreRun = useCallback(() => setScreen('pre_run'), [])
  const goToRun = useCallback(() => setScreen('in_run'), [])
  const goToUpgrades = useCallback(() => setScreen('upgrades'), [])

  const finishRun = useCallback((result: RunEndResult) => {
    setLastRunResult(result)
    setMeta(prev => {
      const stats = { ...prev.lifetimeStats }
      stats.totalRuns += 1
      stats.lifetimeScrapEarned += result.bankedScrap
      if (result.endType === 'cash_out') stats.totalCashouts += 1
      if (result.endType === 'player_death') stats.totalDeaths += 1
      if (result.endType === 'rig_overrun') stats.totalRigOverruns += 1
      if (result.highestWave > stats.highestWave) stats.highestWave = result.highestWave
      return {
        ...prev,
        securedScrap: prev.securedScrap + result.bankedScrap,
        lifetimeStats: stats,
      }
    })
    setScreen('end_of_run')
  }, [])

  const addSecuredScrap = useCallback((amount: number) => {
    setMeta(prev => ({ ...prev, securedScrap: prev.securedScrap + amount }))
  }, [])

  const spendSecuredScrap = useCallback((amount: number): boolean => {
    let ok = false
    setMeta(prev => {
      if (prev.securedScrap < amount) return prev
      ok = true
      return { ...prev, securedScrap: prev.securedScrap - amount }
    })
    return ok
  }, [])

  const setUpgradeLevel = useCallback((id: string, level: number) => {
    setMeta(prev => ({ ...prev, upgradeLevels: { ...prev.upgradeLevels, [id]: level } }))
  }, [])

  return (
    <GameContext.Provider value={{ meta, screen, lastRunResult, goToTitle, goToPreRun, goToRun, goToUpgrades, finishRun, addSecuredScrap, spendSecuredScrap, setUpgradeLevel }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
