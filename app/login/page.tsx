'use client';

import React from 'react';
import { OtpAuthView } from '@/components/OtpAuthView';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#000101] text-zinc-100 select-none relative overflow-hidden">
      {/* Ambient Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #00f0ff 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Neon Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#ff0055]/10 blur-[120px] pointer-events-none" />

      {/* Tactical Auth Box */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <OtpAuthView />

        <p className="mt-6 text-[11px] font-mono text-zinc-600 text-center">
          AEROX·ZENITH KERNEL SEC_AUTH v2.0 // CIPHER STRICT ROW-LEVEL SANDBOXING
        </p>
      </div>
    </div>
  );
}
