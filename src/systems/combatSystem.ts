import { EventBus } from '../core/eventBus';
import { GAME_EVENTS } from '../core/events';

export interface CombatantStats {
  attack: number;
  defense: number;
}

export class CombatSystem {
  constructor(private readonly eventBus: EventBus) {}

  calculateDamage(attacker: CombatantStats, target: CombatantStats): number {
    return Math.max(1, attacker.attack - target.defense);
  }

  resolveHit(attackerId: string, targetId: string, attacker: CombatantStats, target: CombatantStats): number {
    const damage = this.calculateDamage(attacker, target);
    this.eventBus.emit(GAME_EVENTS.ENTITY_DAMAGED, {
      attackerId,
      targetId,
      damage,
    });
    return damage;
  }
}
