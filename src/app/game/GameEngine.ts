import { balanceConstants, enemyDefinitions, waveRules, upgradeDefinitions } from '../../data/loaders';
import type { MetaState } from '../../types/state';
import type { EndType } from '../../types/data';

export const WORLD_W = 800;
export const WORLD_H = 600;
export const PIXELS_PER_UNIT = 60;

export const PLAYER_RADIUS = 14;
export const RIG_RADIUS = 28;
export const SHAMBLER_RADIUS = 13;
export const BRUTE_RADIUS = 18;

export interface Vec2 { x: number; y: number; }

export interface GamePlayer {
  pos: Vec2;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  attackInterval: number;
  attackTimer: number;
  radius: number;
  isDead: boolean;
}

export interface GameRig {
  pos: Vec2;
  hp: number;
  maxHp: number;
  defense: number;
  radius: number;
  isOverrun: boolean;
  passiveTimer: number;
  passiveInterval: number;
  passiveValue: number;
}

export interface GameEnemy {
  id: string;
  defId: string;
  pos: Vec2;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  contactRange: number;
  aggroRadius: number;
  attackCooldown: number;
  attackTimer: number;
  rewardScrap: number;
  radius: number;
  target: 'player' | 'rig';
  isDead: boolean;
}

export type GamePhase = 'wave_active' | 'cashout_window' | 'ended';

export interface GameState {
  phase: GamePhase;
  endReason: EndType | null;
  waveIndex: number;
  unsecuredScrap: number;
  scrapMultiplier: number;
  player: GamePlayer;
  rig: GameRig;
  enemies: GameEnemy[];
  lastEnemyId: number;
}

export interface RunSummary {
  endReason: EndType;
  unsecuredScrapBefore: number;
  scrapLost: number;
  scrapBanked: number;
}

function calcDamage(attackerAtk: number, targetDef: number): number {
  return Math.max(1, attackerAtk - targetDef);
}

function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function createGameState(metaState: MetaState): GameState {
  const p = balanceConstants.player_base;
  const r = balanceConstants.rig_base;

  let playerAtk = p.attack;
  let playerDef = p.defense;
  let playerMaxHp = p.max_health;
  let playerSpeed = p.move_speed;
  let playerAtkInterval = p.attack_interval_seconds;
  let rigMaxHp = r.max_integrity;
  let rigDef = r.defense;
  let passiveValue = r.passive_scrap_tick_value;
  let scrapMultiplier = 1.0;

  for (const upg of upgradeDefinitions) {
    const level = metaState.upgradeLevels[upg.id] ?? 0;
    if (level === 0) continue;
    switch (upg.effect_type) {
      case 'player_attack_flat': playerAtk += upg.effect_per_level * level; break;
      case 'player_attack_interval_delta': playerAtkInterval += upg.effect_per_level * level; break;
      case 'player_max_health_flat': playerMaxHp += upg.effect_per_level * level; break;
      case 'player_defense_flat': playerDef += upg.effect_per_level * level; break;
      case 'player_move_speed_flat': playerSpeed += upg.effect_per_level * level; break;
      case 'rig_max_integrity_flat': rigMaxHp += upg.effect_per_level * level; break;
      case 'rig_defense_flat': rigDef += upg.effect_per_level * level; break;
      case 'rig_passive_scrap_step':
        if (upg.step_interval_levels) {
          const steps = Math.floor(level / upg.step_interval_levels);
          passiveValue += steps * upg.effect_per_level;
        }
        break;
      case 'scrap_multiplier_percent': scrapMultiplier += upg.effect_per_level * level; break;
    }
  }

  playerAtkInterval = Math.max(0.15, playerAtkInterval);

  return {
    phase: 'wave_active',
    endReason: null,
    waveIndex: 1,
    unsecuredScrap: 0,
    scrapMultiplier,
    lastEnemyId: 0,
    player: {
      pos: { x: WORLD_W / 2, y: WORLD_H / 2 - 60 },
      hp: playerMaxHp,
      maxHp: playerMaxHp,
      attack: playerAtk,
      defense: playerDef,
      speed: playerSpeed * PIXELS_PER_UNIT,
      attackInterval: playerAtkInterval,
      attackTimer: 0,
      radius: PLAYER_RADIUS,
      isDead: false,
    },
    rig: {
      pos: { x: WORLD_W / 2, y: WORLD_H / 2 },
      hp: rigMaxHp,
      maxHp: rigMaxHp,
      defense: rigDef,
      radius: RIG_RADIUS,
      isOverrun: false,
      passiveTimer: r.passive_scrap_tick_interval_seconds,
      passiveInterval: r.passive_scrap_tick_interval_seconds,
      passiveValue,
    },
    enemies: [],
  };
}

