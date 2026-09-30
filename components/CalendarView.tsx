'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  X,
  Maximize2,
  Sparkles,
  Flag,
  Folder,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Task, Priority } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/parser';
import { useAudio } from '@/hooks/useAudio';

const PRIORITY_COLORS: Record<Priority, string> = {
  p1: 'bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/40 hover:bg-[#ff0055]/30',
  p2: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40 hover:bg-[#f59e0b]/30',
  p3: 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/30',
  p4: 'bg-zinc-800/40 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800/60',
};

const DROPDOWN_PRIORITIES: Record<Priority, { label: string; text: string; bg: string; activeBorder: string; glow: string }> = {
  p1: { label: 'P1 Urgent', text: 'text-[#ff0055]', bg: 'bg-[#ff0055]/15', activeBorder: 'border-[#ff0055] ring-1 ring-[#ff0055]/60', glow: 'shadow-[0_0_10px_rgba(255,0,85,0.3)]' },
  p2: { label: 'P2 High', text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/15', activeBorder: 'border-[#f59e0b] ring-1 ring-[#f59e0b]/60', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
  p3: { label: 'P3 Medium', text: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/15', activeBorder: 'border-[#00f0ff] ring-1 ring-[#00f0ff]/60', glow: 'shadow-[0_0_10px_rgba(0,240,255,0.3)]' },
  p4: { label: 'P4 Low', text: 'text-zinc-400', bg: 'bg-zinc-800/40', activeBorder: 'border-zinc-500 ring-1 ring-zinc-500/50', glow: '' },
};

// Helper to convert HH:mm to minutes from midnight (0 - 1439)
function parseTimeToMinutes(timeStr: string | null | undefined): number {
  if (!timeStr) return 9999;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 9999;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}

// Tactical time phase detector matching slider: Morning (Cyan), Afternoon (Amber), Night (Magenta)
function getTimePhaseTheme(timeStr: string | null | undefined) {
  if (!timeStr) {
    return {
      phase: 'UNASSIGNED',
      color: '#71717A',
      border: 'border-zinc-800',
      bg: 'bg-zinc-900/60',
      text: 'text-zinc-500',
      glow: '',
      dot: 'bg-zinc-600',
    };
  }
  const mins = parseTimeToMinutes(timeStr);
  if (mins >= 300 && mins < 720) {
    // 05:00 - 11:59 Morning Cyan
    return {
      phase: 'MORNING PHASE',
      color: '#00E0FF',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_12px_rgba(0,224,255,0.3)]',
      dot: 'bg-cyan-400 shadow-[0_0_6px_#00E0FF]',
    };
  } else if (mins >= 720 && mins < 1080) {
    // 12:00 - 17:59 Afternoon Amber
    return {
      phase: 'AFTERNOON PHASE',
      color: '#F59E0B',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      dot: 'bg-amber-400 shadow-[0_0_6px_#F59E0B]',
    };
  } else {
    // 18:00 - 04:59 Night Magenta
    return {
      phase: 'NIGHT PHASE',
      color: '#FF006E',
      border: 'border-pink-500/40',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400',
      glow: 'shadow-[0_0_12px_rgba(255,0,110,0.3)]',
      dot: 'bg-[#FF006E] shadow-[0_0_6px_#FF006E]',
    };
  }
}

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const { 
    setSelectedTaskId, 
    openAddTaskModal, 
    addTask, 
    updateTask,
    projects, 
    currentProject, 
    showToast 
  } = useApp();

  const { playTick, playClack, playThud } = useAudio();

  const [currentDate, setCurrentDate] = useState(new Date());

  // Dropdown Popover State for active calendar cell
  const [activeDropdownDate, setActiveDropdownDate] = useState<string | null>(null);
  const [dropdownTitle, setDropdownTitle] = useState('');
  const [dropdownDescription, setDropdownDescription] = useState('');
  const [dropdownPriority, setDropdownPriority] = useState<Priority>('p4');
  const [dropdownProjectId, setDropdownProjectId] = useState<string | null>(() => currentProject ? currentProject.id : null);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState<string | null>(null);

  // Deep-dive magnification state (1500ms hover trigger)
  const [deepDiveDate, setDeepDiveDate] = useState<string | null>(null);
  const [chargingDate, setChargingDate] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Close dropdown or deep-dive on global Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdownDate(null);
        setDeepDiveDate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    playClack();
    setCurrentDate(new Date(year, month - 1, 1));
    setActiveDropdownDate(null);
  };

  const handleNextMonth = () => {
    playClack();
    setCurrentDate(new Date(year, month + 1, 1));
    setActiveDropdownDate(null);
  };

  const handleJumpToday = () => {
    playClack();
    setCurrentDate(new Date());
    setActiveDropdownDate(null);
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

  // Trigger contextual dropdown popover for date
  const handleOpenDropdown = (dateStr: string) => {
    playClack();
    setActiveDropdownDate(dateStr);
    setDropdownTitle('');
    setDropdownDescription('');
    setDropdownPriority('p4');
    setDropdownProjectId(currentProject ? currentProject.id : null);
    setDropdownLoading(false);
    setDropdownError(null);
  };

  // Submit task from dropdown
  const handleDropdownSubmit = async (dateStr: string) => {
    const trimmed = dropdownTitle.trim();
    if (!trimmed) {
      setDropdownError('Task title is required');
      return;
    }

    setDropdownLoading(true);
    setDropdownError(null);

    try {
      await addTask({
        title: trimmed,
        description: dropdownDescription.trim(),
        priority: dropdownPriority,
        project_id: dropdownProjectId,
        due_date: dateStr,
      });

      playClack();
      showToast(`Task "${trimmed}" scheduled for ${dateStr}`, 'success');
      setActiveDropdownDate(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule task';
      setDropdownError(msg);
      showToast(msg, 'error');
    } finally {
      setDropdownLoading(false);
    }
  };

  // Deep-dive tasks for the magnified cell
  const deepDiveTasks = useMemo(() => {
    if (!deepDiveDate) return [];
    return tasks.filter((t) => t.due_date === deepDiveDate);
  }, [tasks, deepDiveDate]);

  // Group by category (Project name or first label) & sort chronologically by slider-assigned time
  const groupedDeepDiveTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    
    deepDiveTasks.forEach((task) => {
      let category = 'GENERAL // INBOX';
      if (task.project_id) {
        const proj = projects.find((p) => p.id === task.project_id);
        if (proj) category = `PROJECT: ${proj.name.toUpperCase()}`;
      } else if (task.labels && task.labels.length > 0) {
        category = `TAG: ${task.labels[0].toUpperCase()}`;
      }

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(task);
    });

    // Sort each category chronologically by slider-assigned time (deadline)
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => {
        const minA = parseTimeToMinutes(a.deadline);
        const minB = parseTimeToMinutes(b.deadline);
        return minA - minB;
      });
    });

    return groups;
  }, [deepDiveTasks, projects]);

  const handleCellMouseEnter = (dateStr: string) => {
    if (activeDropdownDate || deepDiveDate) return;
    playTick(0.12);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setChargingDate(dateStr);
    hoverTimerRef.current = setTimeout(() => {
      setChargingDate(null);
      setDeepDiveDate(dateStr);
      playThud(0.35);
    }, 1500);
  };

  const handleCellMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setChargingDate(null);
  };

  return (
    <div className="bg-[#0d0e12]/80 border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
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
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
              aria-label="Next month"
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
          const dayTasks = tasks.filter(t => t.due_date === cell.dateStr);
          const isDropdownActive = activeDropdownDate === cell.dateStr;
          const colIndex = idx % 7;
          const rowIndex = Math.floor(idx / 7);

          return (
            <div
              key={idx}
              onMouseEnter={() => {
                if (cell.isCurrentMonth && !isDropdownActive) {
                  handleCellMouseEnter(cell.dateStr);
                }
              }}
              onMouseLeave={() => {
                handleCellMouseLeave();
              }}
              onClick={() => {
                if (cell.isCurrentMonth && !isDropdownActive) {
                  handleCellMouseLeave();
                  handleOpenDropdown(cell.dateStr);
                }
              }}
              className={`relative min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all group/cell ${
                cell.isCurrentMonth
                  ? 'bg-black/30 border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.02] cursor-pointer'
                  : 'bg-black/10 border-transparent text-zinc-600 opacity-40 cursor-default'
              } ${cell.isToday ? 'ring-1 ring-cyan-400 bg-cyan-950/10' : ''} ${
                isDropdownActive ? 'ring-2 ring-cyan-400 border-cyan-500/60 z-30 bg-cyan-950/20' : ''
              } ${chargingDate === cell.dateStr ? 'border-cyan-400/80 shadow-[0_0_15px_rgba(0,224,255,0.3)]' : ''}`}
            >
              {/* 1.5s Hover Charging Indicator */}
              {chargingDate === cell.dateStr && (
                <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden z-20">
                  <div className="absolute inset-0 border border-cyan-400/80 animate-pulse" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-950/60">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-cyan-400 via-[#00F5D4] to-[#FF006E]"
                    />
                  </div>
                  <div className="absolute top-1 right-1 text-[8px] font-mono text-cyan-300 font-bold bg-black/90 px-1 rounded border border-cyan-500/40">
                    1.5s HOLD
                  </div>
                </div>
              )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDropdownActive) {
                        setActiveDropdownDate(null);
                      } else {
                        handleOpenDropdown(cell.dateStr);
                      }
                    }}
                    className={`p-1 rounded-md transition-all ${
                      isDropdownActive
                        ? 'text-cyan-300 bg-cyan-500/20 ring-1 ring-cyan-400 opacity-100'
                        : 'text-zinc-600 hover:text-cyan-400 hover:bg-white/5 opacity-0 group-hover/cell:opacity-100'
                    }`}
                    title={`Schedule task for ${cell.dateStr}`}
                    aria-label={`Schedule task for ${cell.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(task.id);
                      }}
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

              {/* ========================================================================= */}
              {/* IMMERSIVE IN-APP CELL DROPDOWN POPOVER FOR TASK CREATION                  */}
              {/* ========================================================================= */}
              {isDropdownActive && (
                <>
                  {/* Invisible backdrop to dismiss dropdown on click outside */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownDate(null);
                    }} 
                  />

                  {/* Obsidian Popover Card */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute z-50 w-72 sm:w-80 bg-[#0d0e12]/95 border border-cyan-500/50 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.95),0_0_25px_rgba(0,240,255,0.25)] backdrop-blur-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 cursor-default ${
                      colIndex >= 4 ? 'right-0 sm:right-0' : 'left-0 sm:left-0'
                    } ${
                      rowIndex >= 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                    }`}
                    role="dialog"
                    aria-label={`Schedule task for ${cell.dateStr}`}
                  >
                    {/* Top Neon Accent Stripe */}
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-[#ff0055] rounded-t-xl -mt-4 -mx-4 mb-3" />

                    {/* Popover Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          Schedule for <span className="text-cyan-400">{cell.dateStr}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDropdownDate(null);
                            openAddTaskModal({
                              due_date: cell.dateStr,
                              project_id: dropdownProjectId,
                              priority: dropdownPriority,
                            });
                          }}
                          className="p-1 text-zinc-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
                          title="Expand to full modal"
                          aria-label="Expand to full modal"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDropdownDate(null)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                          title="Close"
                          aria-label="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Task Title Input */}
                    <div className="space-y-1">
                      <input
                        autoFocus
                        type="text"
                        value={dropdownTitle}
                        onChange={(e) => {
                          setDropdownTitle(e.target.value);
                          if (dropdownError) setDropdownError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleDropdownSubmit(cell.dateStr);
                          } else if (e.key === 'Escape') {
                            setActiveDropdownDate(null);
                          }
                        }}
                        placeholder="Task title... (Enter to save)"
                        className={`w-full bg-black/60 border rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
                          dropdownError
                            ? 'border-[#ff0055] focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055]/30'
                            : 'border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                        }`}
                      />
                      {dropdownError && (
                        <p className="text-[11px] text-[#ff0055] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{dropdownError}</span>
                        </p>
                      )}
                    </div>

                    {/* Priority Selector Pills */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Flag className="w-3 h-3 text-zinc-500" />
                          <span>Priority</span>
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">{dropdownPriority}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((p) => {
                          const isSel = dropdownPriority === p;
                          const cfg = DROPDOWN_PRIORITIES[p];
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setDropdownPriority(p)}
                              className={`py-1 rounded-lg border text-[11px] font-mono font-bold transition-all text-center ${
                                isSel
                                  ? `${cfg.bg} ${cfg.text} ${cfg.activeBorder} ${cfg.glow}`
                                  : 'bg-black/30 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                              }`}
                            >
                              {p.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Selector Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                        <Folder className="w-3 h-3 text-zinc-500" />
                        <span>Project</span>
                      </label>
                      <select
                        value={dropdownProjectId || ''}
                        onChange={(e) => setDropdownProjectId(e.target.value || null)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 cursor-pointer"
                      >
                        <option value="">No Project (Inbox)</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Optional Note */}
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={dropdownDescription}
                        onChange={(e) => setDropdownDescription(e.target.value)}
                        placeholder="Add note or context... (optional)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400/40"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setActiveDropdownDate(null)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={dropdownLoading}
                        onClick={() => handleDropdownSubmit(cell.dateStr)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl shadow-[0_0_14px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
                      >
                        {dropdownLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>Schedule Task</span>
                            <Sparkles className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1.5s DEEP-DIVE MAGNIFICATION BREAKOUT OVERLAY                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deepDiveDate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/75 animate-in fade-in duration-200"
            onClick={() => setDeepDiveDate(null)}
          >
            <motion.div
              layoutId={`cell-${deepDiveDate}`}
              initial={{ scale: 0.75, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.75, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onMouseLeave={() => setDeepDiveDate(null)}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#000101]/95 border-2 border-cyan-400/50 rounded-2xl p-6 backdrop-blur-2xl text-zinc-100 font-mono flex flex-col overflow-hidden"
              style={{
                boxShadow: '0 0 50px rgba(0, 224, 255, 0.2), 0 0 80px rgba(0,0,0,0.95)',
              }}
            >
              {/* Corner Reticle Accents */}
              <div className="absolute top-2 left-2 text-[10px] text-cyan-400/60 pointer-events-none select-none">┌</div>
              <div className="absolute top-2 right-2 text-[10px] text-cyan-400/60 pointer-events-none select-none">┐</div>
              <div className="absolute bottom-2 left-2 text-[10px] text-cyan-400/60 pointer-events-none select-none">└</div>
              <div className="absolute bottom-2 right-2 text-[10px] text-cyan-400/60 pointer-events-none select-none">┘</div>

              {/* Glowing Top Neon Ribbon */}
              <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-[#00F5D4] to-[#FF006E] rounded-t-xl -mt-6 -mx-6 mb-4 shadow-[0_0_15px_rgba(0,224,255,0.6)]" />

              {/* Deep-Dive Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E0FF] animate-pulse" />
                    <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-bold">
                      CALENDAR // 1.5S TACTICAL DEEP-DIVE
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                      2.5x MAGNIFIED
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    <span>{deepDiveDate}</span>
                    <span className="text-xs text-zinc-400 font-normal">
                      ({deepDiveTasks.length} {deepDiveTasks.length === 1 ? 'TASK' : 'TASKS'})
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClack();
                      openAddTaskModal({ due_date: deepDiveDate });
                      setDeepDiveDate(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs rounded-xl transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>NEW TASK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClack();
                      setDeepDiveDate(null);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="Snap back (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Deep-Dive Body: Grouped by Category & Chronologically Sorted */}
              <div className="flex-1 overflow-y-auto my-4 space-y-5 pr-1 no-scrollbar">
                {Object.keys(groupedDeepDiveTasks).length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/5 mx-auto flex items-center justify-center text-zinc-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-300 font-bold uppercase tracking-wider">
                        NO SCHEDULED TELEMETRY
                      </p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        No tasks have been assigned to coordinate {deepDiveDate}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        openAddTaskModal({ due_date: deepDiveDate });
                        setDeepDiveDate(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>INITIALIZE TASK</span>
                    </button>
                  </div>
                ) : (
                  Object.entries(groupedDeepDiveTasks).map(([category, catTasks]) => (
                    <div key={category} className="space-y-2">
                      {/* Category Header */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.03] border-l-2 border-cyan-400 rounded-r-lg">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-bold text-zinc-200 tracking-wider">
                            {category}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-white/5">
                          {catTasks.length} {catTasks.length === 1 ? 'TASK' : 'TASKS'}
                        </span>
                      </div>

                      {/* Chronologically Sorted Task Items */}
                      <div className="space-y-1.5 pl-1 sm:pl-2">
                        {catTasks.map((task) => {
                          const phase = getTimePhaseTheme(task.deadline);
                          const priorityCfg = DROPDOWN_PRIORITIES[task.priority] || DROPDOWN_PRIORITIES.p4;

                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setDeepDiveDate(null);
                              }}
                              className={`group/item flex items-center justify-between gap-3 p-3 rounded-xl border bg-black/40 hover:bg-white/[0.04] transition-all cursor-pointer ${
                                task.completed ? 'opacity-50 border-white/5' : 'border-white/10 hover:border-cyan-500/40'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Completion Toggle Checkbox */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTask(task.id, { completed: !task.completed });
                                  }}
                                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                    task.completed
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(0,245,212,0.4)]'
                                      : 'border-white/20 hover:border-cyan-400 text-transparent'
                                  }`}
                                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Slider-Assigned Chronological Time Badge */}
                                <div
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold flex-shrink-0 ${phase.bg} ${phase.border} ${phase.text} ${phase.glow}`}
                                  title={`Assigned Time: ${task.deadline || 'Anytime'}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${phase.dot}`} />
                                  <Clock className="w-3 h-3" />
                                  <span>{task.deadline || '--:-- ANYTIME'}</span>
                                </div>

                                {/* Task Title */}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-xs text-zinc-100 truncate font-sans font-medium group-hover/item:text-cyan-300 transition-colors ${
                                      task.completed ? 'line-through text-zinc-500' : ''
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-[11px] text-zinc-500 truncate font-sans">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Priority & Inspection Action */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.activeBorder}`}
                                >
                                  {task.priority.toUpperCase()}
                                </span>
                                <span className="text-zinc-600 group-hover/item:text-cyan-400 transition-colors">
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Deep-Dive Footer Snapping Hint */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>KINETIC SNAP-BACK: MOVE MOUSE OFF CELL TO COLLAPSE</span>
                </span>
                <span className="text-zinc-600">[ESC] DISMISS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
