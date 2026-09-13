'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Layers, 
  User, 
  Users, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WorkspaceType } from '@/types';

const NEON_COLORS = [
  { hex: '#00f0ff', label: 'Cyan' },
  { hex: '#ff0055', label: 'Magenta' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#a855f7', label: 'Violet' },
];

export function CreateWorkspaceModal() {
  const { 
    isCreateWorkspaceOpen, 
    setIsCreateWorkspaceOpen, 
    createWorkspace, 
    setActiveView,
    showToast 
  } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>('personal');
  const [color, setColor] = useState('#00f0ff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isCreateWorkspaceOpen) {
      setName('');
      setType('personal');
      setColor('#00f0ff');
      setError(null);
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isCreateWorkspaceOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreateWorkspaceOpen && !loading) {
        setIsCreateWorkspaceOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateWorkspaceOpen, loading, setIsCreateWorkspaceOpen]);

  if (!isCreateWorkspaceOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Workspace name is required');
      nameInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newWs = await createWorkspace({
        name: trimmedName,
        type,
        color,
      });

      showToast(`Workspace "${newWs.name}" created`, 'success');
      setActiveView(newWs.id);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/workspace/${newWs.id}`);
      }
      setIsCreateWorkspaceOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create workspace';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={() => {
          if (!loading) setIsCreateWorkspaceOpen(false);
        }} 
      />

      {/* Obsidian Card Dialog */}
      <div 
        className="relative w-full max-w-lg bg-[#0d0e12] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(0,240,255,0.12)] overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
      >
        {/* Glow Header Accent Bar */}
        <div 
          className="h-1 w-full transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, ${color}, #a855f7, #00f0ff)`,
            boxShadow: `0 0 12px ${color}80`
          }}
        />

        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}50`,
                borderWidth: '1px',
                boxShadow: `0 0 12px ${color}40`
              }}
            >
              <Layers className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <h2 id="create-workspace-title" className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Create Workspace</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                  Context Fabric
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Establish a personal focus space or dynamic group realm</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateWorkspaceOpen(false)}
            disabled={loading}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 disabled:opacity-40 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-[#ff0055]/10 border border-[#ff0055]/40 text-[#ff0055] text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-name" className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
              <span>Workspace Name</span>
              <span className="text-[#ff0055]">*</span>
            </label>
            <input
              id="workspace-name"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. School, Core Team, Personal Research"
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Workspace Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400">
              Workspace Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Personal Card */}
              <button
                type="button"
                onClick={() => setType('personal')}
                disabled={loading}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  type === 'personal'
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-500/40'
                    : 'bg-black/30 border-white/5 hover:border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${type === 'personal' ? 'text-cyan-400' : 'text-zinc-400'}`} />
                    <span className={`text-xs font-bold ${type === 'personal' ? 'text-cyan-300' : 'text-zinc-200'}`}>
                      Personal
                    </span>
                  </div>
                  {type === 'personal' && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Private task management, solo focus, and personal workflows.
                </p>
              </button>

              {/* Group Card */}
              <button
                type="button"
                onClick={() => setType('group')}
                disabled={loading}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  type === 'group'
                    ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40'
                    : 'bg-black/30 border-white/5 hover:border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${type === 'group' ? 'text-purple-400' : 'text-zinc-400'}`} />
                    <span className={`text-xs font-bold ${type === 'group' ? 'text-purple-300' : 'text-zinc-200'}`}>
                      Group
                    </span>
                  </div>
                  {type === 'group' && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Team collaboration, member assignees, and shared project deliverables.
                </p>
              </button>
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400">
              Neon Accent Color
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
              {NEON_COLORS.map((nc) => {
                const isSelected = color === nc.hex;
                return (
                  <button
                    key={nc.hex}
                    type="button"
                    onClick={() => setColor(nc.hex)}
                    disabled={loading}
                    title={nc.label}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'scale-110 ring-2 ring-white shadow-[0_0_16px_currentColor]'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: nc.hex, color: nc.hex }}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                    )}
                  </button>
                );
              })}
              <span className="text-xs font-mono text-zinc-400 ml-auto uppercase tracking-wider">
                {NEON_COLORS.find(c => c.hex === color)?.label || color}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#09090b]/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsCreateWorkspaceOpen(false)}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/5 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.6)] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>Create Workspace</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
