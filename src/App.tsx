import React, { useState, useCallback } from 'react';
import { useMetaState } from './app/useMetaState';
import TitleScreen from './screens/TitleScreen';
import PreRunScreen from './screens/PreRunScreen';
import ArenaScreen from './screens/ArenaScreen';
import SummaryScreen from './screens/SummaryScreen';
import UpgradeScreen from './screens/UpgradeScreen';
import type { TopLevelState } from './types/state';
import type { EndType } from './types/data';

interface RunSummary {
  endType: EndType;
  unsecuredScrapBefore: number;
  lostScrap: number;
  bankedScrap: number;
  highestWaveReached: number;
}

export default function App() {
  const [screen, setScreen] = useState<TopLevelState>('title');
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const {
    metaState,
    addSecuredScrap,
    spendSecuredScrap,
    setUpgradeLevel,
    incrementStat,
    setHighestWaveIfNeeded,
  } = useMetaState();

  const handleRunEnd = useCallback(
    (summary: RunSummary) => {
      if (summary.bankedScrap > 0) {
        addSecuredScrap(summary.bankedScrap);
      }
      setHighestWaveIfNeeded(summary.highestWaveReached);
      if (summary.endType === 'cash_out') {
        incrementStat('totalCashouts');
      } else if (summary.endType === 'player_death') {
        incrementStat('totalDeaths');
      } else if (summary.endType === 'rig_overrun') {
        incrementStat('totalRigOverruns');
      }
      incrementStat('totalRuns');
      setRunSummary(summary);
      setScreen('end_of_run_summary');
    },
    [addSecuredScrap, setHighestWaveIfNeeded, incrementStat]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {screen === 'title' && (
        <TitleScreen
          securedScrap={metaState.securedScrap}
          onStartRun={() => setScreen('pre_run_loadout')}
          onUpgrades={() => setScreen('upgrade_screen')}
        />
      )}
      {screen === 'pre_run_loadout' && (
        <PreRunScreen
          metaState={metaState}
          onBeginRun={() => setScreen('in_run')}
          onBack={() => setScreen('title')}
        />
      )}
      {screen === 'in_run' && (
        <ArenaScreen
          metaState={metaState}
          onRunEnd={handleRunEnd}
        />
      )}
      {screen === 'end_of_run_summary' && runSummary && (
        <SummaryScreen
          summary={runSummary}
          securedScrap={metaState.securedScrap}
          onContinue={() => setScreen('title')}
        />
      )}
      {screen === 'upgrade_screen' && (
        <UpgradeScreen
          metaState={metaState}
          onSpend={spendSecuredScrap}
          onSetUpgradeLevel={setUpgradeLevel}
          onBack={() => setScreen('title')}
        />
      )}
    </div>
  );
}
