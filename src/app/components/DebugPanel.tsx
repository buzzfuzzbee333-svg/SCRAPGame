import React from 'react';
import type { GameState } from '../game/GameEngine';

interface Props {
  gameState: GameState;
  onAction: (action: string, value?: number) => void;
  onClose: () => void;
}

export default function DebugPanel({ gameState, onAction, onClose }: Props) {
  return (
    <div className="debug-panel">
      <div className="debug-header">
        <span>DEBUG</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>&#10005;</button>
      </div>
      <div className="debug-info">
        <div>Phase: {gameState.phase}</div>
        <div>Wave: {gameState.waveIndex}</div>
        <div>Enemies: {gameState.enemies.filter((e) => !e.isDead).length}</div>
        <div>Scrap: {gameState.unsecuredScrap}</div>
        <div>Player HP: {Math.ceil(gameState.player.hp)}/{gameState.player.maxHp}</div>
        <div>Rig HP: {Math.ceil(gameState.rig.hp)}/{gameState.rig.maxHp}</div>
      </div>
      <div className="debug-actions">
        <button className="btn btn-sm btn-ghost" onClick={() => onAction('add_unsecured', 50)}>+50 Scrap</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onAction('damage_player', 10)}>-10 HP Player</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onAction('damage_rig', 20)}>-20 HP Rig</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onAction('clear_enemies')}>Clear Enemies</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onAction('trigger_wave_clear')}>Force Wave Clear</button>
        {[1, 2, 3, 4, 5].map((w) => (
          <button key={w} className="btn btn-sm btn-ghost" onClick={() => onAction('start_wave', w)}>
            Wave {w}
          </button>
        ))}
      </div>
    </div>
  );
}
