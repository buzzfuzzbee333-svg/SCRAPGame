import { getUpgradeDefinition } from '../data/loaders';
import type { MetaState, PlayerRunState, RigRunState } from '../types/state';

export class ProgressionSystem {
  getUpgradeLevel(metaState: MetaState, upgradeId: string): number {
    return metaState.upgradeLevels[upgradeId] ?? 0;
  }

  getUpgradeCost(metaState: MetaState, upgradeId: string): number {
    const definition = getUpgradeDefinition(upgradeId);
    const currentLevel = this.getUpgradeLevel(metaState, upgradeId);
    return definition.base_cost + (currentLevel * definition.cost_step);
  }

  canPurchase(metaState: MetaState, upgradeId: string): boolean {
    const definition = getUpgradeDefinition(upgradeId);
    const currentLevel = this.getUpgradeLevel(metaState, upgradeId);
    if (currentLevel >= definition.level_cap) {
      return false;
    }
    return metaState.securedScrap >= this.getUpgradeCost(metaState, upgradeId);
  }

  applyUpgradesToRunState(metaState: MetaState, player: PlayerRunState, rig: RigRunState): {
    player: PlayerRunState;
    rig: RigRunState;
  } {
    const nextPlayer = { ...player };
    const nextRig = { ...rig };

    for (const [upgradeId, level] of Object.entries(metaState.upgradeLevels)) {
      const definition = getUpgradeDefinition(upgradeId);
      switch (definition.effect_type) {
        case 'player_attack_flat':
          nextPlayer.attack += definition.effect_per_level * level;
          break;
        case 'player_attack_interval_delta':
          nextPlayer.attackIntervalSeconds += definition.effect_per_level * level;
          break;
        case 'player_max_health_flat':
          nextPlayer.maxHealth += definition.effect_per_level * level;
          nextPlayer.currentHealth = nextPlayer.maxHealth;
          break;
        case 'player_defense_flat':
          nextPlayer.defense += definition.effect_per_level * level;
          break;
        case 'player_move_speed_flat':
          nextPlayer.moveSpeed += definition.effect_per_level * level;
          break;
        case 'rig_max_integrity_flat':
          nextRig.maxIntegrity += definition.effect_per_level * level;
          nextRig.currentIntegrity = nextRig.maxIntegrity;
          break;
        case 'rig_defense_flat':
          nextRig.defense += definition.effect_per_level * level;
          break;
        case 'rig_passive_scrap_step':
          if (definition.step_interval_levels) {
            const appliedSteps = Math.floor(level / definition.step_interval_levels);
            nextRig.passiveScrapTickValue += appliedSteps * definition.effect_per_level;
          }
          break;
        default:
          break;
      }
    }

    return { player: nextPlayer, rig: nextRig };
  }
}
