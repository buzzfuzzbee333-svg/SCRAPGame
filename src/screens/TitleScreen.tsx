import React from 'react';

interface TitleScreenProps {
  securedScrap: number;
  onStartRun: () => void;
  onUpgrades: () => void;
}

export default function TitleScreen({ securedScrap, onStartRun, onUpgrades }: TitleScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: '#0d0d1a',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          color: '#00ffe7',
          textShadow: '0 0 20px #00ffe7, 0 0 40px #00ffe7',
          letterSpacing: 8,
          fontWeight: 900,
        }}>
          LAST SCRAP
        </h1>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 8 }}>
          Survive. Salvage. Escape.
        </p>
      </div>

      <div style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: 8,
        padding: '12px 24px',
        color: '#f0c040',
        fontSize: '1.1rem',
      }}>
        ⚙ Secured Scrap: <strong>{securedScrap}</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200 }}>
        <button onClick={onStartRun} style={{ fontSize: '1.2rem', padding: '14px 32px' }}>
          ▶ Start Run
        </button>
        <button onClick={onUpgrades}>
          🔧 Upgrades
        </button>
      </div>
    </div>
  );
}
