import React from 'react';

interface CashoutModalProps {
  waveNum: number;
  unsecuredScrap: number;
  onCashOut: () => void;
  onContinue: () => void;
}

export default function CashoutModal({ waveNum, unsecuredScrap, onCashOut, onContinue }: CashoutModalProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '2px solid #00ffe7',
        borderRadius: 12,
        padding: 32,
        minWidth: 280,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <h2 style={{ color: '#00ffe7', fontSize: '1.5rem' }}>⚡ Wave {waveNum} Cleared!</h2>
        <div style={{
          background: '#0d0d1a',
          border: '1px solid #333',
          borderRadius: 8,
          padding: '12px 20px',
        }}>
          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Unsecured Scrap</div>
          <div style={{ color: '#f0c040', fontSize: '2rem', fontWeight: 700 }}>{unsecuredScrap}</div>
        </div>
        <div style={{ color: '#888', fontSize: '0.8rem' }}>
          Cash Out = 100% banked • Continue = risk it!
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onCashOut}
            style={{ borderColor: '#f0c040', color: '#f0c040', flex: 1 }}
          >
            💰 Cash Out
          </button>
          <button
            onClick={onContinue}
            style={{ flex: 1 }}
          >
            ▶ Continue
          </button>
        </div>
      </div>
    </div>
  );
}
