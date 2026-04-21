import React from 'react'
import { useGame } from '../GameContext'

export default function TitleScreen() {
  const { meta, goToPreRun, goToUpgrades } = useGame()

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a15 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 56, color: '#ffd700', letterSpacing: 8, textShadow: '0 0 20px #ffd70077', marginBottom: 8 }}>LAST SCRAP</h1>
        <p style={{ color: '#666', fontSize: 13, letterSpacing: 4 }}>VERTICAL SLICE v1</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <button onClick={goToPreRun} style={btnStyle('#2d5a27', '#9dff8a', '#4a9e40')}>
          ▶ START RUN
        </button>
        <button onClick={goToUpgrades} style={btnStyle('#1a3a5c', '#4fc3f7', '#2c7faa')}>
          ⚙ UPGRADES
        </button>
      </div>
      <div style={{ color: '#ffd700', fontSize: 14 }}>
        Secured Scrap: <span style={{ fontWeight: 'bold' }}>{meta.securedScrap}</span>
      </div>
      {meta.lifetimeStats.totalRuns > 0 && (
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', lineHeight: 1.8 }}>
          Runs: {meta.lifetimeStats.totalRuns} · Highest Wave: {meta.lifetimeStats.highestWave}
        </div>
      )}
    </div>
  )
}

function btnStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${border}`,
    padding: '12px 40px', cursor: 'pointer', fontSize: 16, borderRadius: 4,
    fontFamily: 'Courier New, monospace', letterSpacing: 2, minWidth: 220,
    transition: 'opacity 0.2s',
  }
}
