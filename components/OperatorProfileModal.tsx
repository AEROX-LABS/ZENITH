'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Flame, 
  Activity, 
  Calendar, 
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/parser';
import { ReticleHUD } from '@/components/DynamicEntityModal';
import { useAudio } from '@/hooks/useAudio';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Task } from '@/types';

export function OperatorProfileModal() {
  const { 
    isOperatorProfileOpen, 
    setIsOperatorProfileOpen, 
    user, 
    tasks 
  } = useApp();

  const { playTick, playClack, playThud } = useAudio();

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [closeHovered, setCloseHovered] = useState(false);
  const [realTasks, setRealTasks] = useState<Task[]>(tasks);

  // When modal opens, trigger audio thud and fetch fresh remote tasks for authenticated user
  useEffect(() => {
    if (!isOperatorProfileOpen) return;
    playThud(0.25);

    let isMounted = true;
    async function loadTasks() {
      if (!user?.id || !isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data && isMounted) {
          setRealTasks(data as Task[]);
        }
      } catch {
        // Fallback to tasks from context
      }
    }
    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [isOperatorProfileOpen, user?.id, playThud]);

  // Keep realTasks in sync with context tasks
  useEffect(() => {
    if (tasks.length > 0) {
      setRealTasks(tasks);
    }
  }, [tasks]);

  // Filter tasks strictly for completed items belonging to current user
  const completedTasks = useMemo(() => {
    const source = realTasks.length > 0 ? realTasks : tasks;
    return source.filter(t => {
      const isDone = Boolean(t.completed || (t as unknown as { is_completed?: boolean }).is_completed);
      if (user?.id) {
        return isDone && (!t.user_id || t.user_id === user.id);
      }
      return isDone;
    });
  }, [realTasks, tasks, user?.id]);

  // Aggregate real completed task counts strictly by date (YYYY-MM-DD)
  const completedCountsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    completedTasks.forEach(task => {
      let dateStr: string | null = null;
      if (task.completed_at) {
        dateStr = task.completed_at.slice(0, 10);
      } else if (task.due_date) {
        dateStr = task.due_date;
      } else if (task.created_at) {
        dateStr = task.created_at.slice(0, 10);
      }

      if (dateStr) {
        map[dateStr] = (map[dateStr] || 0) + 1;
      }
    });
    return map;
  }, [completedTasks]);

  // Compute True Active Streak strictly from user's completed tasks
  const trueActiveStreak = useMemo(() => {
    const completedDates = new Set(Object.keys(completedCountsByDate));
    if (completedDates.size === 0) return 0;

    const today = new Date();
    const todayStr = formatDate(today);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    let currentCheck = new Date();
    if (completedDates.has(todayStr)) {
      currentCheck = today;
    } else if (completedDates.has(yesterdayStr)) {
      currentCheck = yesterday;
    } else {
      return 0; // Inactive or broken streak
    }

    let streak = 0;
    while (true) {
      const dateToCheck = formatDate(currentCheck);
      if (completedDates.has(dateToCheck)) {
        streak += 1;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [completedCountsByDate]);

  // Compute 7-day velocity data strictly from real task completion counts
  const velocityData = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; dayLabel: string; count: number; isToday: boolean }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);
      const dayLabel = dayNames[d.getDay()];
      const count = completedCountsByDate[dateStr] || 0;

      days.push({
        dateStr,
        dayLabel,
        count,
        isToday: i === 0,
      });
    }

    const maxCount = Math.max(1, ...days.map(d => d.count));
    return { days, maxCount };
  }, [completedCountsByDate]);

  // Compute 365-day Consistency Matrix (52 weeks × 7 days) strictly from actual task table
  // If user has no completed tasks, every day is count 0 ("PITCH BLACK")
  const heatmapData = useMemo(() => {
    const today = new Date();
    const totalDays = 52 * 7; // 364 days leading up to today
    const startDate = new Date();
    startDate.setDate(today.getDate() - totalDays);

    const weeks: { dateStr: string; count: number; dayOfWeek: number }[][] = [];
    let currentWeek: { dateStr: string; count: number; dayOfWeek: number }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = formatDate(d);
      const count = completedCountsByDate[dateStr] || 0; // Strictly real task count

      currentWeek.push({
        dateStr,
        count,
        dayOfWeek: d.getDay(),
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [completedCountsByDate]);

  if (!isOperatorProfileOpen) return null;

  const totalTasksCompleted = completedTasks.length;
  const todayStr = formatDate(new Date());
  const todayCount = completedCountsByDate[todayStr] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#000101]/95 border border-white/10 text-zinc-100 shadow-[0_0_60px_rgba(0,245,212,0.15),0_25px_50px_rgba(0,0,0,0.9)] overflow-hidden font-mono flex flex-col"
      >
        {/* Reticle Corner Brackets */}
        <div className="absolute top-2 left-2 text-[10px] text-cyan-400/40 pointer-events-none">┌</div>
        <div className="absolute top-2 right-2 text-[10px] text-cyan-400/40 pointer-events-none">┐</div>
        <div className="absolute bottom-2 left-2 text-[10px] text-cyan-400/40 pointer-events-none">└</div>
        <div className="absolute bottom-2 right-2 text-[10px] text-cyan-400/40 pointer-events-none">┘</div>

        {/* Top Kinetic Neon Rim */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00E0FF] via-[#00F5D4] to-[#FF006E] shadow-[0_0_15px_rgba(0,245,212,0.8)]" />

        {/* Header Banner */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-[#00F5D4]/40 shadow-[0_0_14px_rgba(0,245,212,0.3)]">
              <Terminal className="w-4 h-4 text-[#00F5D4]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] absolute -top-0.5 -right-0.5 animate-ping" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[#00E0FF] flex items-center gap-2">
                <span>Profile & Analytics</span>
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                User Activity · 365-Day Contribution Heatmap · Task Velocity
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playClack();
                setIsOperatorProfileOpen(false);
              }}
              onMouseEnter={() => {
                playTick();
                setCloseHovered(true);
              }}
              onMouseLeave={() => setCloseHovered(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
              title="Close Profile [ESC]"
            >
              <ReticleHUD active={closeHovered} color="#00F5D4" offset={-3} />
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Identity & Prominent Active Streak Metric */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Profile Card */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00F5D4]/60 bg-cyan-950 flex-shrink-0 flex items-center justify-center text-base font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,245,212,0.35)]">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0] : 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-100 truncate tracking-wide">
                  {user?.name || 'Workspace Member'}
                </p>
                <p className="text-[10px] text-zinc-500 truncate font-mono">
                  {user?.email || 'member@aerox.dev'}
                </p>
                <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                  {user?.role || 'Member'}
                </span>
              </div>
            </div>

            {/* PROMINENT GLOWING ACTIVE STREAK METRIC */}
            <div className="md:col-span-2 p-4 rounded-xl bg-[#030806] border border-[#00F5D4]/40 flex items-center justify-between relative overflow-hidden shadow-[0_0_35px_rgba(0,245,212,0.25)]">
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-[#00F5D4] text-[#00F5D4] animate-pulse" />
                  <span>ACTIVE STREAK</span>
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className="text-2xl sm:text-3xl font-black tracking-wider text-[#00F5D4] drop-shadow-[0_0_20px_rgba(0,245,212,0.85)]"
                  >
                    Active Streak: {trueActiveStreak} Days
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    trueActiveStreak > 0
                      ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30'
                      : 'bg-zinc-800 text-zinc-400 border border-white/10'
                  }`}>
                    {trueActiveStreak > 0 ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="relative z-10 text-right space-y-1">
                <div className="text-[10px] text-zinc-400">
                  TOTAL COMPLETED: <span className="font-bold text-white">{totalTasksCompleted}</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  TODAY'S OUTPUT: <span className="font-bold text-[#00E0FF]">{todayCount}</span>
                </div>
              </div>

              {/* Background ambient glow */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#00F5D4]/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* SECTION 1: 7-DAY TASK COMPLETION VELOCITY (Interactive Framer Motion Graph) */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00E0FF]" />
                <span>7-DAY TASK COMPLETION VELOCITY</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                HOVER BAR TO INSPECT
              </span>
            </div>

            {/* Dynamic Graph Bars Container */}
            <div className="h-36 pt-6 pb-2 px-2 flex items-end justify-between gap-3 border-b border-white/10 relative">
              {velocityData.days.map((day, idx) => {
                const heightPercent = day.count > 0 
                  ? Math.max(16, Math.round((day.count / velocityData.maxCount) * 100))
                  : 4;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={day.dateStr}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => {
                      playTick();
                      setHoveredBarIndex(idx);
                    }}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Hover Inspection Tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: -8 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute -top-10 z-30 px-2 py-1 rounded bg-[#09090c] border border-[#00F5D4] text-[#00F5D4] text-[10px] font-mono shadow-[0_0_15px_rgba(0,245,212,0.4)] whitespace-nowrap pointer-events-none"
                        >
                          <span>{day.count} tasks · {day.dateStr}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Animated Vertical Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all relative ${
                        day.count === 0
                          ? 'bg-zinc-800/40'
                          : day.isToday
                          ? 'bg-gradient-to-t from-cyan-900 to-[#00E0FF] shadow-[0_0_12px_rgba(0,224,255,0.4)]'
                          : 'bg-gradient-to-t from-emerald-950 to-[#00F5D4]/80 hover:to-[#00F5D4]'
                      } ${isHovered && day.count > 0 ? 'scale-105 shadow-[0_0_20px_#00F5D4]' : ''}`}
                    >
                      {day.count > 0 && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-white rounded-t-lg opacity-80" />
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Day Labels */}
            <div className="flex justify-between px-2 pt-1 text-[10px] text-zinc-500 font-mono">
              {velocityData.days.map((day) => (
                <div key={day.dateStr} className="text-center flex-1">
                  <span className={day.isToday ? 'text-[#00E0FF] font-bold' : ''}>
                    {day.dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: 365-DAY "CONSISTENCY MATRIX" (GitHub-style Contribution Heatmap) */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00F5D4]" />
                <span>365-DAY CONSISTENCY MATRIX</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {totalTasksCompleted === 0 ? 'NO COMPLETED TASKS (PITCH BLACK)' : 'ANNUAL ACTIVITY MAP'}
              </span>
            </div>

            {/* Heatmap Grid (52 columns of 7 days) */}
            <div className="p-3 rounded-xl bg-[#020204] border border-white/5 overflow-x-auto relative">
              <div className="min-w-[620px]">
                {/* Months Bar */}
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono mb-2 px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>

                {/* Weeks Grid */}
                <div className="flex gap-[3px]">
                  {heatmapData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day) => {
                        // Level mapping:
                        // 0: Pitch black (#050508)
                        // 1: Deep emerald (#00382B)
                        // 2: Medium emerald (#008F6B)
                        // 3: Bright emerald (#00C49F)
                        // 4+: Phosphor Emerald (#00F5D4) glowing
                        let cellBg = '#050508';
                        let cellBorder = 'rgba(255,255,255,0.06)';
                        let cellGlow = 'none';

                        if (day.count === 0) {
                          cellBg = '#050508';
                        } else if (day.count <= 2) {
                          cellBg = '#00382B';
                          cellBorder = 'rgba(0,245,212,0.2)';
                        } else if (day.count <= 5) {
                          cellBg = '#008F6B';
                          cellBorder = 'rgba(0,245,212,0.4)';
                        } else if (day.count <= 8) {
                          cellBg = '#00C49F';
                          cellBorder = 'rgba(0,245,212,0.6)';
                          cellGlow = '0 0 4px rgba(0,245,212,0.4)';
                        } else {
                          cellBg = '#00F5D4';
                          cellBorder = '#00F5D4';
                          cellGlow = '0 0 10px rgba(0,245,212,0.85)';
                        }

                        return (
                          <div
                            key={day.dateStr}
                            title={`${day.dateStr}: ${day.count} tasks completed`}
                            onMouseEnter={() => {
                              if (day.count > 0) playTick();
                            }}
                            style={{
                              backgroundColor: cellBg,
                              borderColor: cellBorder,
                              boxShadow: cellGlow,
                            }}
                            className="w-[9px] h-[9px] rounded-xs border transition-transform hover:scale-150 cursor-pointer"
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Matrix Legend */}
                <div className="flex items-center justify-between pt-3 text-[9px] text-zinc-500 font-mono">
                  <span>ZERO-OUTPUT DAYS [PITCH BLACK]</span>
                  <div className="flex items-center gap-1.5">
                    <span>0</span>
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#050508] border border-white/10" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#00382B]" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#008F6B]" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#00C49F]" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#00F5D4] shadow-[0_0_6px_#00F5D4]" />
                    <span>HIGH OUTPUT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
            <span>AUTHENTICATED USER METRICS · SYNCHRONIZED WITH POSTGRES</span>
          </span>
          <button
            type="button"
            onClick={() => {
              playClack();
              setIsOperatorProfileOpen(false);
            }}
            onMouseEnter={() => playTick()}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-200 transition-colors uppercase tracking-wider cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </motion.div>
    </div>
  );
}
export default OperatorProfileModal;
