export type EndType = 'cash_out' | 'rig_overrun' | 'player_death' | 'surrender';

export interface EnemyDefinition {
  id: string;
  name: string;
  role: string;
  max_health: number;
  attack: number;
  defense: number;
  speed: number;
  contact_range: number;
  attack_cooldown_seconds: number;
  reward_scrap: number;
  aggro_radius: number;
  target_priority_behavior: string;
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  category: 'combat' | 'survival' | 'rig' | 'economy';
  description: string;
  base_cost: number;
  cost_step: number;
  level_cap: number;
  effect_type: string;
  effect_per_level: number;
  apply_mode: string;
  step_interval_levels?: number;
}

export interface WaveRule {
  wave_number: number;
  enemies: Record<string, number>;
  wave_reward: number;
}

export interface GameStateTransition {
  from: string;
  to: string;
  trigger: string;
}

export interface BalanceConstants {
  game: {
    name: string;
    version: string;
  };
  locked_rules: {
    combat_mode: string;
    allow_ranged_enemies: boolean;
    damage_formula: string;
  };
  economy: {
    cash_out_bank_percent: number;
    rig_overrun_loss_percent: number;
    player_death_loss_percent: number;
    surrender_loss_percent: number;
    passive_scrap_tick_value: number;
    passive_scrap_tick_interval_seconds: number;
    wave_reward_formula: {
      base: number;
      step_per_wave: number;
      description: string;
    };
  };
  player_base: {
    max_health: number;
    attack: number;
    defense: number;
    move_speed: number;
    attack_interval_seconds: number;
  };
  rig_base: {
    max_integrity: number;
    defense: number;
    passive_scrap_tick_value: number;
    passive_scrap_tick_interval_seconds: number;
  };
}
