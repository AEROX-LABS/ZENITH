'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CornerDownLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Folder, 
  Flag, 
  Sparkles, 
  AlignLeft 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { parseTaskInput, ParsedTaskInput } from '@/lib/parser';
import { Priority } from '@/types';

const PRIORITY_BADGES: Record<Priority, { label: string; text: string; bg: string; border: string }> = {
  p1: { label: 'P1 Urgent', text: 'text-[#ff0055]', bg: 'bg-[#ff0055]/15', border: 'border-[#ff0055]/40' },
  p2: { label: 'P2 High', text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/15', border: 'border-[#f59e0b]/40' },
  p3: { label: 'P3 Medium', text: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/15', border: 'border-[#00f0ff]/40' },
  p4: { label: 'P4 Low', text: 'text-zinc-400', bg: 'bg-zinc-800/40', border: 'border-zinc-700/50' },
};

function QuickAddModalDialog() {
  const { 
    setIsQuickAddOpen, 
    addTask, 
    projects, 
    activeView 
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [selectedProjectId] = useState<string | null>(() => 
    activeView.startsWith('proj_') ? activeView : null
  );
  const [manualPriority] = useState<Priority | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Real-time Regex parsing
  const parsed: ParsedTaskInput = parseTaskInput(inputVal);

  // Match parsed project name to existing projects if present
  const matchedProject = parsed.projectName
    ? projects.find(p => p.name.toLowerCase().includes(parsed.projectName!.toLowerCase()))
    : null;

  const effectivePriority = manualPriority || parsed.priority;
  const effectiveProjectId = selectedProjectId || (matchedProject ? matchedProject.id : null);
  const targetProject = projects.find(p => p.id === effectiveProjectId);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!parsed.cleanTitle && !inputVal.trim()) return;

    addTask({
      title: parsed.cleanTitle || inputVal.trim(),
      description: description.trim(),
      priority: effectivePriority,
      project_id: effectiveProjectId,
      due_date: parsed.dueDate,
      deadline: parsed.deadline,
      recurrence: parsed.recurrence,
      labels: parsed.labels,
    });

    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={() => setIsQuickAddOpen(false)} 
      />

      {/* Obsidian Glass Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0d0e12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Glow Header Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ff0055]" />

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Top Bar: Title & Close */}
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Quick-Add</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500">Non-AI Instant Regex Engine</span>
            </div>

            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Quick-Add Input */}
          <div className="relative my-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. Ship V2 release #CoreEngine @Deploy p1 today {Friday EOD}"
              className="w-full bg-transparent text-lg sm:text-xl font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none border-b border-white/10 pb-3"
            />
          </div>

          {/* DYNAMIC REACTIVE LIVE BADGES ROW */}
          <div className="flex items-center gap-2 flex-wrap min-h-[32px] py-2">
            {/* Project Pill */}
            {targetProject ? (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-medium">
                <Folder className="w-3 h-3 text-cyan-400" />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: targetProject.color }}
                />
                <span>#{targetProject.name}</span>
              </span>
            ) : parsed.projectName ? (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                <Folder className="w-3 h-3 text-zinc-400" />
                <span>#{parsed.projectName}</span>
              </span>
            ) : null}

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border font-mono font-semibold ${
                PRIORITY_BADGES[effectivePriority].bg
              } ${PRIORITY_BADGES[effectivePriority].border} ${
                PRIORITY_BADGES[effectivePriority].text
              }`}
            >
              <Flag className="w-3 h-3" />
              <span>{PRIORITY_BADGES[effectivePriority].label}</span>
            </span>

            {/* Due Date & Recurrence Pill */}
            {parsed.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-medium">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>{parsed.recurrence ? `${parsed.recurrence} (${parsed.dueDate})` : parsed.dueDate}</span>
              </span>
            )}

            {/* Hard External Deadline Pill */}
            {parsed.deadline && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#ff0055]/15 border border-[#ff0055]/50 text-[#ff0055] font-mono font-semibold shadow-[0_0_12px_rgba(255,0,85,0.2)]">
                <Clock className="w-3 h-3" />
                <span>Deadline: {parsed.deadline}</span>
              </span>
            )}

            {/* Category Tags (@labels) */}
            {parsed.labels.map((lbl, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-violet-950/40 border border-violet-500/40 text-violet-300"
              >
                <Tag className="w-3 h-3 text-violet-400" />
                <span>@{lbl}</span>
              </span>
            ))}
          </div>

          {/* Optional Description Expander */}
          {showDescription ? (
            <div className="mt-3">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add contextual notes, links, or specifications..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition-colors"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Add description...</span>
            </button>
          )}

          {/* Bottom Syntax Helper & Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 mt-4 border-t border-white/5">
            {/* Syntax Cheat Sheet */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono flex-wrap">
              <span className="text-cyan-400">#project</span>
              <span className="text-violet-400">@label</span>
              <span className="text-amber-400">p1-p4</span>
              <span className="text-emerald-400">today</span>
              <span className="text-[#ff0055]">{`{deadline}`}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!parsed.cleanTitle && !inputVal.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)]"
              >
                <span>Create Task</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function QuickAddModal() {
  const { isQuickAddOpen } = useApp();

  if (!isQuickAddOpen) return null;

  return <QuickAddModalDialog />;
}
