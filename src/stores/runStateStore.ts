import { balanceConstants } from '../data/loaders';
import type { RunState } from '../types/state';

export function createDefaultRunState(): RunState {
  return {
    topLevelState: 'title',
    inRunSubstate: 'run_start',
    waveIndex: 1,
    unsecuredScrap: 0,
    bankedScrapFromRun: 0,
    lostScrapFromRun: 0,
    causeOfFailure: null,
    cashoutWindowOpen: false,
    enemiesAliveCount: 0,
    elapsedRunTimeSeconds: 0,
    player: {
      currentHealth: balanceConstants.player_base.max_health,
      maxHealth: balanceConstants.player_base.max_health,
      attack: balanceConstants.player_base.attack,
      defense: balanceConstants.player_base.defense,
      moveSpeed: balanceConstants.player_base.move_speed,
      attackIntervalSeconds: balanceConstants.player_base.attack_interval_seconds,
      isDead: false,
    },
    rig: {
      currentIntegrity: balanceConstants.rig_base.max_integrity,
      maxIntegrity: balanceConstants.rig_base.max_integrity,
      defense: balanceConstants.rig_base.defense,
      passiveScrapTickValue: balanceConstants.rig_base.passive_scrap_tick_value,
      passiveScrapTickIntervalSeconds: balanceConstants.rig_base.passive_scrap_tick_interval_seconds,
      isOverrun: false,
    },
  };
}

export class RunStateStore {
  private state: RunState;

  constructor() {
    this.state = createDefaultRunState();
  }

  getState(): RunState {
    return this.state;
  }

  setState(nextState: RunState): void {
    this.state = nextState;
  }

  update(mutator: (current: RunState) => RunState): void {
    this.state = mutator(this.state);
  }

  reset(): void {
    this.state = createDefaultRunState();
  }
}
