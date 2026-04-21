import { balanceConstants } from '../data/loaders';
import { EventBus } from '../core/eventBus';
import { GAME_EVENTS } from '../core/events';
import type { EndType } from '../types/data';

export interface RunResolution {
  endType: EndType;
  unsecuredScrapBeforeResolution: number;
  lostScrap: number;
  bankedScrap: number;
}

export class EconomySystem {
  constructor(private readonly eventBus: EventBus) {}

  calculateWaveReward(waveNumber: number): number {
    const formula = balanceConstants.economy.wave_reward_formula;
    return formula.base + ((waveNumber - 1) * formula.step_per_wave);
  }

  resolveRunEnd(endType: EndType, unsecuredScrap: number): RunResolution {
    const safeUnsecured = Math.max(0, unsecuredScrap);
    const lossPercent = this.getLossPercent(endType);
    const lostScrap = Math.floor(safeUnsecured * lossPercent);
    const bankedScrap = safeUnsecured - lostScrap;

    if (bankedScrap > 0) {
      this.eventBus.emit(GAME_EVENTS.SCRAP_BANKED, { amount: bankedScrap, endType });
    }
    if (lostScrap > 0) {
      this.eventBus.emit(GAME_EVENTS.SCRAP_LOST, { amount: lostScrap, endType });
    }

    return {
      endType,
      unsecuredScrapBeforeResolution: safeUnsecured,
      lostScrap,
      bankedScrap,
    };
  }

  private getLossPercent(endType: EndType): number {
    switch (endType) {
      case 'cash_out':
        return 1 - balanceConstants.economy.cash_out_bank_percent;
      case 'rig_overrun':
        return balanceConstants.economy.rig_overrun_loss_percent;
      case 'player_death':
        return balanceConstants.economy.player_death_loss_percent;
      case 'surrender':
        return balanceConstants.economy.surrender_loss_percent;
    }
  }
}
