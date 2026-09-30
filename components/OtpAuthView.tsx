'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  Terminal,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_USER } from '@/lib/storage';

export function OtpAuthView({ onSuccess }: { onSuccess?: () => void }) {
  const { setUser, setSessionState } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus 1st input on switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('[SYS_ERR] ENTER VALID QUANTUM EMAIL IDENTIFIER');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Local simulation when Supabase keys are not present
        setSuccessMessage('[SYS_TRANSMISSION] DISPATCHED SIMULATED CIPHER (USE 777888 FOR DEV BYPASS)');
        setStep('otp');
        setCooldown(60);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('[SYS_TRANSMISSION] 6-DIGIT CIPHER SENT TO ' + email.trim().toUpperCase());
      setStep('otp');
      setCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'TRANSMISSION FAILED';
      setErrorMessage(`[SYS_ERR] ${msg.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric or clean char
    const char = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance focus to next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down (Backspace and arrow navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste of full 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9a-zA-Z]/g, '');
    if (pasted) {
      const digits = pasted.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);

      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (digits.length === 6) {
        handleVerifyOtp(digits.join(''));
      }
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const token = (codeToVerify || otp.join('')).trim();
    if (token.length < 6) {
      setErrorMessage('[SYS_ERR] ENTER COMPLETE 6-DIGIT CIPHER');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Local Developer Override check (e.g. 777888 or demo mode)
      if (token === '777888' || token === '123456' || !isSupabaseConfigured) {
        const simulatedUser = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0] || 'Zenith Architect',
          email: email.trim(),
          role: 'Grandmaster Architect',
        };
        setUser(simulatedUser);
        setSuccessMessage('[SYS_AUTH] CIPHER CONFIRMED. SESSION GRANTED.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          router.replace('/');
        }, 500);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'email',
      });

      if (error) {
        throw error;
      }

      if (data.session && data.user) {
        const verifiedUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Zenith Architect',
          email: data.user.email || email.trim(),
          role: 'Zenith Architect',
        };
        setUser(verifiedUser);
        if (setSessionState) {
          setSessionState(data.session);
        }
        setSuccessMessage('[SYS_AUTH] QUANTUM CIPHER VERIFIED. REDIRECTING...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          router.replace('/');
        }, 500);
      } else {
        throw new Error('NO ACTIVE SESSION RETURNED FROM IDENTITY PROVIDER');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'INVALID IDENTIFICATION CODE';
      setErrorMessage(
        msg.toLowerCase().includes('token') || msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('invalid')
          ? '[SYS_ERR] INVALID IDENTIFICATION CODE'
          : `[SYS_ERR] ${msg.toUpperCase()}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Instant developer demo login
  const handleDeveloperBypass = () => {
    setUser(INITIAL_USER);
    setSuccessMessage('[SYS_BYPASS] LEAD ARCHITECT SESSION ACTIVE.');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      router.replace('/');
    }, 400);
  };

  return (
    <div className="w-full max-w-md bg-[#000101] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
      {/* Tactical Glow Header Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-[#ff0055] to-violet-500 shadow-[0_0_12px_rgba(0,240,255,0.5)]" />

      {/* Card Header */}
      <div className="p-6 border-b border-white/5 bg-[#09090b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-black border border-cyan-500/40 shadow-[0_0_14px_rgba(0,240,255,0.3)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  OTP CIPHER AUTH
                </span>
                <span className="text-[10px] font-mono text-zinc-500">v2.0 SECURE</span>
              </div>
              <h1 className="text-base font-bold text-zinc-100 tracking-wider font-mono mt-0.5">
                AEROX<span className="text-cyan-400">·</span>ZENITH
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500 border border-white/5 px-2 py-1 rounded bg-black/40">
            <KeyRound className="w-3 h-3 text-cyan-400" />
            <span>PASSWORDLESS</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-5 bg-[#050508]">
        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-[#ff0055] text-xs font-mono flex items-start gap-2 shadow-[0_0_15px_rgba(255,0,85,0.2)] animate-shake">
            <Terminal className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#ff0055]" />
            <span className="break-all">{errorMessage}</span>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-start gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
            <span className="break-all">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: EMAIL ENTRY */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Quantum Identity Identifier (Email)</span>
                <span className="text-cyan-400 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="architect@aerox.dev"
                  className="w-full bg-[#0d0e12] border border-white/10 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                No password required. A single-use 6-digit cryptographic token will be transmitted to this inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_28px_rgba(0,240,255,0.7)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'TRANSMITTING CIPHER...' : 'SEND SECURE TRANSMISSION'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Enter 6-Digit Cipher
                </span>
                <span className="text-[11px] font-mono text-cyan-300 truncate max-w-[240px] block font-semibold">
                  {email}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp(['', '', '', '', '', '']);
                  setErrorMessage(null);
                }}
                className="text-[10px] font-mono text-zinc-400 hover:text-cyan-300 flex items-center gap-1 hover:underline transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Email</span>
              </button>
            </div>

            {/* 6 Individual Glowing Neon Boxes with Alternating Cyan / Cyber Magenta Focus */}
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 rounded-xl bg-[#000101] border text-center text-2xl font-mono font-bold text-zinc-100 transition-all select-none focus:outline-none ${
                    digit 
                      ? 'border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)] bg-cyan-950/20' 
                      : 'border-white/10 hover:border-white/30'
                  } ${
                    index % 2 === 0
                      ? 'focus:border-[#00f0ff] focus:shadow-[0_0_18px_rgba(0,240,255,0.5)] focus:ring-1 focus:ring-[#00f0ff]'
                      : 'focus:border-[#ff0055] focus:shadow-[0_0_18px_rgba(255,0,85,0.5)] focus:ring-1 focus:ring-[#ff0055]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Auto-advancing focus active</span>
              {cooldown > 0 ? (
                <span className="text-zinc-400">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Cipher</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otp.join('').length < 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-[#00f0ff] hover:from-cyan-300 hover:to-cyan-200 text-zinc-950 font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:shadow-[0_0_32px_rgba(0,240,255,0.7)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'VERIFYING IDENTIFICATION...' : 'VERIFY CIPHER IDENTIFICATION'}</span>
            </button>
          </div>
        )}

        {/* Tactical Developer Override Option */}
        <div className="pt-3 border-t border-white/5 space-y-2 text-center">
          <p className="text-[10px] font-mono text-zinc-600">
            [SYS_OVERRIDE] TEST ENVIRONMENT BYPASS AVAILABLE
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDeveloperBypass}
              className="text-[10px] font-mono text-zinc-400 hover:text-cyan-400 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>BYPASS TO LEAD ARCHITECT DEMO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
