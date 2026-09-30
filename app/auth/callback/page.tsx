'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { Cpu, CheckCircle2, Terminal, Radio } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setSessionState, setUser } = useApp();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuthToken = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) setStatus('success');
          setTimeout(() => router.replace('/'), 700);
          return;
        }

        // 1. Check for PKCE exchange code in URL search params
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');

          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            if (data.session) {
              setSessionState(data.session);
              if (isMounted) setStatus('success');
              setTimeout(() => router.replace('/'), 600);
              return;
            }
          }
        }

        // 2. Check for active session or implicit hash token in Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setSessionState(session);
          if (isMounted) setStatus('success');
          setTimeout(() => router.replace('/'), 600);
          return;
        }

        // 3. Fallback: wait briefly for onAuthStateChange to parse the URL hash
        const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession?.user) {
            setSessionState(newSession);
            if (isMounted) setStatus('success');
            setTimeout(() => router.replace('/'), 600);
          }
        });

        // 4. Safety fallback timeout
        setTimeout(() => {
          if (isMounted && status === 'verifying') {
            router.replace('/');
          }
        }, 3000);

        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'TOKEN EXCHANGE FAILED';
        if (isMounted) {
          setErrorMessage(`[SYS_ERR] ${msg.toUpperCase()}`);
          setStatus('error');
        }
      }
    };

    processAuthToken();

    return () => {
      isMounted = false;
    };
  }, [router, setSessionState, status]);

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

      {/* Cyber Glow Halo */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-[#00F5D4]/10 blur-[130px] pointer-events-none" />

      {/* Verification Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#000101]/85 backdrop-blur-2xl border border-white/5 p-8 text-center shadow-[0_0_50px_rgba(0,245,212,0.15)]">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="relative mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-[#00E0FF]/50 shadow-[0_0_25px_rgba(0,224,255,0.4)]">
              <Radio className="w-7 h-7 text-[#00E0FF] animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] absolute -top-1 -right-1 shadow-[0_0_8px_#00F5D4] animate-ping" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/30 font-semibold">
                NEURAL LINK HANDSHAKE
              </span>
              <h2 className="text-sm font-bold font-mono tracking-wider text-zinc-100 pt-1">
                VALIDATING QUANTUM TOKEN
              </h2>
              <p className="text-[11px] font-mono text-zinc-500">
                Establishing direct workspace bridge...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-[#00F5D4] shadow-[0_0_30px_rgba(0,245,212,0.5)]">
              <CheckCircle2 className="w-7 h-7 text-[#00F5D4]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 font-semibold">
                ACCESS AUTHORIZED
              </span>
              <h2 className="text-sm font-bold font-mono tracking-wider text-zinc-100 pt-1">
                SESSION GRANTED
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Routing to core console...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="relative mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-red-500/50 shadow-[0_0_30px_rgba(255,0,85,0.4)]">
              <Terminal className="w-7 h-7 text-[#FF0055]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-red-950/60 text-[#FF0055] border border-red-500/30 font-semibold">
                HANDSHAKE FAILED
              </span>
              <p className="text-xs font-mono text-[#FF0055] break-all">
                {errorMessage || '[SYS_ERR] INVALID OR EXPIRED TOKEN CIPHER'}
              </p>
              <button
                type="button"
                onClick={() => router.replace('/login')}
                className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 border border-white/10 transition-colors"
              >
                RETURN TO ACCESS GATEWAY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
