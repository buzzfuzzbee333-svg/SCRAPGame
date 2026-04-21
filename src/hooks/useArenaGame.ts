import { useRef, useState, useEffect, useCallback } from 'react';
import { balanceConstants, getEnemyDefinition, getWaveRule, upgradeDefinitions } from '../data/loaders';
import { EconomySystem } from '../systems/economySystem';
import { ProgressionSystem } from '../systems/progressionSystem';
import { createDefaultRunState } from '../stores/runStateStore';
import { EventBus } from '../core/eventBus';
import type { MetaState } from '../types/state';
import type { EndType } from '../types/data';

const TILE_SIZE = 50;
const ARENA_W = 800;
const ARENA_H = 600;
const RIG_X = 400;
const RIG_Y = 300;
const RIG_RADIUS = 40;
const PLAYER_RADIUS = 16;
const PLAYER_START_X = 550;
const PLAYER_START_Y = 300;

export interface EnemyInstance {
  id: string;
  defId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  contactRange: number;
  attackCooldown: number;
  attackCooldownSeconds: number;
  aggroRadius: number;
  rewardScrap: number;
}

interface GameEntities {
  playerX: number;
  playerY: number;
  enemies: EnemyInstance[];
  playerAttackCooldown: number;
  passiveScrapTimer: number;
  waveClearHandled: boolean;
}

export interface RunSummaryData {
  endType: EndType;
  unsecuredScrapBefore: number;
  lostScrap: number;
  bankedScrap: number;
  highestWaveReached: number;
}

interface UseArenaGameProps {
  metaState: MetaState;
  onRunEnd: (summary: RunSummaryData) => void;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function getSalvageMultiplier(metaState: MetaState): number {
  const level = metaState.upgradeLevels['salvage_multiplier'] ?? 0;
  const def = upgradeDefinitions.find((u) => u.id === 'salvage_multiplier');
  if (!def || level === 0) return 1;
  return 1 + def.effect_per_level * level;
}

function spawnEnemiesForWave(waveNum: number, metaState: MetaState): EnemyInstance[] {
  const maxWave = 10;
  const safeWave = Math.min(waveNum, maxWave);
  let rule;
  try {
    rule = getWaveRule(safeWave);
  } catch {
    rule = { wave_number: safeWave, enemies: { shambler: 16 + (safeWave - 10) * 2, brute: 4, runner: 0 }, wave_reward: 55 + (safeWave - 10) * 5 };
  }

  const instances: EnemyInstance[] = [];
  let idCounter = 0;

  const spawnTypes = ['shambler', 'brute'] as const;
  for (const type of spawnTypes) {
    const count = (rule.enemies as Record<string, number>)[type] ?? 0;
    if (count <= 0) continue;
    const def = getEnemyDefinition(type);
    for (let i = 0; i < count; i++) {
      const { x, y } = randomEdgePosition(i, count, idCounter);
      instances.push({
        id: `${type}_w${waveNum}_${idCounter++}`,
        defId: type,
        x,
        y,
        hp: def.max_health,
        maxHp: def.max_health,
        attack: def.attack,
        defense: def.defense,
        speed: def.speed,
        contactRange: def.contact_range,
        attackCooldown: 0,
        attackCooldownSeconds: def.attack_cooldown_seconds,
        aggroRadius: def.aggro_radius,
        rewardScrap: def.reward_scrap,
      });
    }
  }
  return instances;
}

function randomEdgePosition(index: number, total: number, seed: number): { x: number; y: number } {
  const margin = 30;
  const side = (index + seed) % 4;
  const t = (index / Math.max(total, 1));
  switch (side) {
    case 0: return { x: margin + t * (ARENA_W - margin * 2), y: margin };
    case 1: return { x: ARENA_W - margin, y: margin + t * (ARENA_H - margin * 2) };
    case 2: return { x: margin + t * (ARENA_W - margin * 2), y: ARENA_H - margin };
    default: return { x: margin, y: margin + t * (ARENA_H - margin * 2) };
  }
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  entities: GameEntities,
  playerHp: number,
  playerMaxHp: number,
  rigIntegrity: number,
  rigMaxIntegrity: number
) {
  const { playerX, playerY, enemies } = entities;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, ARENA_W, ARENA_H);

