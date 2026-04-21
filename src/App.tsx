import React, { useState } from 'react';
import type { AppState } from './app/types';
import type { RunSummary } from './app/game/GameEngine';
import type { MetaState } from './types/state';
import { loadMeta, saveMeta, createDefaultMeta } from './app/persistence/localStorage';
import TitleScreen from './app/screens/TitleScreen';
import LoadoutScreen from './app/screens/LoadoutScreen';
import ArenaScreen from './app/screens/ArenaScreen';
import EndOfRunScreen from './app/screens/EndOfRunScreen';
import UpgradeScreen from './app/screens/UpgradeScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => ({
    screen: 'title',
    meta: loadMeta() ?? createDefaultMeta(),
    lastRunSummary: null,
    startAtWave: 1,
  }));

  function updateMeta(next: MetaState) {
    saveMeta(next);
    setAppState((s) => ({ ...s, meta: next }));
  }

  function goToScreen(screen: AppState['screen']) {
    setAppState((s) => ({ ...s, screen }));
  }

  switch (appState.screen) {
    case 'title':
      return <TitleScreen
        onStartRun={() => goToScreen('loadout')}
        onOpenUpgrades={() => goToScreen('upgrades')}
        meta={appState.meta}
      />;
    case 'loadout':
      return <LoadoutScreen
        meta={appState.meta}
        onBeginRun={(startWave) => setAppState((s) => ({ ...s, screen: 'arena', startAtWave: startWave }))}
        onBack={() => goToScreen('title')}
      />;
    case 'arena':
      return <ArenaScreen
        meta={appState.meta}
        startAtWave={appState.startAtWave}
        onRunEnd={(summary: RunSummary, highestWave: number) => {
          const nextMeta: MetaState = {
            ...appState.meta,
            securedScrap: appState.meta.securedScrap + summary.scrapBanked,
            lifetimeStats: {
              ...appState.meta.lifetimeStats,
              totalRuns: appState.meta.lifetimeStats.totalRuns + 1,
              totalCashouts: appState.meta.lifetimeStats.totalCashouts + (summary.endReason === 'cash_out' ? 1 : 0),
              totalDeaths: appState.meta.lifetimeStats.totalDeaths + (summary.endReason === 'player_death' ? 1 : 0),
              totalRigOverruns: appState.meta.lifetimeStats.totalRigOverruns + (summary.endReason === 'rig_overrun' ? 1 : 0),
              highestWave: Math.max(appState.meta.lifetimeStats.highestWave, highestWave),
            },
          };
          saveMeta(nextMeta);
          setAppState((s) => ({ ...s, screen: 'end_of_run', meta: nextMeta, lastRunSummary: summary }));
        }}
      />;
    case 'end_of_run':
      return <EndOfRunScreen
        summary={appState.lastRunSummary!}
        meta={appState.meta}
        onPlayAgain={() => goToScreen('loadout')}
        onUpgrades={() => goToScreen('upgrades')}
        onTitle={() => goToScreen('title')}
      />;
    case 'upgrades':
      return <UpgradeScreen
        meta={appState.meta}
        onUpdateMeta={updateMeta}
        onBack={() => goToScreen('title')}
      />;
    default:
      return null;
  }
}
