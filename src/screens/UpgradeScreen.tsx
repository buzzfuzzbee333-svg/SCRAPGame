import React from 'react';
import { upgradeDefinitions } from '../data/loaders';
import { ProgressionSystem } from '../systems/progressionSystem';
import type { MetaState } from '../types/state';

interface UpgradeScreenProps {
  metaState: MetaState;
  onSpend: (amount: number) => void;
  onSetUpgradeLevel: (id: string, level: number) => void;
  onBack: () => void;
}

const progression = new ProgressionSystem();

const CATEGORY_LABELS: Record<string, string> = {
  combat: '⚔️ Combat',
  survival: '🛡️ Survival',
  rig: '🔩 Rig',
  economy: '💰 Economy',
};

export default function UpgradeScreen({ metaState, onSpend, onSetUpgradeLevel, onBack }: UpgradeScreenProps) {
  const grouped = upgradeDefinitions.reduce<Record<string, typeof upgradeDefinitions>>((acc, upg) => {
    (acc[upg.category] = acc[upg.category] ?? []).push(upg);
    return acc;
  }, {});

  const handleBuy = (upgradeId: string) => {
    if (!progression.canPurchase(metaState, upgradeId)) return;
    const cost = progression.getUpgradeCost(metaState, upgradeId);
    const currentLevel = progression.getUpgradeLevel(metaState, upgradeId);
    onSpend(cost);
    onSetUpgradeLevel(upgradeId, currentLevel + 1);
  };

  return (
    <div style={{
      height: '100%',
      background: '#0d0d1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px',
        background: '#1a1a2e',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <h2 style={{ color: '#00ffe7', fontSize: '1.5rem', letterSpacing: 4 }}>UPGRADES</h2>
        <div style={{ color: '#f0c040', fontSize: '1rem' }}>
          ⚙ {metaState.securedScrap} scrap
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {Object.entries(grouped).map(([category, upgrades]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#888', fontSize: '0.9rem', marginBottom: 12, letterSpacing: 2 }}>
              {CATEGORY_LABELS[category] ?? category.toUpperCase()}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upgrades.map((upg) => {
                const level = progression.getUpgradeLevel(metaState, upg.id);
                const isMaxed = level >= upg.level_cap;
                const cost = isMaxed ? 0 : progression.getUpgradeCost(metaState, upg.id);
                const canAfford = !isMaxed && metaState.securedScrap >= cost;

                return (
                  <div key={upg.id} style={{
                    background: '#1a1a2e',
                    border: `1px solid ${isMaxed ? '#444' : '#334'}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: isMaxed ? '#888' : '#e0e0e0', fontWeight: 600 }}>
                          {upg.name}
                        </span>
                        <span style={{
                          color: isMaxed ? '#888' : '#00ffe7',
                          fontSize: '0.8rem',
                          background: '#0a0a1a',
                          padding: '1px 6px',
                          borderRadius: 3,
                          border: '1px solid #334',
                        }}>
                          {isMaxed ? 'MAX' : `${level}/${upg.level_cap}`}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>{upg.description}</div>
                    </div>
                    <button
                      onClick={() => handleBuy(upg.id)}
                      disabled={isMaxed || !canAfford}
                      style={{
                        minWidth: 72,
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        borderColor: isMaxed ? '#444' : canAfford ? '#f0c040' : '#554400',
                        color: isMaxed ? '#444' : canAfford ? '#f0c040' : '#554400',
                      }}
                    >
                      {isMaxed ? 'Max' : `⚙ ${cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 24px', borderTop: '1px solid #333', background: '#1a1a2e', flexShrink: 0 }}>
        <button onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}
