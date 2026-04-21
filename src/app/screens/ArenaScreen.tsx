import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MetaState } from '../../types/state';
import type { RunSummary, GameState } from '../game/GameEngine';
import {
  createGameState, updateGame, startWave, startNextWave, resolveRunEnd,
  WORLD_W, WORLD_H
} from '../game/GameEngine';
import { renderGame } from '../game/renderer';
import { createInputHandler } from '../game/inputHandler';
import MobileControls from '../components/MobileControls';
import CashoutModal from '../components/CashoutModal';
import DebugPanel from '../components/DebugPanel';

interface Props {
  meta: MetaState;
  startAtWave: number;
  onRunEnd: (summary: RunSummary, highestWave: number) => void;
}

export default function ArenaScreen({ meta, startAtWave, onRunEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(startWave(createGameState(meta), startAtWave));
  const inputHandlerRef = useRef(createInputHandler());
  const joystickRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const highestWaveRef = useRef(startAtWave);
  const runEndedRef = useRef(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const [hudData, setHudData] = useState(() => {
    const s = gameStateRef.current;
    return {
      playerHp: s.player.hp,
      playerMaxHp: s.player.maxHp,
      rigHp: s.rig.hp,
      rigMaxHp: s.rig.maxHp,
      wave: s.waveIndex,
      unsecuredScrap: s.unsecuredScrap,
      phase: s.phase,
    };
  });

  const hudUpdateTimerRef = useRef(0);

  const gameLoop = useCallback((timestamp: number) => {
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const canvas = canvasRef.current;
    if (!canvas) { animFrameRef.current = requestAnimationFrame(gameLoop); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { animFrameRef.current = requestAnimationFrame(gameLoop); return; }

    const scaleX = canvas.width / WORLD_W;
    const scaleY = canvas.height / WORLD_H;

    const input = inputHandlerRef.current.getInput(joystickRef.current);
    const { nextState } = updateGame(gameStateRef.current, dt, input);
    gameStateRef.current = nextState;

    if (nextState.waveIndex > highestWaveRef.current) {
      highestWaveRef.current = nextState.waveIndex;
    }

    ctx.save();
    ctx.scale(scaleX, scaleY);
    renderGame(ctx, nextState, WORLD_W, WORLD_H);
    ctx.restore();

    hudUpdateTimerRef.current += dt;
    if (hudUpdateTimerRef.current >= 0.1) {
      hudUpdateTimerRef.current = 0;
      setHudData({
        playerHp: nextState.player.hp,
        playerMaxHp: nextState.player.maxHp,
        rigHp: nextState.rig.hp,
        rigMaxHp: nextState.rig.maxHp,
        wave: nextState.waveIndex,
        unsecuredScrap: nextState.unsecuredScrap,
        phase: nextState.phase,
      });
    }

    if (nextState.phase === 'ended' && !runEndedRef.current) {
      runEndedRef.current = true;
      const summary = resolveRunEnd(nextState);
      setTimeout(() => onRunEnd(summary, highestWaveRef.current), 800);
      return;
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [onRunEnd]);

  useEffect(() => {
    const handler = inputHandlerRef.current;
    handler.attach();
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      handler.detach();
    };
  }, [gameLoop]);

  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const aspect = WORLD_W / WORLD_H;
      let w = cw;
      let h = w / aspect;
      if (h > ch) {
        h = ch;
        w = h * aspect;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  function onCashOut() {
    const s = gameStateRef.current;
    gameStateRef.current = { ...s, phase: 'ended', endReason: 'cash_out' };
    if (!animFrameRef.current) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }

  function onContinue() {
    const s = gameStateRef.current;
    const nextState = startNextWave(s);
    gameStateRef.current = nextState;
    if (!animFrameRef.current) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    setHudData((h) => ({ ...h, phase: 'wave_active', wave: nextState.waveIndex }));
  }

  function onSurrender() {
    const s = gameStateRef.current;
    gameStateRef.current = { ...s, phase: 'ended', endReason: 'surrender' };
    if (!animFrameRef.current) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }

  function onDebugAction(action: string, value?: number) {
    const s = gameStateRef.current;
    switch (action) {
      case 'add_unsecured':
        gameStateRef.current = { ...s, unsecuredScrap: s.unsecuredScrap + (value ?? 50) };
        break;
      case 'damage_player':
        gameStateRef.current = { ...s, player: { ...s.player, hp: Math.max(1, s.player.hp - (value ?? 10)) } };
        break;
      case 'damage_rig':
        gameStateRef.current = { ...s, rig: { ...s.rig, hp: Math.max(1, s.rig.hp - (value ?? 20)) } };
        break;
      case 'clear_enemies':
        gameStateRef.current = { ...s, enemies: [] };
        break;
      case 'trigger_wave_clear':
        gameStateRef.current = {
          ...s,
          enemies: [],
          unsecuredScrap: s.unsecuredScrap + s.rig.passiveValue,
          phase: 'cashout_window',
        };
        break;
      case 'start_wave':
        gameStateRef.current = startWave(s, value ?? 1);
        break;
    }
  }

  const showCashout = hudData.phase === 'cashout_window';

  return (
    <div className="arena-screen">
      <div className="arena-hud">
        <div className="hud-left">
          <div className="hud-stat">
            <span className="hud-label">HP</span>
            <div className="hud-bar-wrap">
              <div className="hud-bar hp-bar" style={{ width: `${(hudData.playerHp / hudData.playerMaxHp) * 100}%` }} />
            </div>
            <span className="hud-value">{Math.ceil(hudData.playerHp)}/{hudData.playerMaxHp}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">RIG</span>
            <div className="hud-bar-wrap">
              <div className="hud-bar rig-bar" style={{ width: `${(hudData.rigHp / hudData.rigMaxHp) * 100}%` }} />
            </div>
            <span className="hud-value">{Math.ceil(hudData.rigHp)}/{hudData.rigMaxHp}</span>
          </div>
        </div>
        <div className="hud-center">
          <div className="hud-wave">WAVE {hudData.wave}</div>
        </div>
        <div className="hud-right">
          <div className="hud-scrap">⚙ {hudData.unsecuredScrap}</div>
          <button className="btn btn-ghost btn-sm" onClick={onSurrender}>QUIT</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setDebugOpen((v) => !v)}>DBG</button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={WORLD_W}
          height={WORLD_H}
          className="game-canvas"
        />
      </div>

      <MobileControls
        onJoystick={(dx, dy) => { joystickRef.current = { dx, dy }; }}
      />

      {showCashout && (
        <CashoutModal
          waveCleared={hudData.wave}
          unsecuredScrap={hudData.unsecuredScrap}
          onCashOut={onCashOut}
          onContinue={onContinue}
        />
      )}

      {debugOpen && (
        <DebugPanel
          gameState={gameStateRef.current}
          onAction={onDebugAction}
          onClose={() => setDebugOpen(false)}
        />
      )}
    </div>
  );
}
