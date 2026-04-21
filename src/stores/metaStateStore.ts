import type { LifetimeStats, MetaState } from '../types/state';

function createDefaultLifetimeStats(): LifetimeStats {
  return {
    totalRuns: 0,
    totalCashouts: 0,
    totalDeaths: 0,
    totalRigOverruns: 0,
    highestWave: 0,
    lifetimeScrapEarned: 0,
  };
}

export class MetaStateStore {
  private state: MetaState;

  constructor(initialState?: Partial<MetaState>) {
    this.state = {
      securedScrap: initialState?.securedScrap ?? 0,
      upgradeLevels: initialState?.upgradeLevels ?? {},
      lifetimeStats: initialState?.lifetimeStats ?? createDefaultLifetimeStats(),
      settings: initialState?.settings ?? {},
    };
  }

  getState(): MetaState {
    return this.state;
  }

  addSecuredScrap(amount: number): void {
    this.state.securedScrap += Math.max(0, amount);
    this.state.lifetimeStats.lifetimeScrapEarned += Math.max(0, amount);
  }

  spendSecuredScrap(amount: number): void {
    if (amount > this.state.securedScrap) {
      throw new Error('Not enough secured scrap to spend.');
    }
    this.state.securedScrap -= amount;
  }

  setUpgradeLevel(upgradeId: string, level: number): void {
    this.state.upgradeLevels[upgradeId] = level;
  }

  incrementStat(stat: keyof LifetimeStats): void {
    this.state.lifetimeStats[stat] += 1;
  }

  setHighestWaveIfNeeded(wave: number): void {
    if (wave > this.state.lifetimeStats.highestWave) {
      this.state.lifetimeStats.highestWave = wave;
    }
  }
}