function spawnWaveEnemies(state: GameState): GameState {
  const waveRuleList = waveRules;
  const waveIdx = state.waveIndex;
  const rule = waveRuleList.find((w) => w.wave_number === waveIdx);
  if (!rule) return state;

  const newEnemies: GameEnemy[] = [];
  let nextId = state.lastEnemyId;

  const activeDefs = ['shambler', 'brute'];
  for (const defId of activeDefs) {
    const count = rule.enemies[defId] ?? 0;
    const def = enemyDefinitions.find((e) => e.id === defId);
    if (!def) continue;

    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      let sx = 0, sy = 0;
      const margin = 20;
      if (side === 0) { sx = margin + Math.random() * (WORLD_W - margin * 2); sy = margin; }
      else if (side === 1) { sx = WORLD_W - margin; sy = margin + Math.random() * (WORLD_H - margin * 2); }
      else if (side === 2) { sx = margin + Math.random() * (WORLD_W - margin * 2); sy = WORLD_H - margin; }
      else { sx = margin; sy = margin + Math.random() * (WORLD_H - margin * 2); }

      const radius = defId === 'brute' ? BRUTE_RADIUS : SHAMBLER_RADIUS;

      newEnemies.push({
        id: `e${++nextId}`,
        defId,
        pos: { x: sx, y: sy },
        hp: def.max_health,
        maxHp: def.max_health,
        attack: def.attack,
        defense: def.defense,
        speed: def.speed * PIXELS_PER_UNIT,
        contactRange: def.contact_range * PIXELS_PER_UNIT,
        aggroRadius: def.aggro_radius * PIXELS_PER_UNIT,
        attackCooldown: def.attack_cooldown_seconds,
        attackTimer: 0,
        rewardScrap: def.reward_scrap,
        radius,
        target: 'rig',
        isDead: false,
      });
    }
  }

  return { ...state, enemies: newEnemies, lastEnemyId: nextId };
}

export interface InputState {
  dx: number;
  dy: number;
}

