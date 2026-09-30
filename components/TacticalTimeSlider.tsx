'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sun, Moon, Sunset, Compass, Sparkles } from 'lucide-react';

interface TacticalTimeSliderProps {
  value?: string | null; // e.g. "14:30" or ""
  onChange: (timeStr: string) => void;
  label?: string;
  className?: string;
}

// Convert "HH:mm" to total minutes (0-1439)
function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 720; // Default to 12:00 (midday)
  // Match HH:mm or H:mm
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    return Math.min(1439, Math.max(0, hours * 60 + mins));
  }
  return 720;
}

// Convert minutes (0-1439) to "HH:mm"
function formatMinutesToTime(minutes: number): string {
  const m = Math.min(1439, Math.max(0, Math.round(minutes)));
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function TacticalTimeSlider({
  value,
  onChange,
  label = 'TACTICAL 24-HOUR TIME SLIDER',
  className = '',
}: TacticalTimeSliderProps) {
  const initialMinutes = useMemo(() => parseTimeToMinutes(value), [value]);
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync internal state if prop changes externally
  useEffect(() => {
    if (value) {
      setMinutes(parseTimeToMinutes(value));
    }
  }, [value]);

  // Determine time phase and glowing color
  // Morning: 06:00 - 11:59 (360 - 719) -> Electric Cyan (#00E0FF)
  // Afternoon: 12:00 - 17:59 (720 - 1079) -> Solar Amber (#F59E0B)
  // Night: 18:00 - 05:59 (1080 - 1439, 0 - 359) -> Cyber Magenta (#FF006E)
  const phaseInfo = useMemo(() => {
    if (minutes >= 360 && minutes < 720) {
      return {
        phase: 'MORNING SHIFT',
        color: '#00E0FF',
        glow: 'rgba(0, 224, 255, 0.5)',
        icon: Sun,
        tag: 'CYAN_01',
      };
    } else if (minutes >= 720 && minutes < 1080) {
      return {
        phase: 'AFTERNOON CYCLE',
        color: '#F59E0B',
        glow: 'rgba(245, 158, 11, 0.5)',
        icon: Sunset,
        tag: 'AMBER_02',
      };
    } else {
      return {
        phase: 'NIGHT PROTOCOL',
        color: '#FF006E',
        glow: 'rgba(255, 0, 110, 0.5)',
        icon: Moon,
        tag: 'MAGENTA_03',
      };
    }
  }, [minutes]);

  const percentage = (minutes / 1439) * 100;
  const timeFormatted = formatMinutesToTime(minutes);
  const PhaseIcon = phaseInfo.icon;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value, 10);
    setMinutes(newMinutes);
    onChange(formatMinutesToTime(newMinutes));
  };

  const handlePresetClick = (presetMinutes: number) => {
    setMinutes(presetMinutes);
    onChange(formatMinutesToTime(presetMinutes));
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono select-none space-y-3 ${className}`}>
      {/* Header telemetry readout */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1"
            style={{
              color: phaseInfo.color,
              borderColor: `${phaseInfo.color}40`,
              backgroundColor: `${phaseInfo.color}15`,
            }}
          >
            <PhaseIcon className="w-2.5 h-2.5" />
            <span>{phaseInfo.phase}</span>
          </span>
        </div>
      </div>

      {/* Main HUD Display: Massive Time with Dynamic Radial Halo */}
      <div
        className="relative flex items-center justify-between p-3 rounded-xl bg-[#09090c] border overflow-hidden transition-all duration-300"
        style={{
          borderColor: `${phaseInfo.color}35`,
          boxShadow: `0 0 25px ${phaseInfo.color}15, inset 0 0 15px ${phaseInfo.color}08`,
        }}
      >
        {/* Background Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(200px circle at ${percentage}% 50%, ${phaseInfo.glow}, transparent 80%)`,
            opacity: isDragging ? 0.35 : 0.18,
          }}
        />

        <div className="relative z-10 flex items-baseline gap-2">
          <span
            className="text-2xl font-black tracking-widest transition-colors font-mono"
            style={{
              color: phaseInfo.color,
              textShadow: `0 0 15px ${phaseInfo.color}`,
            }}
          >
            {value ? timeFormatted : '--:--'}
          </span>
          <span className="text-[10px] text-zinc-500 tracking-wider">
            {value ? `[${phaseInfo.tag}]` : '[UNSET]'}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/10 transition-colors"
            >
              CLEAR
            </button>
          )}
          <span className="text-[10px] text-zinc-400 font-mono">
            {Math.round(percentage)}% of 24h
          </span>
        </div>
      </div>

      {/* Continuous Graphic Range Slider */}
      <div className="relative pt-1 pb-1">
        {/* Track ticks */}
        <div className="relative w-full h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden mb-2">
          {/* Active filled gradient track */}
          <div
            className="h-full transition-all duration-75"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #00E0FF 0%, ${phaseInfo.color} 100%)`,
              boxShadow: `0 0 10px ${phaseInfo.color}`,
            }}
          />
        </div>

        {/* Custom styled slider input */}
        <input
          type="range"
          min={0}
          max={1439}
          step={5}
          value={minutes}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-2.5 bg-transparent appearance-none cursor-pointer focus:outline-none relative z-20 tactical-slider"
          style={{
            accentColor: phaseInfo.color,
          }}
        />

        {/* Scale labels */}
        <div className="flex justify-between text-[9px] text-zinc-500 font-mono pt-1">
          <span>00:00 (NIGHT)</span>
          <span className="text-cyan-400/80">06:00 (AM)</span>
          <span className="text-amber-400/80">12:00 (NOON)</span>
          <span className="text-[#FF006E]/80">18:00 (PM)</span>
          <span>23:59</span>
        </div>
      </div>

      {/* Quick Tactical Preset Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mr-1">PRESETS:</span>
        {[
          { label: '09:00 START', min: 540, color: '#00E0FF' },
          { label: '13:00 MIDDAY', min: 780, color: '#F59E0B' },
          { label: '17:30 EOD', min: 1050, color: '#F59E0B' },
          { label: '21:00 NIGHT', min: 1260, color: '#FF006E' },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetClick(preset.min)}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 transition-all"
            style={{
              boxShadow: minutes === preset.min ? `0 0 8px ${preset.color}40` : 'none',
              borderColor: minutes === preset.min ? preset.color : undefined,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
