import { useState, useCallback } from 'react';
import type { MetaState, LifetimeStats } from '../types/state';

const STORAGE_KEY = 'lastScrap_meta';

function createDefaultMetaState(): MetaState {
  return {
    securedScrap: 0,
    upgradeLevels: {},
    lifetimeStats: {
      totalRuns: 0,
      totalCashouts: 0,
      totalDeaths: 0,
      totalRigOverruns: 0,
      highestWave: 0,
      lifetimeScrapEarned: 0,
    },
    settings: {},
  };
}

function loadMetaState(): MetaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MetaState>;
      const defaults = createDefaultMetaState();
      return {
        securedScrap: parsed.securedScrap ?? defaults.securedScrap,
        upgradeLevels: parsed.upgradeLevels ?? defaults.upgradeLevels,
        lifetimeStats: { ...defaults.lifetimeStats, ...(parsed.lifetimeStats ?? {}) },
        settings: parsed.settings ?? defaults.settings,
      };
    }
  } catch {
    // ignore parse errors
  }
  return createDefaultMetaState();
}

function saveMetaState(state: MetaState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useMetaState() {
  const [metaState, setMetaStateInternal] = useState<MetaState>(loadMetaState);

  const setMetaState = useCallback((updater: MetaState | ((prev: MetaState) => MetaState)) => {
    setMetaStateInternal((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveMetaState(next);
      return next;
    });
  }, []);

  const addSecuredScrap = useCallback((amount: number) => {
    setMetaState((prev) => ({
      ...prev,
      securedScrap: prev.securedScrap + Math.max(0, amount),
      lifetimeStats: {
        ...prev.lifetimeStats,
        lifetimeScrapEarned: prev.lifetimeStats.lifetimeScrapEarned + Math.max(0, amount),
      },
    }));
  }, [setMetaState]);

  const spendSecuredScrap = useCallback((amount: number) => {
    setMetaState((prev) => ({
      ...prev,
      securedScrap: Math.max(0, prev.securedScrap - amount),
    }));
  }, [setMetaState]);

  const setUpgradeLevel = useCallback((upgradeId: string, level: number) => {
    setMetaState((prev) => ({
      ...prev,
      upgradeLevels: { ...prev.upgradeLevels, [upgradeId]: level },
    }));
  }, [setMetaState]);

  const incrementStat = useCallback((stat: keyof LifetimeStats) => {
    setMetaState((prev) => ({
      ...prev,
      lifetimeStats: {
        ...prev.lifetimeStats,
        [stat]: prev.lifetimeStats[stat] + 1,
      },
    }));
  }, [setMetaState]);

  const setHighestWaveIfNeeded = useCallback((wave: number) => {
    setMetaState((prev) => {
      if (wave <= prev.lifetimeStats.highestWave) return prev;
      return {
        ...prev,
        lifetimeStats: { ...prev.lifetimeStats, highestWave: wave },
      };
    });
  }, [setMetaState]);

  return {
    metaState,
    setMetaState,
    addSecuredScrap,
    spendSecuredScrap,
    setUpgradeLevel,
    incrementStat,
    setHighestWaveIfNeeded,
  };
}
