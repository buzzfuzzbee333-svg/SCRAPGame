import React from 'react'
import { useGame } from '../GameContext'

const END_LABELS: Record<string, string> = {
  cash_out: '💰 Cash Out',
  rig_overrun: '🔥 Rig Overrun',
  player_death: '💀 Player Death',
  surrender: '🏳 Surrender',
}

export default function EndOfRunScreen() {
  const { meta, lastRunResult, goToTitle, goToUpgrades } = useGame()

  if (!lastRunResult) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a15' }}>
        <button onClick={goToTitle} style={btnStyle('#333', '#aaa', '#555')}>Back to Title</button>
      </div>
    )
  }

  const r = lastRunResult

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: '#0a0a15', padding: 24,
    }}>
      <h2 style={{ color: '#ffd700', fontSize: 28, letterSpacing: 4 }}>RUN COMPLETE</h2>
      <div style={{ color: '#aaa', fontSize: 18, marginBottom: 8 }}>
        {END_LABELS[r.endType] ?? r.endType}
      </div>
      <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 6, padding: '20px 32px', minWidth: 280 }}>
        {([
          ['Highest Wave', r.highestWave],
          ['Scrap Before Resolution', r.unsecuredBefore],
          ['Scrap Lost', r.lostScrap],
          ['Scrap Banked', r.bankedScrap],
          ['New Total Secured', meta.securedScrap],
        ] as [string, number][]).map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 8, fontSize: 14 }}>
            <span style={{ color: '#aaa' }}>{label}</span>
            <span style={{
              color: label === 'Scrap Banked' ? '#9dff8a' : label === 'Scrap Lost' ? '#f44336' : '#eee',
              fontWeight: 'bold'
            }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={goToTitle} style={btnStyle('#333', '#aaa', '#555')}>← Title</button>
        <button onClick={goToUpgrades} style={btnStyle('#1a3a5c', '#4fc3f7', '#2c7faa')}>⚙ Upgrades</button>
      </div>
    </div>
  )
}

function btnStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${border}`,
    padding: '10px 28px', cursor: 'pointer', fontSize: 14, borderRadius: 4,
    fontFamily: 'Courier New, monospace', letterSpacing: 2,
  }
}
