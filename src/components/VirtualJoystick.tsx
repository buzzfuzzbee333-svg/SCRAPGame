import React, { useRef, useEffect } from 'react'

interface Props {
  onChange: (dx: number, dy: number) => void
}

export default function VirtualJoystick({ onChange }: Props) {
  const baseRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef<HTMLDivElement>(null)
  const activeTouch = useRef<number | null>(null)
  const baseCenter = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const base = baseRef.current
    if (!base) return

    const updateCenter = () => {
      const rect = base.getBoundingClientRect()
      baseCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (activeTouch.current !== null) return
      const touch = e.changedTouches[0]
      activeTouch.current = touch.identifier
      updateCenter()
      moveStick(touch.clientX, touch.clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        if (touch.identifier === activeTouch.current) {
          moveStick(touch.clientX, touch.clientY)
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouch.current) {
          activeTouch.current = null
          resetStick()
        }
      }
    }

    const moveStick = (cx: number, cy: number) => {
      const dx = cx - baseCenter.current.x
      const dy = cy - baseCenter.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 40
      const clampDist = Math.min(dist, maxDist)
      const nx = dist > 0 ? (dx / dist) * clampDist : 0
      const ny = dist > 0 ? (dy / dist) * clampDist : 0
      if (stickRef.current) {
        stickRef.current.style.transform = `translate(${nx}px, ${ny}px)`
      }
      const normX = dist > 0 ? dx / dist : 0
      const normY = dist > 0 ? dy / dist : 0
      onChange(normX, normY)
    }

    const resetStick = () => {
      if (stickRef.current) stickRef.current.style.transform = 'translate(0px, 0px)'
      onChange(0, 0)
    }

    base.addEventListener('touchstart', onTouchStart, { passive: false })
    base.addEventListener('touchmove', onTouchMove, { passive: false })
    base.addEventListener('touchend', onTouchEnd, { passive: false })
    base.addEventListener('touchcancel', onTouchEnd, { passive: false })

    return () => {
      base.removeEventListener('touchstart', onTouchStart)
      base.removeEventListener('touchmove', onTouchMove)
      base.removeEventListener('touchend', onTouchEnd)
      base.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onChange])

  return (
    <div ref={baseRef} style={{
      position: 'relative', width: 100, height: 100,
      borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
      border: '2px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      touchAction: 'none',
    }}>
      <div ref={stickRef} style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.5)', border: '2px solid rgba(255,255,255,0.8)',
        transition: 'transform 0.05s',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
