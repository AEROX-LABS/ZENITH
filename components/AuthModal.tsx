'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MagicLinkAuthView } from '@/components/MagicLinkAuthView';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => setIsAuthModalOpen(false)} />

      <div className="relative z-10 w-full max-w-md">
        {/* Floating close button */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute -top-10 right-0 p-2 rounded-xl text-zinc-400 hover:text-white bg-black/60 border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <MagicLinkAuthView onSuccess={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
}
