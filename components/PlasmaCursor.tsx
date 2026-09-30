'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function PlasmaCursor() {
  const [mounted, setMounted] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 1. Motion Values for coordinates (bypasses React state entirely to eliminate re-renders on mousemove)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorOpacity = useMotionValue(0);

  // 2. High-damping smooth spring follower
  const springConfig = { damping: 28, stiffness: 320, mass: 0.45 };
  const followerX = useSpring(cursorX, springConfig);
  const followerY = useSpring(cursorY, springConfig);

  const hasMoved = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Disable custom cursor on touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    setMounted(true);

    // Single global passive mousemove listener
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (!hasMoved.current) {
        hasMoved.current = true;
        cursorOpacity.set(1);
      }
    };

    // Lightweight boundary checks for clickable elements (fires only on element hover enter/leave, NOT every pixel)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = Boolean(
        target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer')
      );
      setIsInteractive(clickable);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    const handleMouseLeave = () => {
      cursorOpacity.set(0);
    };

    const handleMouseEnter = () => {
      if (hasMoved.current) {
        cursorOpacity.set(1);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, cursorOpacity]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Kinetic Follower Glow (GPU Accelerated Spring Wake) */}
      <motion.div
        style={{
          x: followerX,
          y: followerY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: cursorOpacity,
          willChange: 'transform',
        }}
        animate={{
          scale: isMouseDown ? 0.75 : isInteractive ? 1.4 : 1,
          borderColor: isInteractive ? 'rgba(0, 245, 212, 0.45)' : 'rgba(0, 224, 255, 0.25)',
          backgroundColor: isInteractive ? 'rgba(0, 245, 212, 0.08)' : 'rgba(0, 224, 255, 0.04)',
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed top-0 left-0 pointer-events-none w-8 h-8 rounded-full border shadow-[0_0_18px_rgba(0,224,255,0.2),0_0_32px_rgba(0,245,212,0.1)]"
      />

      {/* 2. Primary Sharp Reticle (Tracks Exact Mouse Position with 0 Latency) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: cursorOpacity,
          willChange: 'transform',
        }}
        animate={{
          scale: isMouseDown ? 0.8 : isInteractive ? 1.2 : 1,
          rotate: isInteractive ? 45 : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className="fixed top-0 left-0 pointer-events-none w-6 h-6 flex items-center justify-center"
      >
        {/* Reticle Micro-Brackets (┌ ┐ └ ┘) */}
        <div
          className={`absolute inset-0 transition-colors duration-150 ${
            isInteractive ? 'text-[#00F5D4]' : 'text-[#00E0FF]'
          }`}
        >
          <span className="absolute top-0 left-0 text-[9px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            ┌
          </span>
          <span className="absolute top-0 right-0 text-[9px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            ┐
          </span>
          <span className="absolute bottom-0 left-0 text-[9px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            └
          </span>
          <span className="absolute bottom-0 right-0 text-[9px] font-mono leading-none drop-shadow-[0_0_6px_currentColor]">
            ┘
          </span>
        </div>

        {/* Center Target Core Dot */}
        <div
          className={`rounded-full transition-all duration-150 ${
            isMouseDown
              ? 'w-2 h-2 bg-[#FF006E] shadow-[0_0_12px_#FF006E]'
              : isInteractive
              ? 'w-1.5 h-1.5 bg-[#00F5D4] shadow-[0_0_10px_#00F5D4]'
              : 'w-1 h-1 bg-[#00E0FF] shadow-[0_0_8px_#00E0FF]'
          }`}
        />
      </motion.div>
    </div>
  );
}

export default PlasmaCursor;
