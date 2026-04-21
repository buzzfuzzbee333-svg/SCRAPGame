import { EventBus } from './core/eventBus';
import { GameStateController } from './core/gameStateController';
import { balanceConstants, enemyDefinitions, upgradeDefinitions, waveRules } from './data/loaders';
import { MetaStateStore } from './stores/metaStateStore';
import { RunStateStore } from './stores/runStateStore';
import { CombatSystem } from './systems/combatSystem';
import { EconomySystem } from './systems/economySystem';
import { EnemySystem } from './systems/enemySystem';
import { PlayerSystem } from './systems/playerSystem';
import { ProgressionSystem } from './systems/progressionSystem';
import { RigSystem } from './systems/rigSystem';
import { WaveSystem } from './systems/waveSystem';

export function createLastScrapCore() {
  const eventBus = new EventBus();
  const metaStateStore = new MetaStateStore();
  const runStateStore = new RunStateStore();

  return {
    config: balanceConstants,
    definitions: {
      enemies: enemyDefinitions,
      upgrades: upgradeDefinitions,
      waves: waveRules,
    },
    eventBus,
    stores: {
      metaStateStore,
      runStateStore,
    },
    controllers: {
      gameStateController: new GameStateController(runStateStore, eventBus),
    },
    systems: {
      combatSystem: new CombatSystem(eventBus),
      economySystem: new EconomySystem(eventBus),
      enemySystem: new EnemySystem(),
      playerSystem: new PlayerSystem(),
      progressionSystem: new ProgressionSystem(),
      rigSystem: new RigSystem(),
      waveSystem: new WaveSystem(eventBus),
    },
  };
}
