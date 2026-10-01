'use client';

import { useCallback, useState, useEffect } from 'react';
import { soundEngine } from '@/lib/audio';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundEngine.getMuted());
  }, []);

  const playTick = useCallback((volume?: number) => {
    soundEngine.playTick(volume);
  }, []);

  const playClack = useCallback((volume?: number) => {
    soundEngine.playClack(volume);
  }, []);

  const playThud = useCallback((volume?: number) => {
    soundEngine.playThud(volume);
  }, []);

  const playPlasmaBurst = useCallback((volume?: number) => {
    soundEngine.playPlasmaBurst(volume);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !soundEngine.getMuted();
    soundEngine.setMuted(next);
    setIsMuted(next);
    if (!next) {
      soundEngine.playClack(0.2);
    }
  }, []);

  return {
    playTick,
    playClack,
    playThud,
    playPlasmaBurst,
    isMuted,
    toggleMute,
  };
}

export default useAudio;
