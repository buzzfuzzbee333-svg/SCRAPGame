import React from 'react';
import { ProgressionSystem } from '../systems/progressionSystem';
import { createDefaultRunState } from '../stores/runStateStore';
import type { MetaState } from '../types/state';

interface PreRunScreenProps {
  metaState: MetaState;
  onBeginRun: () => void;
  onBack: () => void;
}

const progression = new ProgressionSystem();

export default function PreRunScreen({ metaState, onBeginRun, onBack }: PreRunScreenProps) {
  const defaultRun = createDefaultRunState();
  const { player } = progression.applyUpgradesToRunState(metaState, defaultRun.player, defaultRun.rig);

  const stats = [
    { label: 'Max HP', value: player.maxHealth },
    { label: 'Attack', value: player.attack },
    { label: 'Defense', value: player.defense },
    { label: 'Move Speed', value: player.moveSpeed.toFixed(2) },
    { label: 'Attack Interval', value: `${player.attackIntervalSeconds.toFixed(2)}s` },
  ];

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
      <h2 style={{ color: '#00ffe7', fontSize: '2rem', letterSpacing: 4 }}>PRE-RUN LOADOUT</h2>

      <div style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: 8,
        padding: 24,
        minWidth: 280,
      }}>
        <h3 style={{ color: '#f0c040', marginBottom: 16, textAlign: 'center' }}>Your Stats</h3>
        {stats.map((s) => (
          <div key={s.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            gap: 24,
          }}>
            <span style={{ color: '#aaa' }}>{s.label}</span>
            <span style={{ color: '#00ffe7', fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div style={{ color: '#f0c040', fontSize: '1rem' }}>
        ⚙ Secured Scrap: <strong>{metaState.securedScrap}</strong>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onBack}>← Back</button>
        <button onClick={onBeginRun} style={{ fontSize: '1.2rem', padding: '14px 32px' }}>
          ▶ Begin Run
        </button>
      </div>
    </div>
  );
}
