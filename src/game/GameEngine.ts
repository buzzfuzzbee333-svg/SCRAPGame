import { balanceConstants, enemyDefinitions, waveRules } from '../data/loaders'
import type { EnemyInstance, PlayerState, RigState, HUDData, RunEndResult } from './types'

const ARENA_SIZE = 800
const RIG_HALF = 40
const RIG_X = ARENA_SIZE / 2 - RIG_HALF
const RIG_Y = ARENA_SIZE / 2 - RIG_HALF
const PLAYER_RADIUS = 16
const PLAYER_ATTACK_RANGE = 40
const SPEED_SCALE = 80

export class GameEngine {
  private player: PlayerState
  private rig: RigState
  private enemies: EnemyInstance[] = []
  private waveNumber = 1
  private unsecuredScrap = 0
  private isWaveCleared = false
  private waveReward = 0
  private isGameOver = false
  private endType: string | null = null
  private unsecuredBeforeEnd = 0
  private salvageMultiplier = 1.0

  private keys = new Set<string>()
  private joystickDx = 0
  private joystickDy = 0

  private passiveTimer = 0
  private nextEnemyId = 0

  public onRunEnd: ((result: RunEndResult) => void) | null = null

  constructor() {
    this.player = this.createDefaultPlayer()
    this.rig = this.createDefaultRig()
  }

  private createDefaultPlayer(): PlayerState {
    const b = balanceConstants.player_base
    return {
      x: ARENA_SIZE / 2,
      y: ARENA_SIZE - 60,
      hp: b.max_health,
      maxHp: b.max_health,
      attack: b.attack,
      defense: b.defense,
      moveSpeed: b.move_speed * SPEED_SCALE,
      attackIntervalSec: b.attack_interval_seconds,
      attackCooldown: 0,
      radius: PLAYER_RADIUS,
      attackRange: PLAYER_ATTACK_RANGE,
    }
  }

  private createDefaultRig(): RigState {
    const b = balanceConstants.rig_base
    return {
      x: RIG_X,
      y: RIG_Y,
      w: RIG_HALF * 2,
      h: RIG_HALF * 2,
      hp: b.max_integrity,
      maxHp: b.max_integrity,
      defense: b.defense,
      passiveScrapTimer: 0,
      passiveScrapInterval: b.passive_scrap_tick_interval_seconds,
      passiveScrapValue: b.passive_scrap_tick_value,
    }
  }

  start(waveNumber: number, upgradeLevels: Record<string, number> = {}) {
    this.waveNumber = waveNumber
    this.isGameOver = false
    this.endType = null
    this.isWaveCleared = false
    this.waveReward = 0
    this.unsecuredScrap = 0
    this.enemies = []
    this.nextEnemyId = 0
    this.passiveTimer = 0
    this.salvageMultiplier = 1.0

    this.player = this.createDefaultPlayer()
    this.rig = this.createDefaultRig()

    this.applyUpgrades(upgradeLevels)
    this.player.hp = this.player.maxHp

    this.spawnWave(waveNumber)
  }

  private applyUpgrades(levels: Record<string, number>) {
    const get = (id: string) => levels[id] ?? 0

    this.player.attack += 1 * get('weapon_damage')
    this.player.attackIntervalSec = Math.max(0.1, this.player.attackIntervalSec + (-0.03 * get('attack_speed')))
    this.player.maxHp += 5 * get('max_health')
    this.player.defense += 1 * get('defense_plating')
    this.player.moveSpeed += 0.05 * SPEED_SCALE * get('boots')
    this.rig.maxHp += 15 * get('rig_integrity')
    this.rig.defense += 1 * get('rig_reinforcement')
    this.salvageMultiplier = 1.0 + 0.1 * get('salvage_multiplier')
    this.rig.passiveScrapValue += Math.floor(get('rig_output') / 2)
  }

  private spawnWave(waveNum: number) {
    const maxWave = waveRules.length
    const ruleIndex = Math.min(waveNum, maxWave)
    const rule = waveRules.find(w => w.wave_number === ruleIndex) ?? waveRules[waveRules.length - 1]

    const scaleFactor = waveNum > maxWave ? 1 + (waveNum - maxWave) * 0.2 : 1

    for (const [type, count] of Object.entries(rule.enemies)) {
      if (type === 'runner') continue
      if (count > 0) {
        const scaledCount = Math.round(count * scaleFactor)
        for (let i = 0; i < scaledCount; i++) {
          this.spawnEnemy(type)
        }
      }
    }

    this.waveReward = Math.round(rule.wave_reward * this.salvageMultiplier)
  }

