import React from 'react'
import { useGame } from '../GameContext'
import { upgradeDefinitions } from '../data/loaders'

const CATEGORY_COLORS: Record<string, string> = {
  combat: '#f44336',
  survival: '#4caf50',
  rig: '#9dff8a',
  economy: '#ffd700',
}

export default function UpgradeScreen() {
  const { meta, goToTitle, spendSecuredScrap, setUpgradeLevel } = useGame()

  const handleBuy = (id: string) => {
    const def = upgradeDefinitions.find(u => u.id === id)
    if (!def) return
    const currentLevel = meta.upgradeLevels[id] ?? 0
    if (currentLevel >= def.level_cap) return
    const cost = def.base_cost + currentLevel * def.cost_step
    const ok = spendSecuredScrap(cost)
    if (ok) setUpgradeLevel(id, currentLevel + 1)
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', background: '#0a0a15', padding: 24, overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 700, marginBottom: 16 }}>
        <h2 style={{ color: '#ffd700', fontSize: 24, letterSpacing: 4 }}>UPGRADES</h2>
        <div style={{ color: '#ffd700', fontSize: 16 }}>⚙ {meta.securedScrap} scrap</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, width: '100%', maxWidth: 700 }}>
        {upgradeDefinitions.map(upg => {
          const level = meta.upgradeLevels[upg.id] ?? 0
          const atCap = level >= upg.level_cap
          const cost = upg.base_cost + level * upg.cost_step
          const canAfford = meta.securedScrap >= cost
          const color = CATEGORY_COLORS[upg.category] ?? '#eee'

          return (
            <div key={upg.id} style={{
              background: '#1a1a2e', border: `1px solid ${atCap ? '#555' : '#333'}`,
              borderRadius: 6, padding: '14px 16px',
              opacity: atCap ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color, fontWeight: 'bold', fontSize: 14 }}>{upg.name}</span>
                <span style={{ color: '#aaa', fontSize: 12 }}>{level}/{upg.level_cap}</span>
              </div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 10 }}>{upg.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: atCap ? '#555' : '#ffd700', fontSize: 12 }}>
                  {atCap ? 'MAX' : `Cost: ${cost} scrap`}
                </span>
                <button
                  disabled={atCap || !canAfford}
                  onClick={() => handleBuy(upg.id)}
                  style={{
                    background: atCap ? '#333' : canAfford ? '#2d5a27' : '#1a1a1a',
                    color: atCap ? '#555' : canAfford ? '#9dff8a' : '#555',
                    border: `1px solid ${atCap ? '#444' : canAfford ? '#4a9e40' : '#333'}`,
                    padding: '4px 16px', cursor: atCap || !canAfford ? 'not-allowed' : 'pointer',
                    fontSize: 12, borderRadius: 3,
                    fontFamily: 'Courier New, monospace',
                  }}
                >
                  {atCap ? 'MAX' : 'Buy'}
                </button>
              </div>
              {!atCap && (
                <div style={{ marginTop: 6, height: 3, background: '#222', borderRadius: 2 }}>
                  <div style={{ height: '100%', background: color, borderRadius: 2, width: `${(level / upg.level_cap) * 100}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <button onClick={goToTitle} style={{
        marginTop: 24, background: '#333', color: '#aaa', border: '1px solid #555',
        padding: '10px 28px', cursor: 'pointer', fontSize: 14, borderRadius: 4,
        fontFamily: 'Courier New, monospace', letterSpacing: 2,
      }}>← Back to Title</button>
    </div>
  )
}
