import type { MetaState } from '../types/state';
import type { RunSummary } from './game/GameEngine';

export type AppScreen = 'title' | 'loadout' | 'arena' | 'end_of_run' | 'upgrades';

export interface AppState {
  screen: AppScreen;
  meta: MetaState;
  lastRunSummary: RunSummary | null;
  startAtWave: number;
}
