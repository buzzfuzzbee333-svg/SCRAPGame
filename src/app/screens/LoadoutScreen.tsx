import React, { useState } from 'react';
import type { MetaState } from '../../types/state';
import { balanceConstants, upgradeDefinitions, waveRules } from '../../data/loaders';

interface Props {
  meta: MetaState;
  onBeginRun: (startWave: number) => void;
  onBack: () => void;
}

export default function LoadoutScreen({ meta, onBeginRun, onBack }: Props) {
  const [debugWave, setDebugWave] = useState(1);
  const p = balanceConstants.player_base;
  const r = balanceConstants.rig_base;

  let atk = p.attack;
  let def = p.defense;
  let hp = p.max_health;
  let spd = p.move_speed;
  let atkInt = p.attack_interval_seconds;
  let rigHp = r.max_integrity;
  let rigDef = r.defense;

  for (const upg of upgradeDefinitions) {
    const level = meta.upgradeLevels[upg.id] ?? 0;
    if (level === 0) continue;
    switch (upg.effect_type) {
      case 'player_attack_flat': atk += upg.effect_per_level * level; break;
      case 'player_attack_interval_delta': atkInt += upg.effect_per_level * level; break;
      case 'player_max_health_flat': hp += upg.effect_per_level * level; break;
      case 'player_defense_flat': def += upg.effect_per_level * level; break;
      case 'player_move_speed_flat': spd += upg.effect_per_level * level; break;
      case 'rig_max_integrity_flat': rigHp += upg.effect_per_level * level; break;
      case 'rig_defense_flat': rigDef += upg.effect_per_level * level; break;
    }
  }

  const maxWave = waveRules.length;

  return (
    <div className="screen">
      <div className="screen-content">
        <h1 className="screen-title">LOADOUT</h1>

        <div className="loadout-grid">
          <div className="stat-card">
            <div className="stat-card-title">PLAYER</div>
            <div className="stat-row"><span>HP</span><span className="green">{hp}</span></div>
            <div className="stat-row"><span>ATK</span><span className="green">{atk}</span></div>
            <div className="stat-row"><span>DEF</span><span className="green">{def}</span></div>
            <div className="stat-row"><span>SPD</span><span className="green">{spd.toFixed(2)}</span></div>
            <div className="stat-row"><span>ATK RATE</span><span className="green">{(1 / Math.max(0.15, atkInt)).toFixed(1)}/s</span></div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">RIG</div>
            <div className="stat-row"><span>INTEGRITY</span><span className="blue">{rigHp}</span></div>
            <div className="stat-row"><span>DEFENSE</span><span className="blue">{rigDef}</span></div>
            <div className="stat-row"><span>PASSIVE</span><span className="blue">+{r.passive_scrap_tick_value} scrap / {r.passive_scrap_tick_interval_seconds}s</span></div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">ECONOMY</div>
            <div className="stat-row"><span>SECURED SCRAP</span><span className="scrap-color">{meta.securedScrap}</span></div>
            <div className="stat-row"><span>CASH OUT</span><span className="green">BANK 100%</span></div>
            <div className="stat-row"><span>RIG OVERRUN</span><span className="yellow">BANK 50%</span></div>
            <div className="stat-row"><span>PLAYER DEATH</span><span className="red">BANK 0%</span></div>
          </div>
        </div>

        <div className="debug-wave-select">
          <label>DEBUG: Start at wave</label>
          <select value={debugWave} onChange={(e) => setDebugWave(Number(e.target.value))}>
            {Array.from({ length: maxWave }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>Wave {w}</option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={() => onBeginRun(debugWave)}>▶ BEGIN RUN</button>
          <button className="btn btn-ghost" onClick={onBack}>← BACK</button>
        </div>
      </div>
    </div>
  );
}
