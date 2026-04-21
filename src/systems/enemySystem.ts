import { getEnemyDefinition } from '../data/loaders';
import type { EnemyDefinition } from '../types/data';

export interface EnemyInstance {
  instanceId: string;
  definitionId: string;
  currentHealth: number;
  currentTarget: 'player' | 'rig';
}

export class EnemySystem {
  createEnemy(instanceId: string, definitionId: string): EnemyInstance {
    const definition = getEnemyDefinition(definitionId);
    return {
      instanceId,
      definitionId,
      currentHealth: definition.max_health,
      currentTarget: 'rig',
    };
  }

  getDefinition(instance: EnemyInstance): EnemyDefinition {
    return getEnemyDefinition(instance.definitionId);
  }

  applyDamage(instance: EnemyInstance, damage: number): EnemyInstance {
    return {
      ...instance,
      currentHealth: Math.max(0, instance.currentHealth - Math.max(0, damage)),
    };
  }

  updateTarget(instance: EnemyInstance, playerInAggroRange: boolean): EnemyInstance {
    return {
      ...instance,
      currentTarget: playerInAggroRange ? 'player' : 'rig',
    };
  }
}
