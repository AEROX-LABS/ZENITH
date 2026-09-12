'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { Task, Priority } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/parser';

const PRIORITY_COLORS: Record<Priority, string> = {
  p1: 'bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/40 hover:bg-[#ff0055]/30',
  p2: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40 hover:bg-[#f59e0b]/30',
  p3: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/30',
  p4: 'bg-zinc-800/40 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800/60',
};

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const { setSelectedTaskId, openAddTaskModal, currentProject } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = formatDate(new Date());

  // Generate calendar day cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = formatDate(prevDate);
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(year, month, d);
    const dateStr = formatDate(thisDate);
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete full grid (multiples of 7)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = formatDate(nextDate);
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  const handleQuickAddForDate = (dateStr: string) => {
    openAddTaskModal({
      due_date: dateStr,
      project_id: currentProject ? currentProject.id : null,
    });
  };

  return (
    <div className="bg-[#0d0e12]/80 border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <span>{monthNames[month]}</span>
              <span className="text-cyan-400 font-mono">{year}</span>
            </h2>
            <p className="text-xs text-zinc-400">Visual schedule & milestone distribution</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 border border-white/5 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-white/5 border border-white/5 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-4 pb-2 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span className="text-cyan-400/80">Sat</span>
        <span className="text-cyan-400/80">Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarCells.map((cell, idx) => {
          // Tasks scheduled on this day
          const dayTasks = tasks.filter(t => t.due_date === cell.dateStr);

          return (
            <div
              key={idx}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all group/cell ${
                cell.isCurrentMonth
                  ? 'bg-black/30 border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.02]'
                  : 'bg-black/10 border-transparent text-zinc-600 opacity-40'
              } ${cell.isToday ? 'ring-1 ring-cyan-400 bg-cyan-950/10' : ''}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    cell.isToday
                      ? 'bg-cyan-400 text-zinc-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                      : cell.isCurrentMonth
                      ? 'text-zinc-300'
                      : 'text-zinc-600'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {cell.isCurrentMonth && (
                  <button
                    type="button"
                    onClick={() => handleQuickAddForDate(cell.dateStr)}
                    className="p-1 rounded-md text-zinc-600 hover:text-cyan-400 hover:bg-white/5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                    title={`Add task for ${cell.dateStr}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tasks List in Day Cell */}
              <div className="space-y-1 my-1 overflow-y-auto max-h-[70px] no-scrollbar">
                {dayTasks.map(task => {
                  const pColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.p4;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`px-1.5 py-0.5 rounded-md border text-[11px] font-medium truncate cursor-pointer transition-all flex items-center gap-1 ${pColor} ${
                        task.completed ? 'opacity-50 line-through' : ''
                      }`}
                      title={task.title}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400" />
                      ) : task.deadline ? (
                        <Clock className="w-2.5 h-2.5 flex-shrink-0 text-[#ff0055]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom counter if any */}
              <div className="text-right">
                {dayTasks.length > 2 && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {dayTasks.length} tasks
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
