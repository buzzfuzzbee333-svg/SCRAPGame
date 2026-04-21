export interface EnemyInstance {
  id: string
  type: string
  x: number
  y: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  radius: number
  contactRange: number
  attackCooldown: number
  attackCooldownTimer: number
  rewardScrap: number
  aggroRadius: number
}

export interface PlayerState {
  x: number
  y: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  moveSpeed: number
  attackIntervalSec: number
  attackCooldown: number
  radius: number
  attackRange: number
}

export interface RigState {
  x: number
  y: number
  w: number
  h: number
  hp: number
  maxHp: number
  defense: number
  passiveScrapTimer: number
  passiveScrapInterval: number
  passiveScrapValue: number
}

export interface HUDData {
  playerHP: number
  playerMaxHP: number
  rigIntegrity: number
  rigMaxIntegrity: number
  waveNumber: number
  unsecuredScrap: number
  isCashoutOpen: boolean
  waveReward: number
  isGameOver: boolean
  endType: string | null
  isRunning: boolean
}

export interface RunEndResult {
  endType: string
  unsecuredBefore: number
  lostScrap: number
  bankedScrap: number
  highestWave: number
}
