import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useGame } from '../GameContext'
import { GameEngine } from '../game/GameEngine'
import type { HUDData } from '../game/types'
import type { RunEndResult as GameRunEndResult } from '../game/types'
import type { EndType } from '../types/data'
import HUD from '../components/HUD'
import CashoutModal from '../components/CashoutModal'
import VirtualJoystick from '../components/VirtualJoystick'
import DebugPanel from '../components/DebugPanel'

export default function ArenaScreen() {
  const { meta, finishRun } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const keysRef = useRef(new Set<string>())
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const [hud, setHud] = useState<HUDData | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const isMobile = 'ontouchstart' in window

  useEffect(() => {
    const engine = new GameEngine()
    engineRef.current = engine

    engine.onRunEnd = (result: GameRunEndResult) => {
      finishRun({
        endType: result.endType as EndType,
        unsecuredBefore: result.unsecuredBefore,
        lostScrap: result.lostScrap,
        bankedScrap: result.bankedScrap,
        highestWave: result.highestWave,
      })
    }

    engine.start(1, meta.upgradeLevels)

    const canvas = canvasRef.current
    if (!canvas) return

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = time

      engine.handleInput(keysRef.current)
      engine.update(dt)

      const ctx = canvas.getContext('2d')
      if (ctx) {
        engine.render(ctx, canvas.width, canvas.height)
      }

      setHud(engine.getHUDData())
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame((t) => {
      lastTimeRef.current = t
      rafRef.current = requestAnimationFrame(loop)
    })

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      if (e.key === '`' || e.key === '~') setShowDebug(d => !d)
    }
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight, 800)
      canvas.width = size
      canvas.height = size
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const handleJoystick = useCallback((dx: number, dy: number) => {
    engineRef.current?.handleJoystick(dx, dy)
  }, [])

  const handleSurrender = useCallback(() => {
    engineRef.current?.surrender()
  }, [])

  const handleCashOut = useCallback(() => {
    engineRef.current?.cashOut()
  }, [])

  const handleContinue = useCallback(() => {
    engineRef.current?.continueWave()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a15', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
        {hud && (
          <>
            <HUD hud={hud} onSurrender={handleSurrender} />
            {hud.isCashoutOpen && (
              <CashoutModal
                waveNumber={hud.waveNumber}
                waveReward={hud.waveReward}
                onCashOut={handleCashOut}
                onContinue={handleContinue}
              />
            )}
          </>
        )}
        {showDebug && engineRef.current && (
          <DebugPanel engine={engineRef.current} onClose={() => setShowDebug(false)} />
        )}
        <button
          onClick={() => setShowDebug(d => !d)}
          style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.5)', color: '#666', border: '1px solid #444',
            padding: '2px 8px', cursor: 'pointer', fontSize: 10, borderRadius: 3,
            fontFamily: 'Courier New, monospace', zIndex: 40,
          }}
        >~</button>
      </div>
      {isMobile && (
        <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 30 }}>
          <VirtualJoystick onChange={handleJoystick} />
        </div>
      )}
    </div>
  )
}
