import type { EndType } from './data';

export type TopLevelState =
  | 'title'
  | 'pre_run_loadout'
  | 'in_run'
  | 'end_of_run_summary'
  | 'upgrade_screen';

export type InRunSubstate =
  | 'run_start'
  | 'wave_active'
  | 'cashout_window'
  | 'player_death_resolution'
  | 'rig_overrun_resolution'
  | 'pause';

export interface LifetimeStats {
  totalRuns: number;
  totalCashouts: number;
  totalDeaths: number;
  totalRigOverruns: number;
  highestWave: number;
  lifetimeScrapEarned: number;
}

export interface MetaState {
  securedScrap: number;
  upgradeLevels: Record<string, number>;
  lifetimeStats: LifetimeStats;
  settings: Record<string, string | number | boolean>;
}

export interface PlayerRunState {
  currentHealth: number;
  maxHealth: number;
  attack: number;
  defense: number;
  moveSpeed: number;
  attackIntervalSeconds: number;
  isDead: boolean;
}

export interface RigRunState {
  currentIntegrity: number;
  maxIntegrity: number;
  defense: number;
  passiveScrapTickValue: number;
  passiveScrapTickIntervalSeconds: number;
  isOverrun: boolean;
}

export interface RunState {
  topLevelState: TopLevelState;
  inRunSubstate: InRunSubstate;
  waveIndex: number;
  unsecuredScrap: number;
  bankedScrapFromRun: number;
  lostScrapFromRun: number;
  causeOfFailure: EndType | null;
  cashoutWindowOpen: boolean;
  enemiesAliveCount: number;
  elapsedRunTimeSeconds: number;
  player: PlayerRunState;
  rig: RigRunState;
}