  private spawnEnemy(type: string) {
    const def = enemyDefinitions.find(e => e.id === type)
    if (!def) return

    const edge = Math.floor(Math.random() * 4)
    let x = 0, y = 0
    const margin = 40
    if (edge === 0) { x = Math.random() * ARENA_SIZE; y = -margin }
    else if (edge === 1) { x = Math.random() * ARENA_SIZE; y = ARENA_SIZE + margin }
    else if (edge === 2) { x = -margin; y = Math.random() * ARENA_SIZE }
    else { x = ARENA_SIZE + margin; y = Math.random() * ARENA_SIZE }

    const radius = def.id === 'brute' ? 20 : 14

    this.enemies.push({
      id: `${type}_${this.nextEnemyId++}`,
      type,
      x, y,
      hp: def.max_health,
      maxHp: def.max_health,
      attack: def.attack,
      defense: def.defense,
      speed: def.speed * SPEED_SCALE,
      radius,
      contactRange: def.contact_range * 40,
      attackCooldown: def.attack_cooldown_seconds,
      attackCooldownTimer: 0,
      rewardScrap: def.reward_scrap,
      aggroRadius: def.aggro_radius * 40,
    })
  }

  handleInput(keys: Set<string>) {
    this.keys = keys
  }

  handleJoystick(dx: number, dy: number) {
    this.joystickDx = dx
    this.joystickDy = dy
  }

  update(dt: number) {
    if (this.isGameOver || this.isWaveCleared) return

    this.updatePlayer(dt)
    this.updateEnemies(dt)
    this.updatePassiveScrap(dt)
    this.checkWaveCleared()
  }

