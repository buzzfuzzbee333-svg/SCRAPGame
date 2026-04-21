import type { PlayerRunState } from '../types/state';

export class PlayerSystem {
  applyDamage(player: PlayerRunState, damage: number): PlayerRunState {
    const nextHealth = Math.max(0, player.currentHealth - Math.max(0, damage));
    return {
      ...player,
      currentHealth: nextHealth,
      isDead: nextHealth === 0,
    };
  }

  healToFull(player: PlayerRunState): PlayerRunState {
    return {
      ...player,
      currentHealth: player.maxHealth,
      isDead: false,
    };
  }
}
