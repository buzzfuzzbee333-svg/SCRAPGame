import type { MetaState } from '../../types/state';

const SAVE_KEY = 'last_scrap_meta_v1';

export function loadMeta(): MetaState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MetaState;
  } catch {
    return null;
  }
}

export function saveMeta(state: MetaState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable
  }
}

export function clearMeta(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function createDefaultMeta(): MetaState {
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
