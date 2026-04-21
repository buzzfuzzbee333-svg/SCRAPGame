import React from 'react';
import type { MetaState } from '../../types/state';

interface Props {
  onStartRun: () => void;
  onOpenUpgrades: () => void;
  meta: MetaState;
}

export default function TitleScreen({ onStartRun, onOpenUpgrades, meta }: Props) {
  return (
    <div className="screen title-screen">
      <div className="title-content">
        <div className="title-ascii">
          <pre>{`
 __    __   __   ______  ______      
/\\ \\  /\\ \\ /\\ \\ /\\  ___\\/\\__  _\\     
\\ \\ \\_\\ \\ \\\\ \\ \\\\ \\___  \\/_/\\ \\/     
 \\ \\_____\\ \\\\ \\_\\\\/\\_____\\ \\ \\_\\     
  \\/_____/_/ \\/_/ \\/_____/  \\/_/     
                                     
  ______   ______   ______  ______  
 /\\  ___\\ /\\  ___\\ /\\  == \\/\\  __ \\ 
 \\ \\___  \\\\ \\ \\____\\ \\  __<\\ \\ \\/\\ \\
  \\/\\_____\\\\ \\_____\\\\ \\_\\ \\_\\ \\_____\\
   \\/_____/ \\/_____/ \\/_/ /_/\\/_____/
          `}</pre>
        </div>
        <div className="title-tagline">DEFEND THE RIG. SURVIVE THE HORDE.</div>

        <div className="title-stats">
          <div className="stat-row">
            <span className="stat-label">SECURED SCRAP</span>
            <span className="stat-value scrap-color">{meta.securedScrap}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">RUNS</span>
            <span className="stat-value">{meta.lifetimeStats.totalRuns}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">HIGHEST WAVE</span>
            <span className="stat-value">{meta.lifetimeStats.highestWave}</span>
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={onStartRun}>▶ START RUN</button>
          <button className="btn btn-secondary" onClick={onOpenUpgrades}>⚙ UPGRADES</button>
        </div>

        <div className="title-controls-hint">
          WASD / Arrow Keys to move · Auto-attack in range · Defend the rig!
        </div>
      </div>
    </div>
  );
}
