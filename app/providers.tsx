'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppProvider } from '@/context/AppContext';
import { AuthGuard } from '@/components/AuthGuard';

const PlasmaCursor = dynamic(() => import('@/components/PlasmaCursor'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthGuard>
        <PlasmaCursor />
        {children}
      </AuthGuard>
    </AppProvider>
  );
}
