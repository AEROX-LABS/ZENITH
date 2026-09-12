'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  Folder, 
  Flag, 
  Sparkles, 
  AlignLeft, 
  CheckSquare, 
  Loader2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { parseTaskInput, formatDate } from '@/lib/parser';
import { Priority } from '@/types';

const PRIORITY_CONFIG: Record<Priority, { label: string; text: string; bg: string; border: string; activeRing: string }> = {
  p1: { 
    label: 'P1 Urgent', 
    text: 'text-[#ff0055]', 
    bg: 'bg-[#ff0055]/15', 
    border: 'border-[#ff0055]/40',
    activeRing: 'ring-1 ring-[#ff0055] bg-[#ff0055]/25 border-[#ff0055]'
  },
  p2: { 
    label: 'P2 High', 
    text: 'text-[#f59e0b]', 
    bg: 'bg-[#f59e0b]/15', 
    border: 'border-[#f59e0b]/40',
    activeRing: 'ring-1 ring-[#f59e0b] bg-[#f59e0b]/25 border-[#f59e0b]'
  },
  p3: { 
    label: 'P3 Medium', 
    text: 'text-[#00f0ff]', 
    bg: 'bg-[#00f0ff]/15', 
    border: 'border-[#00f0ff]/40',
    activeRing: 'ring-1 ring-[#00f0ff] bg-[#00f0ff]/25 border-[#00f0ff]'
  },
  p4: { 
    label: 'P4 Low', 
    text: 'text-zinc-400', 
    bg: 'bg-zinc-800/40', 
    border: 'border-zinc-700/50',
    activeRing: 'ring-1 ring-zinc-500 bg-zinc-700/50 border-zinc-500'
  },
};

