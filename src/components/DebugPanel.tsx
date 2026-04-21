import React, { useState } from 'react';

interface DebugPanelProps {
  visible: boolean;
  onAddSecuredScrap: () => void;
  onAddUnsecuredScrap: () => void;
  onDamagePlayer: () => void;
  onDamageRig: () => void;
  onKillAll: () => void;
  onJumpToWave: (wave: number) => void;
}

export default function DebugPanel({
  visible,
  onAddSecuredScrap,
  onAddUnsecuredScrap,
  onDamagePlayer,
  onDamageRig,
  onKillAll,
  onJumpToWave,
}: DebugPanelProps) {
  const [jumpWave, setJumpWave] = useState(1);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      right: 8,
      background: 'rgba(20, 0, 40, 0.95)',
      border: '1px solid #660066',
      borderRadius: 8,
      padding: 12,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 180,
      fontSize: '0.8rem',
    }}>
      <div style={{ color: '#cc44cc', fontWeight: 700, marginBottom: 4 }}>🐛 DEBUG</div>
      <button onClick={onAddSecuredScrap} style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: '#cc44cc', color: '#cc44cc' }}>
        +50 Secured Scrap
      </button>
      <button onClick={onAddUnsecuredScrap} style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: '#cc44cc', color: '#cc44cc' }}>
        +20 Unsecured Scrap
      </button>
      <button onClick={onDamagePlayer} style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: '#cc44cc', color: '#cc44cc' }}>
        Damage Player -10
      </button>
      <button onClick={onDamageRig} style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: '#cc44cc', color: '#cc44cc' }}>
        Damage Rig -20
      </button>
      <button onClick={onKillAll} style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: '#cc44cc', color: '#cc44cc' }}>
        Kill All Enemies
      </button>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select
          value={jumpWave}
          onChange={(e) => setJumpWave(Number(e.target.value))}
          style={{
            flex: 1,
            background: '#1a001a',
            color: '#cc44cc',
            border: '1px solid #660066',
            borderRadius: 4,
            padding: '4px',
            fontSize: '0.75rem',
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Wave {i + 1}</option>
          ))}
        </select>
        <button
          onClick={() => onJumpToWave(jumpWave)}
          style={{ fontSize: '0.75rem', padding: '6px 8px', borderColor: '#cc44cc', color: '#cc44cc' }}
        >
          Jump
        </button>
      </div>
    </div>
  );
}
