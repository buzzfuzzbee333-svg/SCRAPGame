import { EventBus } from './eventBus';
import { GAME_EVENTS } from './events';
import { RunStateStore, createDefaultRunState } from '../stores/runStateStore';
import type { InRunSubstate, TopLevelState } from '../types/state';

export class GameStateController {
  constructor(
    private readonly runStateStore: RunStateStore,
    private readonly eventBus: EventBus,
  ) {}

  goToTopLevelState(nextState: TopLevelState): void {
    this.runStateStore.update((current) => ({
      ...current,
      topLevelState: nextState,
    }));
  }

  setInRunSubstate(nextSubstate: InRunSubstate): void {
    this.runStateStore.update((current) => ({
      ...current,
      inRunSubstate: nextSubstate,
      cashoutWindowOpen: nextSubstate === 'cashout_window',
    }));
  }

  beginRun(): void {
    const fresh = createDefaultRunState();
    fresh.topLevelState = 'in_run';
    fresh.inRunSubstate = 'wave_active';
    this.runStateStore.setState(fresh);
    this.eventBus.emit(GAME_EVENTS.RUN_STARTED, { wave: fresh.waveIndex });
    this.eventBus.emit(GAME_EVENTS.WAVE_STARTED, { wave: fresh.waveIndex });
  }

  openCashoutWindow(): void {
    this.setInRunSubstate('cashout_window');
    this.eventBus.emit(GAME_EVENTS.CASHOUT_WINDOW_OPENED, {
      wave: this.runStateStore.getState().waveIndex,
    });
  }

  pauseRun(): void {
    this.setInRunSubstate('pause');
    this.eventBus.emit(GAME_EVENTS.RUN_PAUSED, {});
  }

  resumeRun(): void {
    this.setInRunSubstate('wave_active');
    this.eventBus.emit(GAME_EVENTS.RUN_RESUMED, {});
  }
}
