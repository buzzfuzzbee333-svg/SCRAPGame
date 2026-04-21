import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useArenaGame } from '../hooks/useArenaGame';
import HUD from '../components/HUD';
import CashoutModal from '../components/CashoutModal';
import DebugPanel from '../components/DebugPanel';
import type { MetaState } from '../types/state';
import type { RunSummaryData } from '../hooks/useArenaGame';

interface ArenaScreenProps {
  metaState: MetaState;
  onRunEnd: (summary: RunSummaryData) => void;
}

export default function ArenaScreen({ metaState, onRunEnd }: ArenaScreenProps) {
  const [debugVisible, setDebugVisible] = useState(false);
  const touchDirRef = useRef<Set<string>>(new Set());

  const game = useArenaGame({ metaState, onRunEnd });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') setDebugVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setTouchDir = useCallback((dir: string, active: boolean) => {
    if (active) {
      touchDirRef.current.add(dir);
    } else {
      touchDirRef.current.delete(dir);
    }
    game.setTouchInput(Array.from(touchDirRef.current));
  }, [game]);

  const DPadButton = ({ dir, label }: { dir: string; label: string }) => (
    <button
      onPointerDown={(e) => { e.preventDefault(); setTouchDir(dir, true); }}
      onPointerUp={(e) => { e.preventDefault(); setTouchDir(dir, false); }}
      onPointerLeave={(e) => { e.preventDefault(); setTouchDir(dir, false); }}
      style={{
        width: 52,
        height: 52,
        fontSize: '1.4rem',
        background: 'rgba(0, 255, 231, 0.15)',
        border: '1.5px solid rgba(0, 255, 231, 0.4)',
        borderRadius: 8,
        color: '#00ffe7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      } as React.CSSProperties}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0d0d1a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <HUD
        playerHp={game.playerHp}
        playerMaxHp={game.playerMaxHp}
        rigIntegrity={game.rigIntegrity}
        rigMaxIntegrity={game.rigMaxIntegrity}
        waveNum={game.waveNum}
        unsecuredScrap={game.unsecuredScrap}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 44,
        overflow: 'hidden',
      }}>
        <canvas
          ref={game.canvasRef}
          width={800}
          height={600}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '8px 16px',
        background: 'rgba(10, 10, 30, 0.85)',
        gap: 8,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <DPadButton dir="ArrowUp" label="▲" />
          <div style={{ display: 'flex', gap: 4 }}>
            <DPadButton dir="ArrowLeft" label="◀" />
            <div style={{ width: 52 }} />
            <DPadButton dir="ArrowRight" label="▶" />
          </div>
          <DPadButton dir="ArrowDown" label="▼" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <button
            onClick={game.surrender}
            style={{ borderColor: '#ff4444', color: '#ff4444', fontSize: '0.8rem', padding: '8px 16px' }}
          >
            ✕ Surrender
          </button>
          <button
            onClick={() => setDebugVisible((v) => !v)}
            style={{ borderColor: '#660066', color: '#cc44cc', fontSize: '0.7rem', padding: '4px 10px' }}
          >
            🐛
          </button>
        </div>

        <div style={{ width: 172 }} />
      </div>

      {game.cashoutOpen && (
        <CashoutModal
          waveNum={game.waveNum}
          unsecuredScrap={game.unsecuredScrap}
          onCashOut={game.cashOut}
          onContinue={game.continueToNextWave}
        />
      )}

      <DebugPanel
        visible={debugVisible}
        onAddSecuredScrap={() => {
          // Secured scrap is meta-level; no-op here as it requires App-level state
        }}
        onAddUnsecuredScrap={game.debug.addUnsecuredScrap}
        onDamagePlayer={game.debug.damagePlayer}
        onDamageRig={game.debug.damageRig}
        onKillAll={game.debug.killAll}
        onJumpToWave={game.debug.jumpToWave}
      />
    </div>
  );
}
