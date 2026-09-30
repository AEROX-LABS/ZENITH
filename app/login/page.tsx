'use client';

import React from 'react';
import { MagicLinkAuthView } from '@/components/MagicLinkAuthView';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#000101] text-zinc-100 select-none relative overflow-hidden">
      {/* Ambient Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #00E0FF 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Neon Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00E0FF]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00F5D4]/10 blur-[130px] pointer-events-none" />
      <div className="absolute -top-20 right-1/3 w-80 h-80 rounded-full bg-[#FF0055]/10 blur-[140px] pointer-events-none" />

      {/* Tactical Access Gateway Container */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <MagicLinkAuthView />

        <p className="mt-6 text-[10px] font-mono text-zinc-600 text-center tracking-widest uppercase">
          AEROX·ZENITH KERNEL SEC_AUTH // QUANTUM MAGIC LINK TRANSMITTER
        </p>
      </div>
    </div>
  );
}
