'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ShockwaveInstance {
  id: string;
  x: number;
  y: number;
}

export interface PlasmaShockwaveProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

/**
 * Phosphor Emerald Plasma Shockwave
 * Rapidly scales from scale: 0 to scale: 15 with glowing 2px border and box-shadow over 400ms.
 */
export function PlasmaShockwave({ x, y, onComplete }: PlasmaShockwaveProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 15, opacity: 0 }}
      transition={{
        scale: {
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.8,
        },
        opacity: {
          duration: 0.4,
          ease: 'easeOut',
        },
      }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-[99999] rounded-full -translate-x-1/2 -translate-y-1/2"
      style={{
        left: x,
        top: y,
        width: 30,
        height: 30,
        border: '2px solid #00F5D4',
        boxShadow: '0 0 20px #00F5D4, inset 0 0 12px #00F5D4',
        backgroundColor: 'transparent',
      }}
    />
  );
}

/**
 * PlasmaShockwaveHost: renders all currently active shockwaves in the viewport.
 */
export function PlasmaShockwaveHost({
  shockwaves,
  onComplete,
}: {
  shockwaves: ShockwaveInstance[];
  onComplete: (id: string) => void;
}) {
  if (!shockwaves || shockwaves.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden" aria-hidden="true">
      {shockwaves.map((sw) => (
        <PlasmaShockwave
          key={sw.id}
          x={sw.x}
          y={sw.y}
          onComplete={() => onComplete(sw.id)}
        />
      ))}
    </div>
  );
}

export default PlasmaShockwave;
