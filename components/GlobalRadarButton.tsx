'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Crosshair } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function GlobalRadarButton() {
  const { openGlobalRadar } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-36 right-5 md:bottom-8 md:right-8 z-50 flex items-center justify-end select-none pointer-events-auto">
      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mr-3 px-3 py-1.5 rounded-lg bg-[#000101]/95 border border-[#00E0FF]/60 shadow-[0_0_20px_rgba(0,224,255,0.35)] backdrop-blur-xl pointer-events-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#00E0FF]">
                [SCAN_NETWORK]
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Radar Container */}
      <div className="relative flex items-center justify-center">
        {/* Sonar / Radar Continuous Pulse Rings */}
        <motion.div
          className="absolute rounded-full border border-[#00E0FF]/50 pointer-events-none"
          initial={{ width: 48, height: 48, opacity: 0.8, scale: 1 }}
          animate={{
            scale: [1, 2.3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        <motion.div
          className="absolute rounded-full border border-[#00F5D4]/40 pointer-events-none"
          initial={{ width: 48, height: 48, opacity: 0.8, scale: 1 }}
          animate={{
            scale: [1, 2.3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: 0.8,
            ease: 'easeOut',
          }}
        />

        <motion.div
          className="absolute rounded-full border border-[#FF0055]/30 pointer-events-none"
          initial={{ width: 48, height: 48, opacity: 0.8, scale: 1 }}
          animate={{
            scale: [1, 2.3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: 1.6,
            ease: 'easeOut',
          }}
        />

        {/* Tactical Interactive Radar Node Button */}
        <motion.button
          type="button"
          onClick={openGlobalRadar}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-full bg-[#000101] border-2 border-[#00E0FF] text-[#00E0FF] flex items-center justify-center shadow-[0_0_30px_rgba(0,224,255,0.6)] cursor-pointer group focus:outline-none"
          aria-label="Scan Network"
        >
          {/* Subtle Grid crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-[1px] bg-[#00E0FF]" />
            <div className="h-full w-[1px] bg-[#00E0FF] absolute" />
          </div>

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute inset-1 rounded-full overflow-hidden pointer-events-none">
            <div className="w-full h-full animate-spin [animation-duration:3.2s] [transform-origin:center] flex items-center justify-center">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#00E0FF]/40 to-transparent" />
            </div>
          </div>

          {/* Center Tactical Beacon */}
          <div className="relative z-10 flex items-center justify-center">
            <Radio className="w-6 h-6 text-[#00E0FF] group-hover:text-[#00F5D4] transition-colors animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#00F5D4] absolute -top-1 -right-1 shadow-[0_0_8px_#00F5D4] animate-ping" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
