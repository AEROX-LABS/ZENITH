'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  UserCheck,
  AlertCircle 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_USER } from '@/lib/storage';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback local auth simulation
        const simulatedUser = {
          id: `usr_${Date.now()}`,
          name: name.trim() || email.split('@')[0] || 'Zenith User',
          email: email.trim(),
          role: 'Architect',
        };
        setUser(simulatedUser);
        setSuccessMessage('Logged in successfully via local secure session.');
        setTimeout(() => setIsAuthModalOpen(false), 600);
        setLoading(false);
        return;
      }

      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Zenith User',
            email: data.user.email || email,
            role: 'Zenith Architect',
          });
          setSuccessMessage('Welcome back to AEROX-ZENITH.');
          setTimeout(() => setIsAuthModalOpen(false), 500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() || email.split('@')[0] },
          },
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            name: name.trim() || email.split('@')[0] || 'Zenith User',
            email: data.user.email || email,
            role: 'Zenith Architect',
          });
          setSuccessMessage('Account created and logged in.');
          setTimeout(() => setIsAuthModalOpen(false), 500);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    setUser(INITIAL_USER);
    setSuccessMessage('Switched to Lead Architect demo profile.');
    setTimeout(() => setIsAuthModalOpen(false), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => setIsAuthModalOpen(false)} />

      {/* Centered Obsidian Glass Card */}
      <div className="relative w-full max-w-md bg-[#0d0e12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Neon Accent Stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-[#ff0055]" />

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">AEROX-ZENITH Auth</h2>
              <p className="text-xs text-zinc-400">Supabase Secure Cloud Engine</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-black/40 border-b border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-[#181924] text-cyan-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-[#181924] text-cyan-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#ff0055]/10 border border-[#ff0055]/30 text-[#ff0055] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@aerox.dev"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(0,240,255,0.3)] disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Instant Demo Profile Login */}
          <div className="pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Continue as Lead Architect (Demo)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