export function updateGame(state: GameState, dt: number, input: InputState): {
  nextState: GameState;
  killedEnemies: string[];
  scrapGained: number;
  events: string[];
} {
  if (state.phase === 'ended' || state.phase === 'cashout_window') {
    return { nextState: state, killedEnemies: [], scrapGained: 0, events: [] };
  }

  const s = { ...state };
  const killedEnemies: string[] = [];
  const events: string[] = [];
  let scrapGained = 0;

  // 1. Move player
  const p = { ...s.player };
  const moveDir = normalize({ x: input.dx, y: input.dy });
  p.pos = {
    x: Math.max(p.radius, Math.min(WORLD_W - p.radius, p.pos.x + moveDir.x * p.speed * dt)),
    y: Math.max(p.radius, Math.min(WORLD_H - p.radius, p.pos.y + moveDir.y * p.speed * dt)),
  };

  // 2. Update attack timer
  p.attackTimer = Math.max(0, p.attackTimer - dt);

  // 3. Update enemies
  const rigPos = s.rig.pos;
  const updatedEnemies = s.enemies.map((e) => {
    if (e.isDead) return e;
    const ne = { ...e };

    const dPlayer = dist(ne.pos, p.pos);
    ne.target = dPlayer <= ne.aggroRadius ? 'player' : 'rig';

    const targetPos = ne.target === 'player' ? p.pos : rigPos;
    const toTarget = normalize({ x: targetPos.x - ne.pos.x, y: targetPos.y - ne.pos.y });
    const dToTarget = dist(ne.pos, targetPos);
    const targetRadius = ne.target === 'player' ? p.radius : s.rig.radius;

    if (dToTarget > targetRadius + ne.radius) {
      ne.pos = {
        x: ne.pos.x + toTarget.x * ne.speed * dt,
        y: ne.pos.y + toTarget.y * ne.speed * dt,
      };
    }

    ne.pos = {
      x: Math.max(ne.radius, Math.min(WORLD_W - ne.radius, ne.pos.x)),
      y: Math.max(ne.radius, Math.min(WORLD_H - ne.radius, ne.pos.y)),
    };

    ne.attackTimer = Math.max(0, ne.attackTimer - dt);

    return ne;
  });

  s.enemies = updatedEnemies;
  s.player = p;

  // 4. Enemy attacks player
  let playerHp = p.hp;
  const enemiesAfterAtk = s.enemies.map((e) => {
    if (e.isDead) return e;
    if (e.target !== 'player') return e;
    const d = dist(e.pos, p.pos);
    if (d <= e.contactRange + p.radius && e.attackTimer === 0) {
      const dmg = calcDamage(e.attack, p.defense);
      playerHp -= dmg;
      return { ...e, attackTimer: e.attackCooldown };
    }
    return e;
  });
  s.enemies = enemiesAfterAtk;

  // 5. Enemy attacks rig
  let rigHp = s.rig.hp;
  const enemiesAfterRigAtk = s.enemies.map((e) => {
    if (e.isDead) return e;
    if (e.target !== 'rig') return e;
    const d = dist(e.pos, rigPos);
    if (d <= e.contactRange + s.rig.radius && e.attackTimer === 0) {
      const dmg = Math.max(1, e.attack - s.rig.defense);
      rigHp -= dmg;
      return { ...e, attackTimer: e.attackCooldown };
    }
    return e;
  });
  s.enemies = enemiesAfterRigAtk;
  s.rig = { ...s.rig, hp: Math.max(0, rigHp), isOverrun: Math.max(0, rigHp) === 0 };

  // 6. Player auto-attacks nearest enemy in range
  const PLAYER_ATTACK_RANGE = p.radius + 35;
  if (p.attackTimer === 0) {
    let nearestEnemy: GameEnemy | null = null;
    let nearestDist = Infinity;
    for (const e of s.enemies) {
      if (e.isDead) continue;
      const d = dist(p.pos, e.pos);
      if (d <= PLAYER_ATTACK_RANGE + e.radius && d < nearestDist) {
        nearestDist = d;
        nearestEnemy = e;
      }
    }
    if (nearestEnemy) {
      const dmg = calcDamage(p.attack, nearestEnemy.defense);
      const newHp = nearestEnemy.hp - dmg;
      const attackedId = nearestEnemy.id;
      s.enemies = s.enemies.map((e) => {
        if (e.id !== attackedId) return e;
        return { ...e, hp: Math.max(0, newHp), isDead: newHp <= 0 };
      });
      s.player = { ...s.player, attackTimer: p.attackInterval };
      if (newHp <= 0) {
        killedEnemies.push(nearestEnemy.id);
        const reward = Math.round(nearestEnemy.rewardScrap * s.scrapMultiplier);
        scrapGained += reward;
        events.push(`kill:${nearestEnemy.defId}:${reward}`);
      }
    }
  } else {
    s.player = { ...s.player, attackTimer: p.attackTimer };
  }

  // 7. Update player hp
  playerHp = Math.max(0, playerHp);
  s.player = { ...s.player, hp: playerHp, isDead: playerHp === 0 };

  // 8. Passive scrap tick
  let passiveTimer = s.rig.passiveTimer - dt;
  if (passiveTimer <= 0) {
    scrapGained += s.rig.passiveValue;
    passiveTimer += s.rig.passiveInterval;
    events.push(`passive:${s.rig.passiveValue}`);
  }
  s.rig = { ...s.rig, passiveTimer };

  // 9. Update unsecured scrap
  s.unsecuredScrap += scrapGained;

  // 10. Check game over conditions
  if (s.player.isDead) {
    s.phase = 'ended';
    s.endReason = 'player_death';
    events.push('player_death');
  } else if (s.rig.isOverrun) {
    s.phase = 'ended';
    s.endReason = 'rig_overrun';
    events.push('rig_overrun');
  } else {
    const aliveEnemies = s.enemies.filter((e) => !e.isDead);
    if (aliveEnemies.length === 0 && s.enemies.length > 0) {
      const waveRule = waveRules.find((w) => w.wave_number === s.waveIndex);
      if (waveRule) {
        const waveReward = Math.round(waveRule.wave_reward * s.scrapMultiplier);
        s.unsecuredScrap += waveReward;
        events.push(`wave_cleared:${s.waveIndex}:${waveReward}`);
      }
      s.phase = 'cashout_window';
    }
  }

  return { nextState: s, killedEnemies, scrapGained, events };
}

export function startNextWave(state: GameState): GameState {
  const nextWaveIndex = state.waveIndex + 1;
  const newState = { ...state, waveIndex: nextWaveIndex, phase: 'wave_active' as GamePhase, enemies: [] };
  return spawnWaveEnemies(newState);
}

export function startWave(state: GameState, waveIndex?: number): GameState {
  const idx = waveIndex ?? state.waveIndex;
  const newState = { ...state, waveIndex: idx, phase: 'wave_active' as GamePhase, enemies: [] };
  return spawnWaveEnemies(newState);
}

export function resolveRunEnd(state: GameState): RunSummary {
  const endReason = state.endReason ?? 'surrender';
  const unsecured = Math.max(0, state.unsecuredScrap);

  let lossPercent = 0;
  switch (endReason) {
    case 'cash_out': lossPercent = 1 - balanceConstants.economy.cash_out_bank_percent; break;
    case 'rig_overrun': lossPercent = balanceConstants.economy.rig_overrun_loss_percent; break;
    case 'player_death': lossPercent = balanceConstants.economy.player_death_loss_percent; break;
    case 'surrender': lossPercent = balanceConstants.economy.surrender_loss_percent; break;
  }

  const scrapLost = Math.floor(unsecured * lossPercent);
  const scrapBanked = unsecured - scrapLost;

  return { endReason, unsecuredScrapBefore: unsecured, scrapLost, scrapBanked };
}

export { spawnWaveEnemies };
