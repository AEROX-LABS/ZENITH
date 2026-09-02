'use client';

import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Target, 
  TrendingUp, 
  Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/parser';

interface RankInfo {
  title: string;
  minPoints: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  nextThreshold: number | null;
}

const RANKS: RankInfo[] = [
  {
    title: 'Novice',
    minPoints: 0,
    color: '#71717a',
    badgeBg: 'bg-zinc-800/40',
    badgeBorder: 'border-zinc-700',
    nextThreshold: 500,
  },
  {
    title: 'Specialist',
    minPoints: 500,
    color: '#00f0ff',
    badgeBg: 'bg-cyan-950/40',
    badgeBorder: 'border-cyan-500/50',
    nextThreshold: 1500,
  },
  {
    title: 'Master',
    minPoints: 1500,
    color: '#f59e0b',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-500/50',
    nextThreshold: 3500,
  },
  {
    title: 'Grandmaster',
    minPoints: 3500,
    color: '#ff0055',
    badgeBg: 'bg-[#ff0055]/15',
    badgeBorder: 'border-[#ff0055]/50',
    nextThreshold: null,
  },
];

function getRank(points: number): { current: RankInfo; next: RankInfo | null; progressToNext: number } {
  let current = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      current = RANKS[i];
      break;
    }
  }

  const currentIndex = RANKS.indexOf(current);
  const next = currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;

  let progressToNext = 100;
  if (next) {
    const range = next.minPoints - current.minPoints;
    const gained = points - current.minPoints;
    progressToNext = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  }

  return { current, next, progressToNext };
}

export function KarmaModal() {
  const { isKarmaModalOpen, setIsKarmaModalOpen, karma, updateKarmaGoals } = useApp();
  const [dailyGoalInput, setDailyGoalInput] = useState(karma.daily_goal);
  const [weeklyGoalInput, setWeeklyGoalInput] = useState(karma.weekly_goal);

  if (!isKarmaModalOpen) return null;

  const { current, next, progressToNext } = getRank(karma.points);
  const todayStr = formatDate(new Date());

  // Today count from history
  const todayItem = karma.history.find(h => h.date === todayStr);
  const todayCount = todayItem ? todayItem.count : 0;

  // Weekly total completed (sum of all 7 history entries)
  const weeklyTotal = karma.history.reduce((acc, h) => acc + h.count, 0);

  const dailyPercent = Math.min(100, Math.round((todayCount / karma.daily_goal) * 100));
  const weeklyPercent = Math.min(100, Math.round((weeklyTotal / karma.weekly_goal) * 100));

  // Find maximum count for scaling velocity chart
  const maxVelocity = Math.max(...karma.history.map(h => h.count), 5);

  const handleGoalUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateKarmaGoals(dailyGoalInput, weeklyGoalInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsKarmaModalOpen(false)} 
      />

      <div className="relative w-full max-w-2xl bg-[#0d0e12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Glow Accent Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-[#00f0ff] to-[#ff0055]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span>Zenith Karma Engine</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  Active Streak: {karma.streak_days} Days
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Reward consistent execution and build unbroken momentum
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsKarmaModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Rank & Points Showcase Card */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Current Standing</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-zinc-100 font-mono">{karma.points}</span>
                <span className="text-xs font-semibold text-cyan-400 font-mono">KARMA PTS</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                +10 points awarded for every completed task or subtask
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs ${current.badgeBg} ${current.badgeBorder}`}
                style={{ color: current.color }}
              >
                <Award className="w-4 h-4" />
                <span>Tier: {current.title}</span>
              </span>

              {next && (
                <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                  {next.minPoints - karma.points} pts to {next.title} ({progressToNext}%)
                </div>
              )}
            </div>
          </div>

          {/* Daily & Weekly Target Progress Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Daily Goal */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  Daily Goal
                </span>
                <span className="font-mono text-cyan-400">
                  {todayCount} / {karma.daily_goal} tasks ({dailyPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${dailyPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                {dailyPercent >= 100 ? '🎉 Daily goal achieved! Streak protected.' : `${karma.daily_goal - todayCount} more tasks needed today.`}
              </p>
            </div>

            {/* Weekly Goal */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Weekly Target
                </span>
                <span className="font-mono text-amber-400">
                  {weeklyTotal} / {karma.weekly_goal} tasks ({weeklyPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#ff0055] transition-all duration-500 rounded-full"
                  style={{ width: `${weeklyPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                {weeklyPercent >= 100 ? '🏆 Weekly milestone crushed!' : `${Math.max(0, karma.weekly_goal - weeklyTotal)} tasks left to hit target.`}
              </p>
            </div>
          </div>

          {/* 7-Day Completion Velocity Chart */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-4 font-mono">
              7-Day Task Completion Velocity
            </span>

            <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
              {karma.history.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.count / maxVelocity) * 100));
                const dateObj = new Date(item.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const isToday = item.date === todayStr;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    {/* Count tooltip */}
                    <span className="text-[10px] font-mono text-zinc-400 group-hover/bar:text-cyan-300">
                      {item.count}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-24 flex items-end justify-center">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isToday
                            ? 'bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-gradient-to-t from-zinc-700 to-zinc-500 group-hover/bar:from-cyan-700 group-hover/bar:to-cyan-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-[10px] font-mono ${isToday ? 'text-cyan-400 font-bold' : 'text-zinc-400'}`}>
                      {dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Adjustment Configuration */}
          <form onSubmit={handleGoalUpdate} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <span className="text-xs font-semibold text-zinc-300 block font-mono">
              Adjust Streak & Goal Targets
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Daily Task Goal</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={dailyGoalInput}
                  onChange={(e) => setDailyGoalInput(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Weekly Task Goal</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={weeklyGoalInput}
                  onChange={(e) => setWeeklyGoalInput(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                Save Targets
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
