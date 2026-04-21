import React from 'react'
import { useGame } from '../GameContext'
import { balanceConstants } from '../data/loaders'

export default function PreRunScreen() {
  const { meta, goToTitle, goToRun } = useGame()
  const b = balanceConstants.player_base
  const r = balanceConstants.rig_base
  const levels = meta.upgradeLevels

  const getLevel = (id: string) => levels[id] ?? 0

  const playerAttack = b.attack + 1 * getLevel('weapon_damage')
  const playerInterval = Math.max(0.1, b.attack_interval_seconds + (-0.03 * getLevel('attack_speed')))
  const playerMaxHp = b.max_health + 5 * getLevel('max_health')
  const playerDefense = b.defense + 1 * getLevel('defense_plating')
  const playerSpeed = b.move_speed + 0.05 * getLevel('boots')
  const rigMaxHp = r.max_integrity + 15 * getLevel('rig_integrity')
  const rigDefense = r.defense + 1 * getLevel('rig_reinforcement')
  const salvageMult = 1.0 + 0.1 * getLevel('salvage_multiplier')
  const rigOutput = r.passive_scrap_tick_value + Math.floor(getLevel('rig_output') / 2)

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      background: '#0a0a15', padding: 24,
    }}>
      <h2 style={{ color: '#ffd700', fontSize: 28, letterSpacing: 4 }}>PRE-RUN LOADOUT</h2>
      <div style={{ color: '#ffd700', fontSize: 14, marginBottom: 4 }}>Secured Scrap: {meta.securedScrap}</div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={cardStyle}>
          <div style={{ color: '#4fc3f7', marginBottom: 8, fontWeight: 'bold' }}>PLAYER STATS</div>
          {([
            ['HP', playerMaxHp],
            ['Attack', playerAttack],
            ['Defense', playerDefense],
            ['Move Speed', playerSpeed.toFixed(2)],
            ['Atk Interval', playerInterval.toFixed(2) + 's'],
          ] as [string, string | number][]).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 13, marginBottom: 3 }}>
              <span style={{ color: '#aaa' }}>{label}</span>
              <span style={{ color: '#eee' }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#9dff8a', marginBottom: 8, fontWeight: 'bold' }}>RIG STATS</div>
          {([
            ['Integrity', rigMaxHp],
            ['Defense', rigDefense],
            ['Passive Scrap', `${rigOutput}/4s`],
            ['Salvage Mult', `${(salvageMult * 100).toFixed(0)}%`],
          ] as [string, string | number][]).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 13, marginBottom: 3 }}>
              <span style={{ color: '#aaa' }}>{label}</span>
              <span style={{ color: '#eee' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={goToTitle} style={btnStyle('#333', '#aaa', '#555')}>← Back</button>
        <button onClick={goToRun} style={btnStyle('#2d5a27', '#9dff8a', '#4a9e40')}>▶ Begin Run</button>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#1a1a2e', border: '1px solid #333', borderRadius: 6, padding: '16px 20px', minWidth: 200,
}

function btnStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${border}`,
    padding: '10px 28px', cursor: 'pointer', fontSize: 14, borderRadius: 4,
    fontFamily: 'Courier New, monospace', letterSpacing: 2,
  }
}