function AddTaskModalDialog() {
  const { 
    setIsQuickAddOpen, 
    addTask, 
    projects, 
    activeView, 
    addTaskInitialData,
    showToast 
  } = useApp();

  // Form State initialized on mount
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(() => addTaskInitialData?.description || '');
  const [priority, setPriority] = useState<Priority>(() => addTaskInitialData?.priority || 'p4');
  const [dueDate, setDueDate] = useState<string>(() => {
    if (addTaskInitialData?.due_date) return addTaskInitialData.due_date;
    if (activeView === 'today') return formatDate(new Date());
    return '';
  });
  const [deadline, setDeadline] = useState(() => addTaskInitialData?.deadline || '');
  const [projectId, setProjectId] = useState<string | null>(() => {
    if (addTaskInitialData?.project_id !== undefined) return addTaskInitialData.project_id;
    if (activeView.startsWith('proj_')) return activeView;
    return null;
  });
  const [labels, setLabels] = useState<string[]>(() => addTaskInitialData?.labels || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // UI / Mutation State
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        setIsQuickAddOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, setIsQuickAddOpen]);

  // Real-time Regex parsing for smart shortcuts in title
  const parsed = parseTaskInput(title);
  const cleanDisplayTitle = parsed.cleanTitle || title;

  // Handle title input change and clear validation error
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (titleError && e.target.value.trim()) {
      setTitleError(null);
    }
    if (mutationError) {
      setMutationError(null);
    }

    // Auto-detect project if typed e.g. #Core
    const matched = parseTaskInput(e.target.value);
    if (matched.projectName) {
      const proj = projects.find(p => p.name.toLowerCase().includes(matched.projectName!.toLowerCase()));
      if (proj) setProjectId(proj.id);
    }
    // Auto-detect priority if typed e.g. p1
    if (matched.priority && matched.priority !== 'p4') {
      setPriority(matched.priority);
    }
    // Auto-detect due date if typed e.g. today
    if (matched.dueDate) {
      setDueDate(matched.dueDate);
    }
    // Auto-detect hard deadline if typed e.g. {Friday}
    if (matched.deadline) {
      setDeadline(matched.deadline);
    }
    // Auto-detect labels if typed e.g. @Deploy
    if (matched.labels.length > 0) {
      setLabels(prev => Array.from(new Set([...prev, ...matched.labels])));
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagInput.trim().replace(/^@/, '');
    if (trimmed && !labels.includes(trimmed)) {
      setLabels(prev => [...prev, trimmed]);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLabels(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSetQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    setDueDate(formatDate(d));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalTitle = cleanDisplayTitle.trim();

    // Client-side validation: ensure title is not empty
    if (!finalTitle) {
      setTitleError('Task title is required. Please provide a title.');
      titleInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setMutationError(null);

    try {
      await addTask({
        title: finalTitle,
        description: description.trim(),
        priority,
        due_date: dueDate || null,
        deadline: deadline.trim() || null,
        project_id: projectId,
        section_id: addTaskInitialData?.section_id || null,
        labels,
      });

      showToast(`Task "${finalTitle}" created successfully`, 'success');
      setIsQuickAddOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task. Please try again.';
      setMutationError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === projectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={() => {
          if (!loading) setIsQuickAddOpen(false);
        }} 
      />

      {/* Obsidian Dialog Card */}
      <div 
        className="relative w-full max-w-xl bg-[#0d0e12] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_25px_rgba(0,240,255,0.12)] overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
      >
        {/* Glow Header Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ff0055]" />

        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 id="add-task-title" className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Create New Task</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 hidden sm:inline-block">
                  Native Workflow
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Add an actionable objective to your workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQuickAddOpen(false)}
            disabled={loading}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 disabled:opacity-40 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Mutation Error Alert Banner */}
          {mutationError && (
            <div className="p-3.5 rounded-xl bg-[#ff0055]/10 border border-[#ff0055]/40 text-[#ff0055] text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Task Creation Failed</p>
                <p className="text-[#ff7096] mt-0.5">{mutationError}</p>
              </div>
            </div>
          )}

          {/* Title Input (Required) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="task-title-input" className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <span>Task Title</span>
                <span className="text-[#ff0055]">*</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                Supports #project, @label, p1-p4, today
              </span>
            </div>

            <div className="relative">
              <input
                id="task-title-input"
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Ship Core Engine V2 release"
                disabled={loading}
                className={`w-full bg-black/40 border rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
                  titleError 
                    ? 'border-[#ff0055] focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055]/40' 
                    : 'border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'
                }`}
              />
            </div>

            {titleError && (
              <p className="text-xs text-[#ff0055] flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{titleError}</span>
              </p>
            )}
          </div>

          {/* Description Textarea (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="task-description-input" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>Description / Details</span>
              <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Add contextual details, specifications, or links..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
            />
          </div>

          {/* Grid: Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-zinc-500" />
                <span>Priority</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((pKey) => {
                  const cfg = PRIORITY_CONFIG[pKey];
                  const isSelected = priority === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setPriority(pKey)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                        isSelected
                          ? cfg.activeRing + ' ' + cfg.text
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-current shadow-[0_0_8px_currentColor]' : 'bg-zinc-600'}`} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="task-due-date-input" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Due Date</span>
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    disabled={loading}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <input
                  id="task-due-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('today')}
                    disabled={loading}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-zinc-400 hover:text-cyan-300 border border-white/5 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('tomorrow')}
                    disabled={loading}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-zinc-400 hover:text-cyan-300 border border-white/5 transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('nextWeek')}
                    disabled={loading}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-zinc-400 hover:text-cyan-300 border border-white/5 transition-colors"
                  >
                    Next Week
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row: Project Selector & Hard Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Project Picker */}
            <div className="space-y-1.5">
              <label htmlFor="task-project-select" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                <span>Project</span>
              </label>

              <select
                id="task-project-select"
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                disabled={loading}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="">No Project (Inbox)</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hard External Deadline (Optional) */}
            <div className="space-y-1.5">
              <label htmlFor="task-deadline-input" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Hard Deadline</span>
                <span className="text-zinc-600 font-normal">(optional)</span>
              </label>

              <input
                id="task-deadline-input"
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
                placeholder="e.g. 5:00 PM or Friday EOD"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Tags / Labels Row */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                <span>Labels & Tags</span>
              </label>
              {!showTagInput && (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  disabled={loading}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add tag</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
              {labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-violet-950/40 border border-violet-500/40 text-violet-300"
                >
                  <span>@{lbl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(lbl)}
                    disabled={loading}
                    className="hover:text-violet-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {showTagInput && (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e);
                      }
                    }}
                    placeholder="Tag name..."
                    autoFocus
                    className="bg-black/60 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none w-28"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs hover:bg-cyan-500/30"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagInput(false)}
                    className="p-1 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {labels.length === 0 && !showTagInput && (
                <span className="text-[11px] text-zinc-600 italic">No tags attached</span>
              )}
            </div>
          </div>
        </form>

        {/* Action Controls & Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-white/5 bg-[#09090b]/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status summary pill */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 truncate">
            {selectedProject && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px] truncate">
                <span 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <span className="truncate">{selectedProject.name}</span>
              </span>
            )}
            {dueDate && (
              <span className="text-[11px] text-emerald-400 font-mono">
                Due: {dueDate}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/5 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.6)] cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <span>Create Task</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddTaskModal() {
  const { isQuickAddOpen } = useApp();
  if (!isQuickAddOpen) return null;
  return <AddTaskModalDialog />;
}
