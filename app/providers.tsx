'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { AuthGuard } from '@/components/AuthGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </AppProvider>
  );
}
