'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ 
  toast, 
  onDismiss 
}: { 
  toast: { id: string; type: 'success' | 'error' | 'info'; message: string }; 
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
      iconColor: 'text-emerald-400',
      bgGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.2)]',
    },
    error: {
      icon: AlertCircle,
      border: 'border-[#ff0055]/50',
      text: 'text-[#ff7096]',
      iconColor: 'text-[#ff0055]',
      bgGlow: 'shadow-[0_0_24px_rgba(255,0,85,0.25)]',
    },
    info: {
      icon: Info,
      border: 'border-cyan-500/40',
      text: 'text-cyan-200',
      iconColor: 'text-cyan-400',
      bgGlow: 'shadow-[0_0_24px_rgba(0,240,255,0.2)]',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div 
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#0d0e12]/95 border ${config.border} ${config.bgGlow} backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 transition-all`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className={`flex-1 text-xs font-medium ${config.text} leading-relaxed break-words`}>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors flex-shrink-0 -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
