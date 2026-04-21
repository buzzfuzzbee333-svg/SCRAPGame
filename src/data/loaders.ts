import balanceConstantsJson from '../../data/balance_constants.json';
import enemyDefinitionsJson from '../../data/enemy_definitions.json';
import upgradeDefinitionsJson from '../../data/upgrade_definitions.json';
import waveRulesJson from '../../data/wave_rules.json';
import gameStateMapJson from '../../data/game_state_map.json';
import type {
  BalanceConstants,
  EnemyDefinition,
  GameStateTransition,
  UpgradeDefinition,
  WaveRule,
} from '../types/data';

export const balanceConstants = balanceConstantsJson as BalanceConstants;
export const enemyDefinitions = enemyDefinitionsJson.enemies as EnemyDefinition[];
export const upgradeDefinitions = upgradeDefinitionsJson.upgrades as UpgradeDefinition[];
export const waveRules = waveRulesJson.waves as WaveRule[];
export const gameStateTransitions = gameStateMapJson.transitions as GameStateTransition[];

export function getEnemyDefinition(id: string): EnemyDefinition {
  const definition = enemyDefinitions.find((enemy) => enemy.id === id);
  if (!definition) {
    throw new Error(`Unknown enemy definition: ${id}`);
  }
  return definition;
}

export function getUpgradeDefinition(id: string): UpgradeDefinition {
  const definition = upgradeDefinitions.find((upgrade) => upgrade.id === id);
  if (!definition) {
    throw new Error(`Unknown upgrade definition: ${id}`);
  }
  return definition;
}

export function getWaveRule(waveNumber: number): WaveRule {
  const rule = waveRules.find((wave) => wave.wave_number === waveNumber);
  if (!rule) {
    throw new Error(`Unknown wave rule: ${waveNumber}`);
  }
  return rule;
}