  ctx.strokeStyle = '#1e2040';
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx <= ARENA_W; gx += TILE_SIZE) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ARENA_H); ctx.stroke();
  }
  for (let gy = 0; gy <= ARENA_H; gy += TILE_SIZE) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(ARENA_W, gy); ctx.stroke();
  }

  const rigHealthPct = rigIntegrity / rigMaxIntegrity;
  ctx.beginPath();
  ctx.arc(RIG_X, RIG_Y, RIG_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = rigHealthPct > 0.3 ? '#004455' : '#220000';
  ctx.fill();
  ctx.strokeStyle = rigHealthPct > 0.3 ? '#00ffe7' : '#ff4444';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#00ffe7';
  ctx.font = '11px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('RIG', RIG_X, RIG_Y + 4);

  ctx.beginPath();
  ctx.arc(playerX, playerY, 1.5 * TILE_SIZE, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 100, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  for (const e of enemies) {
    const color = e.defId === 'brute' ? '#cc2222' : '#e07820';
    const radius = e.defId === 'brute' ? 18 : 14;
    const hpPct = e.hp / e.maxHp;

    ctx.beginPath();
    ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ff8844';
    ctx.lineWidth = 2;
    ctx.stroke();

    const barW = 32;
    const barH = 4;
    const barX = e.x - barW / 2;
    const barY = e.y - radius - 8;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffcc00' : '#ff3333';
    ctx.fillRect(barX, barY, barW * hpPct, barH);
  }

  const playerHpPct = playerHp / playerMaxHp;
  ctx.beginPath();
  ctx.arc(playerX, playerY, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#00cc55';
  ctx.fill();
  ctx.strokeStyle = '#44ff88';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pBarW = 36;
  const pBarH = 5;
  ctx.fillStyle = '#333';
  ctx.fillRect(playerX - pBarW / 2, playerY - PLAYER_RADIUS - 10, pBarW, pBarH);
  ctx.fillStyle = playerHpPct > 0.5 ? '#44ff44' : playerHpPct > 0.25 ? '#ffcc00' : '#ff3333';
  ctx.fillRect(playerX - pBarW / 2, playerY - PLAYER_RADIUS - 10, pBarW * playerHpPct, pBarH);
}

export function useArenaGame({ metaState, onRunEnd }: UseArenaGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<GameEntities>({
    playerX: PLAYER_START_X,
    playerY: PLAYER_START_Y,
    enemies: [],
    playerAttackCooldown: 0,
    passiveScrapTimer: 0,
    waveClearHandled: false,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);

  const playerHpRef = useRef<number>(0);
  const playerMaxHpRef = useRef<number>(0);
  const rigIntegrityRef = useRef<number>(0);
  const rigMaxIntegrityRef = useRef<number>(0);
  const unsecuredScrapRef = useRef<number>(0);
  const waveNumRef = useRef<number>(1);
  const playerAttackRef = useRef<number>(7);
  const playerDefenseRef = useRef<number>(1);
  const playerMoveSpeedRef = useRef<number>(1.25);
  const playerAttackIntervalRef = useRef<number>(0.7);
  const rigDefenseRef = useRef<number>(0);
  const passiveScrapTickValueRef = useRef<number>(1);
  const passiveScrapTickIntervalRef = useRef<number>(4);
  const salvageMultiplierRef = useRef<number>(1);

  const [playerHp, setPlayerHp] = useState(50);
  const [playerMaxHp, setPlayerMaxHp] = useState(50);
  const [rigIntegrity, setRigIntegrity] = useState(120);
  const [rigMaxIntegrity, setRigMaxIntegrity] = useState(120);
  const [unsecuredScrap, setUnsecuredScrap] = useState(0);
  const [waveNum, setWaveNum] = useState(1);
  const [cashoutOpen, setCashoutOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [runEndType, setRunEndType] = useState<EndType | null>(null);

  const initRun = useCallback(() => {
    const progression = new ProgressionSystem();
    const defaultRun = createDefaultRunState();
    const { player, rig } = progression.applyUpgradesToRunState(metaState, defaultRun.player, defaultRun.rig);

    playerHpRef.current = player.maxHealth;
    playerMaxHpRef.current = player.maxHealth;
    rigIntegrityRef.current = rig.maxIntegrity;
    rigMaxIntegrityRef.current = rig.maxIntegrity;
    unsecuredScrapRef.current = 0;
    waveNumRef.current = 1;
    playerAttackRef.current = player.attack;
    playerDefenseRef.current = player.defense;
    playerMoveSpeedRef.current = player.moveSpeed;
    playerAttackIntervalRef.current = player.attackIntervalSeconds;
    rigDefenseRef.current = rig.defense;
    passiveScrapTickValueRef.current = rig.passiveScrapTickValue;
    passiveScrapTickIntervalRef.current = rig.passiveScrapTickIntervalSeconds;
    salvageMultiplierRef.current = getSalvageMultiplier(metaState);
    gameOverRef.current = false;

    entitiesRef.current = {
      playerX: PLAYER_START_X,
      playerY: PLAYER_START_Y,
      enemies: spawnEnemiesForWave(1, metaState),
      playerAttackCooldown: 0,
      passiveScrapTimer: 0,
      waveClearHandled: false,
    };

    setPlayerHp(player.maxHealth);
    setPlayerMaxHp(player.maxHealth);
    setRigIntegrity(rig.maxIntegrity);
    setRigMaxIntegrity(rig.maxIntegrity);
    setUnsecuredScrap(0);
    setWaveNum(1);
    setCashoutOpen(false);
    setIsGameOver(false);
    setRunEndType(null);
  }, [metaState]);

  const triggerRunEnd = useCallback((endType: EndType) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    isRunningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const eventBus = new EventBus();
    const economy = new EconomySystem(eventBus);
    const resolution = economy.resolveRunEnd(endType, unsecuredScrapRef.current);

    setIsGameOver(true);
    setRunEndType(endType);
    setCashoutOpen(false);

    onRunEnd({
      endType,
      unsecuredScrapBefore: resolution.unsecuredScrapBeforeResolution,
      lostScrap: resolution.lostScrap,
      bankedScrap: resolution.bankedScrap,
      highestWaveReached: waveNumRef.current,
    });
  }, [onRunEnd]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!isRunningRef.current || gameOverRef.current) return;

    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    const entities = entitiesRef.current;
    const keys = keysRef.current;

    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) dx += 1;
    if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) dy -= 1;
    if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      dx = dx / mag;
      dy = dy / mag;
      const speed = playerMoveSpeedRef.current * TILE_SIZE;
      entities.playerX = Math.max(PLAYER_RADIUS, Math.min(ARENA_W - PLAYER_RADIUS, entities.playerX + dx * speed * deltaTime));
      entities.playerY = Math.max(PLAYER_RADIUS, Math.min(ARENA_H - PLAYER_RADIUS, entities.playerY + dy * speed * deltaTime));
    }

    const playerX = entities.playerX;
    const playerY = entities.playerY;

    for (const enemy of entities.enemies) {
      const dPlayer = dist(enemy.x, enemy.y, playerX, playerY);
      const aggroPixels = enemy.aggroRadius * TILE_SIZE;
      let targetX: number, targetY: number;
      if (dPlayer <= aggroPixels) {
        targetX = playerX;
        targetY = playerY;
      } else {
        targetX = RIG_X;
        targetY = RIG_Y;
      }

      const dTarget = dist(enemy.x, enemy.y, targetX, targetY);
      const contactPixels = enemy.contactRange * TILE_SIZE;
      if (dTarget > contactPixels) {
        const edx = (targetX - enemy.x) / dTarget;
        const edy = (targetY - enemy.y) / dTarget;
        const espeed = enemy.speed * TILE_SIZE;
        enemy.x += edx * espeed * deltaTime;
        enemy.y += edy * espeed * deltaTime;
        enemy.x = Math.max(0, Math.min(ARENA_W, enemy.x));
        enemy.y = Math.max(0, Math.min(ARENA_H, enemy.y));
      }

      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= deltaTime;
      }

      if (enemy.attackCooldown <= 0) {
        if (dPlayer <= contactPixels) {
          const damage = Math.max(1, enemy.attack - playerDefenseRef.current);
          playerHpRef.current -= damage;
          enemy.attackCooldown = enemy.attackCooldownSeconds;
          if (playerHpRef.current <= 0) {
            playerHpRef.current = 0;
            setPlayerHp(0);
            triggerRunEnd('player_death');
            return;
          }
          setPlayerHp(Math.max(0, playerHpRef.current));
        } else {
          const dRig = dist(enemy.x, enemy.y, RIG_X, RIG_Y);
          if (dRig <= RIG_RADIUS + contactPixels) {
            const rigDmg = Math.max(1, enemy.attack - rigDefenseRef.current);
            rigIntegrityRef.current -= rigDmg;
            enemy.attackCooldown = enemy.attackCooldownSeconds;
            if (rigIntegrityRef.current <= 0) {
              rigIntegrityRef.current = 0;
              setRigIntegrity(0);
              triggerRunEnd('rig_overrun');
              return;
            }
            setRigIntegrity(Math.max(0, rigIntegrityRef.current));
          }
        }
      }
    }

    if (entities.playerAttackCooldown > 0) {
      entities.playerAttackCooldown -= deltaTime;
    }
    if (entities.playerAttackCooldown <= 0 && entities.enemies.length > 0) {
      let nearest: EnemyInstance | null = null;
      let nearestDist = Infinity;
      for (const e of entities.enemies) {
        const d = dist(playerX, playerY, e.x, e.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (nearest && nearestDist <= 1.5 * TILE_SIZE) {
        const damage = Math.max(1, playerAttackRef.current - nearest.defense);
        nearest.hp -= damage;
        entities.playerAttackCooldown = playerAttackIntervalRef.current;
        if (nearest.hp <= 0) {
          const reward = Math.floor(nearest.rewardScrap * salvageMultiplierRef.current);
          unsecuredScrapRef.current += reward;
          setUnsecuredScrap(unsecuredScrapRef.current);
          entities.enemies = entities.enemies.filter((e) => e.id !== nearest!.id);
        }
      }
    }

    entities.passiveScrapTimer += deltaTime;
    if (entities.passiveScrapTimer >= passiveScrapTickIntervalRef.current) {
      entities.passiveScrapTimer -= passiveScrapTickIntervalRef.current;
      unsecuredScrapRef.current += passiveScrapTickValueRef.current;
      setUnsecuredScrap(unsecuredScrapRef.current);
    }

    if (entities.enemies.length === 0 && !entities.waveClearHandled) {
      entities.waveClearHandled = true;
      isRunningRef.current = false;
      const waveReward = Math.floor(
        (balanceConstants.economy.wave_reward_formula.base +
          (waveNumRef.current - 1) * balanceConstants.economy.wave_reward_formula.step_per_wave) *
        salvageMultiplierRef.current
      );
      unsecuredScrapRef.current += waveReward;
      setUnsecuredScrap(unsecuredScrapRef.current);
      setCashoutOpen(true);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) renderFrame(ctx, entities, playerHpRef.current, playerMaxHpRef.current, rigIntegrityRef.current, rigMaxIntegrityRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) renderFrame(ctx, entities, playerHpRef.current, playerMaxHpRef.current, rigIntegrityRef.current, rigMaxIntegrityRef.current);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [triggerRunEnd]);

  const startGameLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keysRef.current.add(e.key); };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current.delete(e.key); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    initRun();
    const t = setTimeout(() => startGameLoop(), 50);
    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      isRunningRef.current = false;
    };
  }, []);

  const cashOut = useCallback(() => {
    setCashoutOpen(false);
    triggerRunEnd('cash_out');
  }, [triggerRunEnd]);

  const continueToNextWave = useCallback(() => {
    setCashoutOpen(false);
    const nextWave = waveNumRef.current + 1;
    waveNumRef.current = nextWave;
    setWaveNum(nextWave);
    entitiesRef.current.enemies = spawnEnemiesForWave(nextWave, metaState);
    entitiesRef.current.waveClearHandled = false;
    startGameLoop();
  }, [metaState, startGameLoop]);

  const surrender = useCallback(() => {
    triggerRunEnd('surrender');
  }, [triggerRunEnd]);

  const setTouchInput = useCallback((keys: string[]) => {
    keysRef.current = new Set(keys);
  }, []);

  const debugAddUnsecuredScrap = useCallback(() => {
    unsecuredScrapRef.current += 20;
    setUnsecuredScrap(unsecuredScrapRef.current);
  }, []);

  const debugDamagePlayer = useCallback(() => {
    playerHpRef.current = Math.max(1, playerHpRef.current - 10);
    setPlayerHp(playerHpRef.current);
  }, []);

  const debugDamageRig = useCallback(() => {
    rigIntegrityRef.current = Math.max(1, rigIntegrityRef.current - 20);
    setRigIntegrity(rigIntegrityRef.current);
  }, []);

  const debugKillAll = useCallback(() => {
    entitiesRef.current.enemies = [];
  }, []);

  const debugJumpToWave = useCallback((wave: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isRunningRef.current = false;
    waveNumRef.current = wave;
    setWaveNum(wave);
    entitiesRef.current.enemies = spawnEnemiesForWave(wave, metaState);
    entitiesRef.current.waveClearHandled = false;
    setCashoutOpen(false);
    setTimeout(() => startGameLoop(), 50);
  }, [metaState, startGameLoop]);

  return {
    canvasRef,
    playerHp,
    playerMaxHp,
    rigIntegrity,
    rigMaxIntegrity,
    unsecuredScrap,
    waveNum,
    cashoutOpen,
    isGameOver,
    runEndType,
    cashOut,
    continueToNextWave,
    surrender,
    setTouchInput,
    debug: {
      addUnsecuredScrap: debugAddUnsecuredScrap,
      damagePlayer: debugDamagePlayer,
      damageRig: debugDamageRig,
      killAll: debugKillAll,
      jumpToWave: debugJumpToWave,
    },
  };
}
