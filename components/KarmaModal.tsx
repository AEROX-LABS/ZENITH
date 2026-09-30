'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';

/**
 * DEPRECATED: Gamification metrics have been purged in favor of pure telemetry.
 * All telemetry metrics, 7-day velocity chart, and 365-day consistency matrix 
 * are now housed in OperatorProfileModal.
 */
export function KarmaModal() {
  const { isKarmaModalOpen, setIsKarmaModalOpen, openOperatorProfile } = useApp();

  useEffect(() => {
    if (isKarmaModalOpen) {
      setIsKarmaModalOpen(false);
      openOperatorProfile();
    }
  }, [isKarmaModalOpen, setIsKarmaModalOpen, openOperatorProfile]);

  return null;
}
