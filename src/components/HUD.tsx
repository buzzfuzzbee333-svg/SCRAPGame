import React from 'react';

interface HUDProps {
  playerHp: number;
  playerMaxHp: number;
  rigIntegrity: number;
  rigMaxIntegrity: number;
  waveNum: number;
  unsecuredScrap: number;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div style={{
      background: '#222',
      borderRadius: 4,
      height: 14,
      width: '100%',
      overflow: 'hidden',
      border: '1px solid #444',
    }}>
      <div style={{
        width: `${pct * 100}%`,
        height: '100%',
        background: color,
        transition: 'width 0.1s',
      }} />
    </div>
  );
}

export default function HUD({ playerHp, playerMaxHp, rigIntegrity, rigMaxIntegrity, waveNum, unsecuredScrap }: HUDProps) {
  const hpColor = playerHp / playerMaxHp > 0.5 ? '#44ff44' : playerHp / playerMaxHp > 0.25 ? '#ffcc00' : '#ff3333';
  const rigColor = rigIntegrity / rigMaxIntegrity > 0.3 ? '#00ffe7' : '#ff4444';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '8px 12px',
      background: 'rgba(10, 10, 30, 0.85)',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
      zIndex: 10,
    }}>
      <div style={{ flex: '1 1 120px', minWidth: 100 }}>
        <div style={{ color: '#aaa', fontSize: '0.7rem', marginBottom: 2 }}>
          HP: {playerHp}/{playerMaxHp}
        </div>
        <Bar value={playerHp} max={playerMaxHp} color={hpColor} />
      </div>
      <div style={{ flex: '1 1 120px', minWidth: 100 }}>
        <div style={{ color: '#aaa', fontSize: '0.7rem', marginBottom: 2 }}>
          RIG: {Math.ceil(rigIntegrity)}/{rigMaxIntegrity}
        </div>
        <Bar value={rigIntegrity} max={rigMaxIntegrity} color={rigColor} />
      </div>
      <div style={{
        color: '#f0c040',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        padding: '4px 8px',
        background: '#1a1a00',
        borderRadius: 4,
        border: '1px solid #554400',
      }}>
        WAVE {waveNum}
      </div>
      <div style={{
        color: '#00ffe7',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        padding: '4px 8px',
        background: '#001a1a',
        borderRadius: 4,
        border: '1px solid #004444',
      }}>
        ⚙ {unsecuredScrap}
      </div>
    </div>
  );
}
