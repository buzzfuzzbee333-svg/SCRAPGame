import { getWaveRule } from '../data/loaders';
import { EventBus } from '../core/eventBus';
import { GAME_EVENTS } from '../core/events';

export class WaveSystem {
  constructor(private readonly eventBus: EventBus) {}

  getWaveComposition(waveNumber: number): Record<string, number> {
    return getWaveRule(waveNumber).enemies;
  }

  getWaveReward(waveNumber: number): number {
    return getWaveRule(waveNumber).wave_reward;
  }

  startWave(waveNumber: number): void {
    this.eventBus.emit(GAME_EVENTS.WAVE_STARTED, {
      wave: waveNumber,
      composition: this.getWaveComposition(waveNumber),
    });
  }

  handleWaveCleared(waveNumber: number): void {
    this.eventBus.emit(GAME_EVENTS.WAVE_CLEARED, {
      wave: waveNumber,
      reward: this.getWaveReward(waveNumber),
    });
    this.eventBus.emit(GAME_EVENTS.CASHOUT_WINDOW_OPENED, {
      wave: waveNumber,
    });
  }
}