  private updatePlayer(dt: number) {
    if (this.player.hp <= 0) return

    let dx = 0, dy = 0

    if (this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A')) dx -= 1
    if (this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D')) dx += 1
    if (this.keys.has('ArrowUp') || this.keys.has('w') || this.keys.has('W')) dy -= 1
    if (this.keys.has('ArrowDown') || this.keys.has('s') || this.keys.has('S')) dy += 1

    if (Math.abs(this.joystickDx) > 0.1 || Math.abs(this.joystickDy) > 0.1) {
      dx = this.joystickDx
      dy = this.joystickDy
    }

    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > 0) {
      dx /= len; dy /= len
      const newX = this.player.x + dx * this.player.moveSpeed * dt
      const newY = this.player.y + dy * this.player.moveSpeed * dt
      this.player.x = Math.max(this.player.radius, Math.min(ARENA_SIZE - this.player.radius, newX))
      this.player.y = Math.max(this.player.radius, Math.min(ARENA_SIZE - this.player.radius, newY))
    }

    if (this.player.attackCooldown > 0) {
      this.player.attackCooldown -= dt
    } else {
      const target = this.findNearestEnemy()
      if (target) {
        const dist = this.distPlayerToEnemy(target)
        if (dist <= this.player.attackRange + target.radius) {
          const dmg = Math.max(1, this.player.attack - target.defense)
          target.hp -= dmg
          this.player.attackCooldown = this.player.attackIntervalSec
          if (target.hp <= 0) {
            this.killEnemy(target)
          }
        }
      }
    }
  }

  private findNearestEnemy(): EnemyInstance | null {
    let nearest: EnemyInstance | null = null
    let minDist = Infinity
    for (const e of this.enemies) {
      const d = this.distPlayerToEnemy(e)
      if (d < minDist) {
        minDist = d
        nearest = e
      }
    }
    return nearest
  }

  private distPlayerToEnemy(e: EnemyInstance): number {
    const dx = this.player.x - e.x
    const dy = this.player.y - e.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private killEnemy(e: EnemyInstance) {
    const reward = Math.round(e.rewardScrap * this.salvageMultiplier)
    this.unsecuredScrap += reward
    this.enemies = this.enemies.filter(en => en.id !== e.id)
  }

  private updateEnemies(dt: number) {
    const rigCx = this.rig.x + this.rig.w / 2
    const rigCy = this.rig.y + this.rig.h / 2

    for (const e of this.enemies) {
      const distToPlayer = this.distPlayerToEnemy(e)
      const targetPlayer = distToPlayer <= e.aggroRadius

      let targetX: number, targetY: number
      if (targetPlayer) {
        targetX = this.player.x; targetY = this.player.y
      } else {
        targetX = rigCx; targetY = rigCy
      }

      const tdx = targetX - e.x
      const tdy = targetY - e.y
      const tdist = Math.sqrt(tdx * tdx + tdy * tdy)
      if (tdist > 1) {
        e.x += (tdx / tdist) * e.speed * dt
        e.y += (tdy / tdist) * e.speed * dt
      }

      if (e.attackCooldownTimer > 0) {
        e.attackCooldownTimer -= dt
      }

      if (targetPlayer && this.player.hp > 0) {
        const contactDist = e.contactRange + this.player.radius
        if (distToPlayer <= contactDist && e.attackCooldownTimer <= 0) {
          const dmg = Math.max(1, e.attack - this.player.defense)
          this.player.hp -= dmg
          e.attackCooldownTimer = e.attackCooldown
          if (this.player.hp <= 0) {
            this.player.hp = 0
            this.triggerGameOver('player_death')
            return
          }
        }
      }

      if (!targetPlayer) {
        if (this.isEnemyTouchingRig(e) && e.attackCooldownTimer <= 0) {
          const dmg = Math.max(1, e.attack - this.rig.defense)
          this.rig.hp -= dmg
          e.attackCooldownTimer = e.attackCooldown
          if (this.rig.hp <= 0) {
            this.rig.hp = 0
            this.triggerGameOver('rig_overrun')
            return
          }
        }
      }
    }
  }

  private isEnemyTouchingRig(e: EnemyInstance): boolean {
    const nearX = Math.max(this.rig.x, Math.min(this.rig.x + this.rig.w, e.x))
    const nearY = Math.max(this.rig.y, Math.min(this.rig.y + this.rig.h, e.y))
    const dx = e.x - nearX
    const dy = e.y - nearY
    return (dx * dx + dy * dy) <= (e.radius + e.contactRange) * (e.radius + e.contactRange)
  }

  private updatePassiveScrap(dt: number) {
    this.passiveTimer += dt
    if (this.passiveTimer >= this.rig.passiveScrapInterval) {
      this.unsecuredScrap += this.rig.passiveScrapValue
      this.passiveTimer -= this.rig.passiveScrapInterval
    }
  }

  private checkWaveCleared() {
    if (this.enemies.length === 0 && !this.isWaveCleared && !this.isGameOver) {
      this.isWaveCleared = true
    }
  }

  private triggerGameOver(endType: string) {
    if (this.isGameOver) return
    this.isGameOver = true
    this.endType = endType

    const unsecured = this.unsecuredScrap
    this.unsecuredBeforeEnd = unsecured
    let lostScrap = 0
    let bankedScrap = 0

    if (endType === 'player_death') {
      lostScrap = unsecured
      bankedScrap = 0
    } else if (endType === 'rig_overrun') {
      lostScrap = Math.floor(unsecured * 0.5)
      bankedScrap = unsecured - lostScrap
    }

    setTimeout(() => {
      if (this.onRunEnd) {
        this.onRunEnd({ endType, unsecuredBefore: unsecured, lostScrap, bankedScrap, highestWave: this.waveNumber })
      }
    }, 1500)
  }

  cashOut() {
    if (this.isGameOver || !this.isWaveCleared) return
    const unsecured = this.unsecuredScrap
    this.isGameOver = true
    this.endType = 'cash_out'
    this.unsecuredBeforeEnd = unsecured

    if (this.onRunEnd) {
      this.onRunEnd({ endType: 'cash_out', unsecuredBefore: unsecured, lostScrap: 0, bankedScrap: unsecured, highestWave: this.waveNumber })
    }
  }

  continueWave() {
    if (!this.isWaveCleared || this.isGameOver) return
    this.waveNumber += 1
    this.isWaveCleared = false
    this.waveReward = 0
    this.spawnWave(this.waveNumber)
  }

  surrender() {
    if (this.isGameOver) return
    const unsecured = this.unsecuredScrap
    this.isGameOver = true
    this.endType = 'surrender'
    this.unsecuredBeforeEnd = unsecured
    const lostScrap = Math.floor(unsecured * 0.6)
    const bankedScrap = unsecured - lostScrap

    if (this.onRunEnd) {
      this.onRunEnd({ endType: 'surrender', unsecuredBefore: unsecured, lostScrap, bankedScrap, highestWave: this.waveNumber })
    }
  }

  getHUDData(): HUDData {
    return {
      playerHP: this.player.hp,
      playerMaxHP: this.player.maxHp,
      rigIntegrity: this.rig.hp,
      rigMaxIntegrity: this.rig.maxHp,
      waveNumber: this.waveNumber,
      unsecuredScrap: this.unsecuredScrap,
      isCashoutOpen: this.isWaveCleared && !this.isGameOver,
      waveReward: this.waveReward,
      isGameOver: this.isGameOver,
      endType: this.endType,
      isRunning: !this.isGameOver && !this.isWaveCleared,
    }
  }

  render(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
    const scale = Math.min(canvasW / ARENA_SIZE, canvasH / ARENA_SIZE)
    const offsetX = (canvasW - ARENA_SIZE * scale) / 2
    const offsetY = (canvasH - ARENA_SIZE * scale) / 2

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE)

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, ARENA_SIZE, ARENA_SIZE)

    ctx.strokeStyle = '#222'
    ctx.lineWidth = 0.5
    for (let i = 100; i < ARENA_SIZE; i += 100) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, ARENA_SIZE); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(ARENA_SIZE, i); ctx.stroke()
    }

    const rigHpRatio = this.rig.hp / this.rig.maxHp
    ctx.fillStyle = rigHpRatio > 0.5 ? '#2d5a27' : rigHpRatio > 0.25 ? '#7a6520' : '#7a2020'
    ctx.fillRect(this.rig.x, this.rig.y, this.rig.w, this.rig.h)
    ctx.strokeStyle = '#4a9e40'
    ctx.lineWidth = 2
    ctx.strokeRect(this.rig.x, this.rig.y, this.rig.w, this.rig.h)

    ctx.fillStyle = '#9dff8a'
    ctx.font = '10px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText('RIG', this.rig.x + this.rig.w / 2, this.rig.y + this.rig.h / 2 + 4)

    for (const e of this.enemies) {
      const hpRatio = e.hp / e.maxHp
      ctx.fillStyle = e.type === 'brute'
        ? (hpRatio > 0.5 ? '#8b0000' : '#4a0000')
        : (hpRatio > 0.5 ? '#8b5a2b' : '#5a3a1a')
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = e.type === 'brute' ? '#ff4444' : '#cc7733'
      ctx.lineWidth = 1.5
      ctx.stroke()

      const bw = e.radius * 2
      const bh = 3
      const bx = e.x - e.radius
      const by = e.y - e.radius - 6
      ctx.fillStyle = '#333'
      ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336'
      ctx.fillRect(bx, by, bw * hpRatio, bh)
    }

    if (this.player.hp > 0) {
      ctx.fillStyle = '#4fc3f7'
      ctx.beginPath()
      ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#81d4fa'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.strokeStyle = 'rgba(79, 195, 247, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(this.player.x, this.player.y, this.player.attackRange + this.player.radius, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.fillStyle = '#555'
      ctx.beginPath()
      ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  debugAddScrap(amount: number) { this.unsecuredScrap += amount }
  debugDamagePlayer(amount: number) {
    this.player.hp = Math.max(0, this.player.hp - amount)
    if (this.player.hp <= 0) this.triggerGameOver('player_death')
  }
  debugDamageRig(amount: number) {
    this.rig.hp = Math.max(0, this.rig.hp - amount)
    if (this.rig.hp <= 0) this.triggerGameOver('rig_overrun')
  }
  debugClearEnemies() {
    this.enemies = []
    this.checkWaveCleared()
  }
  debugSkipWave() {
    this.enemies = []
    this.isWaveCleared = true
  }
  getWaveNumber() { return this.waveNumber }
  setWaveNumber(n: number) {
    this.waveNumber = n
    this.enemies = []
    this.isWaveCleared = false
    this.spawnWave(n)
  }
}
