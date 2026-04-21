import React, { useRef, useCallback } from 'react';

interface Props {
  onJoystick: (dx: number, dy: number) => void;
}

export default function MobileControls({ onJoystick }: Props) {
  const stickRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const RADIUS = 40;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    activeRef.current = true;
    const rect = baseRef.current!.getBoundingClientRect();
    startRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = len > 0 ? dx / len : 0;
    const ny = len > 0 ? dy / len : 0;
    const clampedLen = Math.min(len, RADIUS);

    if (stickRef.current) {
      stickRef.current.style.transform = `translate(${nx * clampedLen}px, ${ny * clampedLen}px)`;
    }

    onJoystick(nx * Math.min(1, len / RADIUS), ny * Math.min(1, len / RADIUS));
  }, [onJoystick]);

  const onPointerUp = useCallback(() => {
    activeRef.current = false;
    if (stickRef.current) {
      stickRef.current.style.transform = 'translate(0, 0)';
    }
    onJoystick(0, 0);
  }, [onJoystick]);

  return (
    <div className="mobile-controls">
      <div
        ref={baseRef}
        className="joystick-base"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={stickRef} className="joystick-stick" />
      </div>
    </div>
  );
}
