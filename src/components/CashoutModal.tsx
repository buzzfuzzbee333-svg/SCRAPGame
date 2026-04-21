import React from 'react'

interface Props {
  waveNumber: number
  waveReward: number
  onCashOut: () => void
  onContinue: () => void
}

export default function CashoutModal({ waveNumber, waveReward, onCashOut, onContinue }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', zIndex: 20,
    }}>
      <div style={{
        background: '#1a1a2e', border: '2px solid #ffd700', borderRadius: 8,
        padding: '32px 40px', textAlign: 'center', minWidth: 300,
      }}>
        <h2 style={{ color: '#ffd700', fontSize: 24, marginBottom: 8 }}>Wave {waveNumber} Cleared!</h2>
        <p style={{ color: '#9dff8a', fontSize: 16, marginBottom: 24 }}>Wave Reward: +{waveReward} scrap</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onCashOut} style={{
            background: '#2d5a27', color: '#9dff8a', border: '1px solid #4a9e40',
            padding: '10px 20px', cursor: 'pointer', fontSize: 14, borderRadius: 4,
            fontFamily: 'Courier New, monospace',
          }}>Cash Out</button>
          <button onClick={onContinue} style={{
            background: '#1a3a5c', color: '#4fc3f7', border: '1px solid #2c7faa',
            padding: '10px 20px', cursor: 'pointer', fontSize: 14, borderRadius: 4,
            fontFamily: 'Courier New, monospace',
          }}>Continue to Wave {waveNumber + 1}</button>
        </div>
      </div>
    </div>
  )
}
