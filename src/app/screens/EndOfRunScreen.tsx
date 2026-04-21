import React from 'react';
import type { RunSummary } from '../game/GameEngine';
import type { MetaState } from '../../types/state';

interface Props {
  summary: RunSummary;
  meta: MetaState;
  onPlayAgain: () => void;
  onUpgrades: () => void;
  onTitle: () => void;
}

const END_TITLES: Record<string, string> = {
  cash_out: '&#10003; CASHED OUT',
  rig_overrun: '&#10007; RIG OVERRUN',
  player_death: '&#10007; RUNNER DOWN',
  surrender: '&#8617; SURRENDERED',
};

const END_COLORS: Record<string, string> = {
  cash_out: 'green',
  rig_overrun: 'yellow',
  player_death: 'red',
  surrender: 'gray',
};

export default function EndOfRunScreen({ summary, meta, onPlayAgain, onUpgrades, onTitle }: Props) {
  const title = END_TITLES[summary.endReason] ?? '— RUN ENDED —';
  const colorClass = END_COLORS[summary.endReason] ?? '';

  return (
    <div className="screen">
      <div className="screen-content end-screen">
        <h1 className={`screen-title ${colorClass}`}>{title}</h1>

        <div className="summary-card">
          <div className="summary-row">
            <span>UNSECURED SCRAP (before)</span>
            <span className="scrap-color">{summary.unsecuredScrapBefore}</span>
          </div>
          <div className="summary-row lost">
            <span>SCRAP LOST</span>
            <span className="red">-{summary.scrapLost}</span>
          </div>
          <div className="summary-row banked">
            <span>SCRAP BANKED</span>
            <span className="green">+{summary.scrapBanked}</span>
          </div>
          <div className="summary-row total">
            <span>SECURED SCRAP TOTAL</span>
            <span className="scrap-color">{meta.securedScrap}</span>
          </div>
        </div>

        <div className="summary-lifetime">
          <div className="stat-row"><span>RUNS</span><span>{meta.lifetimeStats.totalRuns}</span></div>
          <div className="stat-row"><span>HIGHEST WAVE</span><span>{meta.lifetimeStats.highestWave}</span></div>
          <div className="stat-row"><span>CASHOUTS</span><span>{meta.lifetimeStats.totalCashouts}</span></div>
          <div className="stat-row"><span>DEATHS</span><span>{meta.lifetimeStats.totalDeaths}</span></div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={onPlayAgain}>&#9658; PLAY AGAIN</button>
          <button className="btn btn-secondary" onClick={onUpgrades}>&#9881; UPGRADES</button>
          <button className="btn btn-ghost" onClick={onTitle}>&#8592; TITLE</button>
        </div>
      </div>
    </div>
  );
}
