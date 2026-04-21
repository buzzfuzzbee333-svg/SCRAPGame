import React from 'react'
import type { HUDData } from '../game/types'

interface Props {
  hud: HUDData
  onSurrender: () => void
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0
  return (
    <div style={{ background: '#333', borderRadius: 4, height: 14, width: 120, overflow: 'hidden', border: '1px solid #555' }}>
      <div style={{ background: color, height: '100%', width: `${pct}%`, transition: 'width 0.1s' }} />
    </div>
  )
}

export default function HUD({ hud, onSurrender }: Props) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '8px 12px', pointerEvents: 'none', zIndex: 10,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#4fc3f7', fontSize: 12, width: 50 }}>HP</span>
          <Bar value={hud.playerHP} max={hud.playerMaxHP} color={hud.playerHP / hud.playerMaxHP > 0.5 ? '#4caf50' : hud.playerHP / hud.playerMaxHP > 0.25 ? '#ff9800' : '#f44336'} />
          <span style={{ color: '#eee', fontSize: 11 }}>{hud.playerHP}/{hud.playerMaxHP}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#9dff8a', fontSize: 12, width: 50 }}>RIG</span>
          <Bar value={hud.rigIntegrity} max={hud.rigMaxIntegrity} color={hud.rigIntegrity / hud.rigMaxIntegrity > 0.5 ? '#4caf50' : hud.rigIntegrity / hud.rigMaxIntegrity > 0.25 ? '#ff9800' : '#f44336'} />
          <span style={{ color: '#eee', fontSize: 11 }}>{hud.rigIntegrity}/{hud.rigMaxIntegrity}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#ffd700', fontSize: 16, fontWeight: 'bold' }}>WAVE {hud.waveNumber}</span>
        <span style={{ color: '#ffd700', fontSize: 13 }}>⚙ {hud.unsecuredScrap} scrap</span>
      </div>
      <div style={{ pointerEvents: 'all' }}>
        <button onClick={onSurrender} style={{
          background: '#8b0000', color: '#fff', border: '1px solid #ff4444',
          padding: '6px 14px', cursor: 'pointer', fontSize: 12, borderRadius: 4,
          fontFamily: 'Courier New, monospace',
        }}>SURRENDER</button>
      </div>
    </div>
  )
}
