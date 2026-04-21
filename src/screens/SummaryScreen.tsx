import React from 'react';
import type { EndType } from '../types/data';

interface SummaryProps {
  summary: {
    endType: EndType;
    unsecuredScrapBefore: number;
    lostScrap: number;
    bankedScrap: number;
    highestWaveReached: number;
  };
  securedScrap: number;
  onContinue: () => void;
}

const END_LABELS: Record<EndType, { label: string; color: string; icon: string }> = {
  cash_out: { label: 'Cashed Out', color: '#44ff44', icon: '💰' },
  player_death: { label: 'You Died', color: '#ff4444', icon: '💀' },
  rig_overrun: { label: 'Rig Overrun', color: '#ff8800', icon: '💥' },
  surrender: { label: 'Surrendered', color: '#ffcc00', icon: '🏳️' },
};

export default function SummaryScreen({ summary, securedScrap, onContinue }: SummaryProps) {
  const info = END_LABELS[summary.endType];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: '#0d0d1a',
      gap: 24,
      padding: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>{info.icon}</div>
        <h2 style={{ color: info.color, fontSize: '2rem', letterSpacing: 4 }}>{info.label}</h2>
        <p style={{ color: '#666', marginTop: 4 }}>Wave {summary.highestWaveReached} reached</p>
      </div>

      <div style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: 8,
        padding: 24,
        minWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {[
          { label: 'Unsecured Scrap', value: summary.unsecuredScrapBefore, color: '#e0e0e0' },
          { label: 'Scrap Lost', value: `-${summary.lostScrap}`, color: '#ff4444' },
          { label: 'Scrap Banked', value: `+${summary.bankedScrap}`, color: '#44ff44' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ color: '#aaa' }}>{label}</span>
            <span style={{ color, fontWeight: 700 }}>{value}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #333', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#f0c040' }}>Total Secured Scrap</span>
          <span style={{ color: '#f0c040', fontWeight: 700 }}>{securedScrap}</span>
        </div>
      </div>

      <button onClick={onContinue} style={{ fontSize: '1.1rem', padding: '12px 32px' }}>
        ← Back to Title
      </button>
    </div>
  );
}
