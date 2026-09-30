'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const TRAIL_LENGTH = 8;

const PARTICLE_CONFIG = [
  { size: 9, opacity: 0.85, color: '#00E0FF', glow: '#00E0FF' },
  { size: 8, opacity: 0.75, color: '#00F5D4', glow: '#00F5D4' },
  { size: 7, opacity: 0.65, color: '#00F5D4', glow: '#00F5D4' },
  { size: 6, opacity: 0.50, color: '#F59E0B', glow: '#F59E0B' },
  { size: 5, opacity: 0.40, color: '#FF006E', glow: '#FF006E' },
  { size: 4, opacity: 0.30, color: '#FF006E', glow: '#FF006E' },
  { size: 3.5, opacity: 0.20, color: '#8B5CF6', glow: '#8B5CF6' },
  { size: 2.5, opacity: 0.10, color: '#8B5CF6', glow: '#8B5CF6' },
];

export function PlasmaCursor() {
  const [mounted, setMounted] = useState(false);
  const [isPointerOverClickable, setIsPointerOverClickable] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position references for high-performance 60FPS RAF lerp
  const mousePos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  );
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reticleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only enable on fine pointer devices (desktop/mouse)
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    setMounted(true);

    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      setIsVisible(true);

      // Check if target or parent is clickable
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer')
        );
        setIsPointerOverClickable(isClickable);
      }
    };

    const handlePointerDown = () => setIsClicking(true);
    const handlePointerUp = () => setIsClicking(false);
    const handlePointerLeave = () => setIsVisible(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseleave', handlePointerLeave);

    // 60 FPS GPU-accelerated RAF Lerp loop
    let animId: number;
    const updatePhysics = () => {
      const target = mousePos.current;

      // Update lead reticle directly
      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }

      // Lerp each trailing particle toward the one ahead of it
      let prev = target;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const current = trailPositions.current[i];
        const lerpFactor = 0.42 - i * 0.035; // fluid dissipating spring wake
        current.x += (prev.x - current.x) * lerpFactor;
        current.y += (prev.y - current.y) * lerpFactor;

        const node = particleRefs.current[i];
        if (node) {
          node.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
        }
        prev = current;
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[99999] select-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 1. Trailing Dissipating Plasma Nodes */}
      {PARTICLE_CONFIG.map((p, idx) => (
        <div
          key={idx}
          ref={(el) => {
            particleRefs.current[idx] = el;
          }}
          className="fixed top-0 left-0 will-change-transform rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            width: isClicking ? p.size * 1.4 : p.size,
            height: isClicking ? p.size * 1.4 : p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 12px ${p.glow}, 0 0 20px ${p.glow}80`,
            transition: 'width 0.15s, height 0.15s',
          }}
        />
      ))}

      {/* 2. Sharp Geometric Reticle Cursor Lead */}
      <div
        ref={reticleRef}
        className="fixed top-0 left-0 will-change-transform pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
        }}
      >
        {/* Reticle Micro-Brackets (┌ ┐ └ ┘) */}
        <div
          className={`absolute inset-0 transition-transform duration-200 ${
            isClicking
              ? 'scale-75 rotate-45'
              : isPointerOverClickable
              ? 'scale-125 rotate-90 text-[#FF006E]'
              : 'scale-100 rotate-0 text-[#00E0FF]'
          }`}
        >
          <span className="absolute top-0 left-0 text-[10px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            ┌
          </span>
          <span className="absolute top-0 right-0 text-[10px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            ┐
          </span>
          <span className="absolute bottom-0 left-0 text-[10px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            └
          </span>
          <span className="absolute bottom-0 right-0 text-[10px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            ┘
          </span>
        </div>

        {/* Center Target Core Dot */}
        <div
          className={`rounded-full transition-all duration-150 ${
            isClicking
              ? 'w-3 h-3 bg-[#FF006E] shadow-[0_0_15px_#FF006E]'
              : isPointerOverClickable
              ? 'w-2 h-2 bg-[#00F5D4] shadow-[0_0_12px_#00F5D4]'
              : 'w-1.5 h-1.5 bg-[#00E0FF] shadow-[0_0_10px_#00E0FF]'
          }`}
        />

        {/* Outer subtle ring on hover */}
        {isPointerOverClickable && (
          <div className="absolute inset-1 rounded-full border border-cyan-400/40 animate-ping opacity-60" />
        )}
      </div>
    </div>
  );
}
export default PlasmaCursor;
