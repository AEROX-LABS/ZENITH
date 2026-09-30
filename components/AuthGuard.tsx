'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Cpu } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';
  const isAuthCallbackPage = pathname?.startsWith('/auth');
  const isPublicAuthRoute = isLoginPage || isAuthCallbackPage;

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user && !isPublicAuthRoute) {
        router.replace('/login');
      } else if (user && isLoginPage) {
        router.replace('/');
      }
    }
  }, [user, isAuthLoading, isLoginPage, isPublicAuthRoute, router]);

  // If on public auth route (login or callback), let it render directly
  if (isPublicAuthRoute) {
    return <>{children}</>;
  }

  // If loading authentication state, show tactical obsidian cyber loading screen
  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000101] text-zinc-100 select-none">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-black border border-cyan-500/50 shadow-[0_0_30px_rgba(0,240,255,0.3)] mb-6">
          <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff0055] absolute -top-1 -right-1 shadow-[0_0_8px_#ff0055]" />
        </div>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              [SEC_SYS] AEROX AUTH GUARD
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 tracking-wider">
            VERIFYING ENCRYPTED SESSION CIPHERS...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, don't show children while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
