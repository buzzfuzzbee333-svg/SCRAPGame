import React from 'react';
import type { MetaState } from '../../types/state';
import { upgradeDefinitions } from '../../data/loaders';

interface Props {
  meta: MetaState;
  onUpdateMeta: (next: MetaState) => void;
  onBack: () => void;
}

export default function UpgradeScreen({ meta, onUpdateMeta, onBack }: Props) {
  function getCost(id: string): number {
    const upg = upgradeDefinitions.find((u) => u.id === id)!;
    const level = meta.upgradeLevels[id] ?? 0;
    return upg.base_cost + level * upg.cost_step;
  }

  function canBuy(id: string): boolean {
    const upg = upgradeDefinitions.find((u) => u.id === id)!;
    const level = meta.upgradeLevels[id] ?? 0;
    if (level >= upg.level_cap) return false;
    return meta.securedScrap >= getCost(id);
  }

  function buyUpgrade(id: string) {
    if (!canBuy(id)) return;
    const cost = getCost(id);
    const currentLevel = meta.upgradeLevels[id] ?? 0;
    const nextMeta: MetaState = {
      ...meta,
      securedScrap: meta.securedScrap - cost,
      upgradeLevels: { ...meta.upgradeLevels, [id]: currentLevel + 1 },
    };
    onUpdateMeta(nextMeta);
  }

  const categories = ['combat', 'survival', 'rig', 'economy'] as const;

  return (
    <div className="screen">
      <div className="screen-content">
        <h1 className="screen-title">UPGRADES</h1>
        <div className="secured-scrap-display">
          &#9881; SECURED SCRAP: <span className="scrap-color">{meta.securedScrap}</span>
        </div>

        {categories.map((cat) => (
          <div key={cat} className="upgrade-category">
            <div className="upgrade-category-title">{cat.toUpperCase()}</div>
            <div className="upgrade-list">
              {upgradeDefinitions
                .filter((u) => u.category === cat)
                .map((u) => {
                  const level = meta.upgradeLevels[u.id] ?? 0;
                  const cost = getCost(u.id);
                  const maxed = level >= u.level_cap;
                  const affordable = canBuy(u.id);
                  return (
                    <div key={u.id} className={`upgrade-item ${maxed ? 'maxed' : ''}`}>
                      <div className="upgrade-info">
                        <div className="upgrade-name">{u.name}</div>
                        <div className="upgrade-desc">{u.description}</div>
                        <div className="upgrade-level">
                          {'&#9646;'.repeat(level)}{'&#9647;'.repeat(Math.max(0, u.level_cap - level))}
                          <span className="upgrade-level-text"> {level}/{u.level_cap}</span>
                        </div>
                      </div>
                      <div className="upgrade-buy">
                        {maxed ? (
                          <span className="maxed-label">MAX</span>
                        ) : (
                          <button
                            className={`btn btn-sm ${affordable ? 'btn-primary' : 'btn-disabled'}`}
                            onClick={() => buyUpgrade(u.id)}
                            disabled={!affordable}
                          >
                            {cost} &#9881;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="button-group">
          <button className="btn btn-ghost" onClick={onBack}>&#8592; BACK</button>
        </div>
      </div>
    </div>
  );
}
