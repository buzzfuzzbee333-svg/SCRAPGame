import React, { useState } from 'react'
import type { GameEngine } from '../game/GameEngine'
import { useGame } from '../GameContext'

interface Props {
  engine: GameEngine
  onClose: () => void
}

export default function DebugPanel({ engine, onClose }: Props) {
  const { addSecuredScrap } = useGame()
  const [waveInput, setWaveInput] = useState('1')

  const actions: Array<[string, () => void]> = [
    ['+ 100 Secured', () => addSecuredScrap(100)],
    ['+ 50 Unsecured', () => engine.debugAddScrap(50)],
    ['Damage Player -10', () => engine.debugDamagePlayer(10)],
    ['Damage Rig -20', () => engine.debugDamageRig(20)],
    ['Clear Enemies', () => engine.debugClearEnemies()],
    ['Skip Wave', () => engine.debugSkipWave()],
  ]

  return (
    <div style={{
      position: 'absolute', bottom: 60, right: 10, background: '#111', border: '1px solid #555',
      borderRadius: 6, padding: 12, zIndex: 50, minWidth: 180,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 'bold' }}>DEBUG</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 14 }}>✕</button>
      </div>
      {actions.map(([label, fn]) => (
        <button key={label} onClick={fn} style={{
          display: 'block', width: '100%', marginBottom: 4, background: '#222',
          color: '#ccc', border: '1px solid #444', padding: '4px 8px',
          cursor: 'pointer', fontSize: 11, textAlign: 'left', borderRadius: 3,
          fontFamily: 'Courier New, monospace',
        }}>{label}</button>
      ))}
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input
          value={waveInput}
          onChange={e => setWaveInput(e.target.value)}
          style={{ width: 50, background: '#222', border: '1px solid #444', color: '#ccc', padding: '2px 4px', fontSize: 11 }}
        />
        <button onClick={() => engine.setWaveNumber(parseInt(waveInput) || 1)} style={{
          background: '#222', color: '#ccc', border: '1px solid #444',
          padding: '2px 8px', cursor: 'pointer', fontSize: 11, borderRadius: 3,
          fontFamily: 'Courier New, monospace',
        }}>Set Wave</button>
      </div>
    </div>
  )
}
