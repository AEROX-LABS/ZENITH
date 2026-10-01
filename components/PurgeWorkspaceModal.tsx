'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, ShieldAlert, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAudio } from '@/hooks/useAudio';
import { ReticleHUD } from '@/components/DynamicEntityModal';

export function PurgeWorkspaceModal() {
  const { purgeWorkspaceTarget, setPurgeWorkspaceTarget, deleteWorkspace } = useApp();
  const { playTick, playClack, playThud } = useAudio();

  const [typedName, setTypedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);

  // Reset input when modal opens or closes
  useEffect(() => {
    setTypedName('');
    setIsDeleting(false);
    if (purgeWorkspaceTarget) {
      playThud(0.25);
    }
  }, [purgeWorkspaceTarget, playThud]);

  if (!purgeWorkspaceTarget) return null;

  const isMatch = typedName.trim() === purgeWorkspaceTarget.name.trim();

  const handlePurge = async () => {
    if (!isMatch || isDeleting) return;
    setIsDeleting(true);
    playThud(0.4);

    try {
      await deleteWorkspace(purgeWorkspaceTarget.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
        {/* Click outside backdrop */}
        <div 
          className="fixed inset-0 cursor-default" 
          onClick={() => {
            if (!isDeleting) {
              playTick();
              setPurgeWorkspaceTarget(null);
            }
          }} 
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-2xl bg-[#000101]/95 border border-red-500/20 text-zinc-100 shadow-[0_0_60px_rgba(255,0,110,0.22),0_25px_50px_rgba(0,0,0,0.95)] overflow-hidden font-mono z-10"
        >
          {/* Cybernetic Reticle Corner Brackets */}
          <div className="absolute top-2 left-2 text-[10px] text-[#FF006E]/60 pointer-events-none">┌</div>
          <div className="absolute top-2 right-2 text-[10px] text-[#FF006E]/60 pointer-events-none">┐</div>
          <div className="absolute bottom-2 left-2 text-[10px] text-[#FF006E]/60 pointer-events-none">└</div>
          <div className="absolute bottom-2 right-2 text-[10px] text-[#FF006E]/60 pointer-events-none">┘</div>

          {/* Top Kinetic Red/Magenta Rim */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#FF006E] via-red-500 to-[#FF0055] shadow-[0_0_15px_rgba(255,0,110,0.8)]" />

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-[#FF006E]/50 shadow-[0_0_15px_rgba(255,0,110,0.4)]">
                <AlertTriangle className="w-4 h-4 text-[#FF006E]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF006E] absolute -top-0.5 -right-0.5 animate-ping" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-widest text-[#FF006E] uppercase flex items-center gap-1.5">
                  <span>[ PURGE PROTOCOL // WORKSPACE DESTRUCTION ]</span>
                </h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  DESTRUCTIVE ACTION · IRREVERSIBLE MUTATION
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playClack();
                setPurgeWorkspaceTarget(null);
              }}
              onMouseEnter={() => {
                playTick();
                setCloseHovered(true);
              }}
              onMouseLeave={() => setCloseHovered(false)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
              title="Cancel Purge [ESC]"
            >
              <ReticleHUD active={closeHovered} color="#FF006E" offset={-3} />
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Warning Callout Box */}
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 shadow-[0_0_20px_rgba(255,0,110,0.15)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF006E] uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-[#FF006E]" />
                <span>CONFIRMATION SAFEGUARD</span>
              </div>
              <p className="text-xs text-red-100 font-semibold leading-relaxed font-mono">
                WARNING: You are about to permanently destroy{' '}
                <span className="text-white font-bold underline decoration-[#FF006E] underline-offset-4">
                  {purgeWorkspaceTarget.name}
                </span>{' '}
                and all associated telemetry, tasks, and systems. This action cannot be reversed.
              </p>
            </div>

            {/* Typed Confirmation Prompt */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Type <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/10 select-all">{purgeWorkspaceTarget.name}</span> below to confirm:
              </label>

              <div
                className="relative rounded-xl transition-all duration-200"
                style={{
                  boxShadow: inputFocused ? '0 0 16px rgba(255, 0, 110, 0.35)' : 'none',
                }}
              >
                <ReticleHUD active={inputFocused} color="#FF006E" offset={-4} />
                <input
                  type="text"
                  autoFocus
                  disabled={isDeleting}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={`Type "${purgeWorkspaceTarget.name}" exactly`}
                  style={{
                    borderColor: inputFocused ? '#FF006E' : 'rgba(255,255,255,0.1)',
                    caretColor: '#FF006E',
                  }}
                  className="w-full bg-[#0d0e12] border rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 tracking-wider focus:outline-none transition-colors font-mono"
                />
              </div>

              {typedName && !isMatch && (
                <p className="text-[10px] text-zinc-500 font-mono italic">
                  Name does not match yet. Please type the exact workspace title.
                </p>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-5 border-t border-white/10 bg-white/[0.01] flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                playClack();
                setPurgeWorkspaceTarget(null);
              }}
              onMouseEnter={() => playTick()}
              className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              [ CANCEL ]
            </button>

            <button
              type="button"
              disabled={!isMatch || isDeleting}
              onClick={handlePurge}
              onMouseEnter={() => isMatch && playTick()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all ${
                isMatch && !isDeleting
                  ? 'bg-[#FF006E]/20 hover:bg-[#FF006E]/30 text-[#FF006E] border border-[#FF006E] shadow-[0_0_25px_rgba(255,0,110,0.5)] active:scale-95 cursor-pointer'
                  : 'bg-zinc-900/60 text-zinc-600 border border-white/5 cursor-not-allowed opacity-50'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PURGING WORKSPACE...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>[ INITIATE PURGE ]</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PurgeWorkspaceModal;
