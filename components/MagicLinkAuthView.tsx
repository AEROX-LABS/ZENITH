'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Terminal, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_USER } from '@/lib/storage';

export function MagicLinkAuthView({ onSuccess }: { onSuccess?: () => void }) {
  const { setUser, setSessionState } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedColor, setFocusedColor] = useState<'emerald' | 'cyan'>('emerald');
  
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Trigger high-velocity neon particle burst
  const triggerParticleBurst = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00F5D4', '#00E0FF', '#FF0055', '#A855F7'],
        disableForReducedMotion: true,
      });
    } catch {
      // Fallback if canvas-confetti is not rendered
    }
  }, []);

  // Transmit Supabase Magic Link
  const handleTransmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('[SYS_ERR] ENTER VALID QUANTUM EMAIL IDENTIFIER');
      inputRef.current?.focus();
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Safe local simulation when API credentials are not active in dev
        setTimeout(() => {
          setIsSent(true);
          setLoading(false);
          triggerParticleBurst();
        }, 800);
        return;
      }

      // Supabase Magic Link transmission
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
      triggerParticleBurst();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'TRANSMISSION FAILED';
      setErrorMessage(`[SYS_ERR] ${msg.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  // Instant developer override for local testing
  const handleDeveloperBypass = () => {
    const demoUser = {
      ...INITIAL_USER,
      email: email.trim() || INITIAL_USER.email,
      name: email.trim() ? email.split('@')[0] : INITIAL_USER.name,
    };
    setUser(demoUser);
    triggerParticleBurst();
    setTimeout(() => {
      if (onSuccess) onSuccess();
      router.replace('/');
    }, 400);
  };

  return (
    <div className="w-full max-w-md relative select-none">
      {/* Outer Glow Halo Layer */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00E0FF]/20 via-[#00F5D4]/15 to-[#FF0055]/20 blur-xl opacity-75 pointer-events-none" />

      {/* Centered Frosted Obsidian Glass Card */}
      <div className="relative rounded-2xl bg-[#000101]/80 backdrop-blur-2xl border border-white/5 shadow-[0_0_50px_rgba(0,224,255,0.12),0_0_80px_rgba(255,0,85,0.06)] overflow-hidden">
        {/* Kinetic Neon Top Rim */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00E0FF] via-[#00F5D4] to-[#FF0055] shadow-[0_0_16px_rgba(0,245,212,0.8)]" />

        {/* Card Header & Cybernetic Title */}
        <div className="p-7 pb-5 text-center border-b border-white/[0.04]">
          <div className="inline-flex items-center justify-center gap-2 mb-3.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 border border-[#00E0FF]/40 shadow-[0_0_15px_rgba(0,224,255,0.3)]">
              <Radio className="w-4 h-4 text-[#00E0FF] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] absolute -top-0.5 -right-0.5 shadow-[0_0_6px_#00F5D4]" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/25 font-semibold">
              ACCESS GATEWAY
            </span>
          </div>

          <h1 className="text-xl font-bold font-mono tracking-widest text-zinc-100 flex items-center justify-center gap-2">
            <span>[</span>
            <span>AEROX</span>
            <span className="text-[#00F5D4]">·</span>
            <span>ZENITH</span>
            <span>]</span>
          </h1>

          <p className="text-[11px] font-mono text-zinc-400 tracking-widest mt-1 uppercase">
            SECURE NEURAL LINK ACCESS
          </p>
        </div>

        {/* Card Body */}
        <div className="p-7 pt-6 space-y-6">
          {/* Tactical Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-[#FF0055] text-xs font-mono flex items-start gap-2.5 shadow-[0_0_20px_rgba(255,0,85,0.25)] animate-shake">
              <Terminal className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF0055]" />
              <span className="break-all tracking-wide">{errorMessage}</span>
            </div>
          )}

          {!isSent ? (
            /* ========================================================================= */
            /* SINGLE HYPER-FOCUSED EMAIL INPUT + TRANSMIT BUTTON                        */
            /* ========================================================================= */
            <form onSubmit={handleTransmitLink} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono tracking-wider">
                  <label htmlFor="neural-email-input" className="text-zinc-400 uppercase flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#00F5D4]" />
                    <span>NEURAL IDENTITY (EMAIL)</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">ENCRYPTED</span>
                </div>

                <div className="relative group">
                  <input
                    id="neural-email-input"
                    ref={inputRef}
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedColor(prev => prev === 'emerald' ? 'cyan' : 'emerald')}
                    placeholder="operator@aerox.dev"
                    disabled={loading}
                    className={`w-full bg-[#000101] text-zinc-100 placeholder-zinc-600 font-mono text-xs rounded-xl px-4 py-3.5 border transition-all duration-200 outline-none ${
                      focusedColor === 'emerald'
                        ? 'border-white/10 focus:border-[#00F5D4] focus:shadow-[0_0_22px_rgba(0,245,212,0.4)] focus:ring-1 focus:ring-[#00F5D4]'
                        : 'border-white/10 focus:border-[#00E0FF] focus:shadow-[0_0_22px_rgba(0,224,255,0.4)] focus:ring-1 focus:ring-[#00E0FF]'
                    } disabled:opacity-50`}
                  />
                  <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-600 font-mono text-[10px]">
                    ⏎
                  </div>
                </div>

                <p className="text-[10px] font-mono text-zinc-500 tracking-wider">
                  Zero passwords. A single-use quantum authentication link will be dispatched to your inbox.
                </p>
              </div>

              {/* Tactile Full-Width Kinetic Magnetic Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Glowing border rim */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#00E0FF] via-[#00F5D4] to-[#00E0FF] rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Tactical kinetic button body */}
                <div className="relative px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E0FF] to-[#00F5D4] group-hover:from-[#00F5D4] group-hover:to-[#00E0FF] text-zinc-950 font-mono font-bold text-xs tracking-widest flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,245,212,0.45)] group-hover:shadow-[0_0_36px_rgba(0,224,255,0.7)] transition-all active:scale-[0.98]">
                  {loading ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping" />
                      <span>[ ESTABLISHING CONNECTION... ]</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>[ TRANSMIT ACCESS LINK ]</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </button>
            </form>
          ) : (
            /* ========================================================================= */
            /* SUCCESS STATE FEEDBACK: GLOWING EMERALD CHECKMARK + COMMS CONFIRMATION    */
            /* ========================================================================= */
            <div className="text-center py-2 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Glowing Emerald Checkmark */}
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-black/70 border border-[#00F5D4] shadow-[0_0_35px_rgba(0,245,212,0.55)]">
                  <CheckCircle2 className="w-9 h-9 text-[#00F5D4] stroke-[2.2]" />
                  <span className="w-3 h-3 rounded-full bg-[#00E0FF] absolute -top-1 -right-1 shadow-[0_0_10px_#00E0FF] animate-pulse" />
                </div>
              </div>

              {/* Exact user-requested message */}
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-[11px] font-mono font-semibold tracking-wider">
                  LINK TRANSMITTED
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed px-2">
                  Check your comms channel (<span className="text-[#00E0FF] font-semibold">{email}</span>) to authorize access.
                </p>
                <p className="text-[10px] font-mono text-zinc-500 tracking-wider">
                  Click the cryptographic magic link in the transmission to complete authentication.
                </p>
              </div>

              {/* Comms reset / resend action */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>USE DIFFERENT EMAIL</span>
                </button>
              </div>
            </div>
          )}

          {/* Tactical Developer Override */}
          <div className="pt-4 border-t border-white/[0.05] text-center">
            <button
              type="button"
              onClick={handleDeveloperBypass}
              className="text-[10px] font-mono text-zinc-500 hover:text-[#00F5D4] tracking-wider transition-colors inline-flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-white/[0.03]"
            >
              <Sparkles className="w-3 h-3 text-[#00F5D4]" />
              <span>[DEV_OVERRIDE] BYPASS TO LEAD ARCHITECT DEMO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
