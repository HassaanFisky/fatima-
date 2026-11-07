'use client';

import React, { useEffect, useState } from 'react';
import { CursorMode } from '@/types/experience';

interface MagneticCursorProps {
  mode: CursorMode;
  accentColor: string;
}

export function MagneticCursor({ mode, accentColor }: MagneticCursorProps) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || isReduced) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      setEnabled(true);
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest('button, a, input, textarea, [data-interactive="true"]')
      );
      setIsHoveringInteractive(interactive);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const follow = () => {
      setTrailing((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.18,
        y: prev.y + (pos.y - prev.y) * 0.18,
      }));
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [pos, enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer ring or spotlight */}
      <div
        style={{
          transform: `translate3d(${trailing.x - (isHoveringInteractive ? 26 : 18)}px, ${
            trailing.y - (isHoveringInteractive ? 26 : 18)
          }px, 0)`,
          width: isHoveringInteractive ? 52 : 36,
          height: isHoveringInteractive ? 52 : 36,
          borderColor: accentColor,
          backgroundColor:
            mode === 'ambient_spotlight' ? `${accentColor}18` : 'transparent',
          borderRadius: mode === 'editorial_crosshair' ? '2px' : '9999px',
        }}
        className="border transition-[width,height] duration-150 ease-out opacity-70"
      />
      {/* Precision center dot */}
      <div
        style={{
          transform: `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`,
          backgroundColor: accentColor,
        }}
        className="w-1.5 h-1.5 rounded-full"
      />
    </div>
  );
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  accentColor?: string;
}

export function InteractiveTiltCard({
  children,
  className = '',
  style = {},
  accentColor = '#B67B32',
}: TiltCardProps) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width);
    const py = (e.clientY - rect.top) / Math.max(1, rect.height);
    const rx = (0.5 - py) * 7;
    const ry = (px - 0.5) * 7;
    setTilt({ rx, ry, glowX: px * 100, glowY: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, glowX: 50, glowY: 50, active: false });
  };

  return (
    <div
      data-interactive="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: tilt.active
          ? `perspective(900px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateY(-3px)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: tilt.active ? 'transform 60ms linear' : 'transform 320ms ease-out',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {tilt.active && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(360px circle at ${tilt.glowX}% ${tilt.glowY}%, ${accentColor}1F, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
