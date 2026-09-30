'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Cpu, 
  Layers, 
  FolderKanban, 
  Workflow, 
  Zap, 
  GitBranch, 
  Boxes, 
  Database, 
  Flame, 
  ShieldAlert, 
  Target, 
  Check,
  LayoutGrid,
  List,
  Calendar,
  Code
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Priority, ViewMode, SystemStructureSection } from '@/types';

const AVAILABLE_ICONS = [
  { name: 'Cpu', icon: Cpu, label: 'Compute' },
  { name: 'Layers', icon: Layers, label: 'Layers' },
  { name: 'FolderKanban', icon: FolderKanban, label: 'Kanban' },
  { name: 'Workflow', icon: Workflow, label: 'Workflow' },
  { name: 'Zap', icon: Zap, label: 'Lightning' },
  { name: 'GitBranch', icon: GitBranch, label: 'Branch' },
  { name: 'Boxes', icon: Boxes, label: 'Modules' },
  { name: 'Database', icon: Database, label: 'Database' },
  { name: 'Sparkles', icon: Sparkles, label: 'Engine' },
  { name: 'Flame', icon: Flame, label: 'Streak' },
  { name: 'Target', icon: Target, label: 'Goal' },
  { name: 'ShieldAlert', icon: ShieldAlert, label: 'SecOps' },
];

const PRESET_COLORS = [
  '#00f0ff', // Electric Cyan
  '#a855f7', // Cyber Violet
  '#ff0055', // Neon Crimson
  '#10b981', // Emerald
  '#f59e0b', // Amber
];

const QUICK_CATEGORIES = [
  'Engineering',
  'Architecture',
  'Product',
  'Design',
  'Research',
  'Operations',
];

interface DraftTask {
  id: string;
  title: string;
  priority: Priority;
  description: string;
}

interface DraftSection {
  id: string;
  name: string;
  tasks: DraftTask[];
}

export function SystemBuilderModal() {
  const { isSystemBuilderOpen, setIsSystemBuilderOpen, createCustomTemplate } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Cpu');
  const [category, setCategory] = useState('Engineering');
  const [color, setColor] = useState('#00f0ff');
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  // Interactive Sections and Tasks Builder
  const [sections, setSections] = useState<DraftSection[]>([
    {
      id: 'sec_1',
      name: 'Backlog',
      tasks: [
        { id: 't_1', title: 'Setup repository & CI/CD pipeline', priority: 'p2', description: 'Configure automated test runner' },
      ],
    },
    {
      id: 'sec_2',
      name: 'Active Development',
      tasks: [
        { id: 't_2', title: 'Core implementation milestone', priority: 'p1', description: 'Build foundational modules' },
      ],
    },
    {
      id: 'sec_3',
      name: 'Verification & Review',
      tasks: [
        { id: 't_3', title: 'End-to-end integration tests', priority: 'p2', description: 'Stress-test all endpoints' },
      ],
    },
    {
      id: 'sec_4',
      name: 'Shipped',
      tasks: [],
    },
  ]);

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isSystemBuilderOpen) return null;

  // Add a new section
  const handleAddSection = () => {
    const newId = `sec_${Date.now()}`;
    setSections(prev => [
      ...prev,
      {
        id: newId,
        name: `Stage ${prev.length + 1}`,
        tasks: [],
      },
    ]);
  };

  // Remove section
  const handleRemoveSection = (sectionId: string) => {
    if (sections.length <= 1) {
      setErrorMsg('A system requires at least one stage column.');
      return;
    }
    setErrorMsg(null);
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  // Update section name
  const handleSectionNameChange = (sectionId: string, newName: string) => {
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, name: newName } : s))
    );
  };

  // Add task to section
  const handleAddTask = (sectionId: string) => {
    const newTaskId = `task_${Date.now()}`;
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tasks: [
            ...s.tasks,
            {
              id: newTaskId,
              title: '',
              priority: 'p3',
              description: '',
            },
          ],
        };
      })
    );
  };

  // Remove task from section
  const handleRemoveTask = (sectionId: string, taskId: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tasks: s.tasks.filter(t => t.id !== taskId),
        };
      })
    );
  };

  // Update task title
  const handleTaskTitleChange = (sectionId: string, taskId: string, newTitle: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tasks: s.tasks.map(t => (t.id === taskId ? { ...t, title: newTitle } : t)),
        };
      })
    );
  };

  // Update task priority
  const handleTaskPriorityChange = (sectionId: string, taskId: string, newPriority: Priority) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tasks: s.tasks.map(t => (t.id === taskId ? { ...t, priority: newPriority } : t)),
        };
      })
    );
  };

  // Total tasks calculation
  const totalTasks = sections.reduce((acc, s) => acc + s.tasks.length, 0);

  // Submit and save system
  const handleSaveSystem = async () => {
    if (!name.trim()) {
      setErrorMsg('Please specify a System Name.');
      return;
    }

    if (sections.length === 0) {
      setErrorMsg('A system must include at least one stage.');
      return;
    }

    setErrorMsg(null);
    setIsSaving(true);

    const formattedSections: SystemStructureSection[] = sections.map(s => ({
      name: s.name.trim() || 'Untitled Stage',
      tasks: s.tasks
        .filter(t => t.title.trim().length > 0)
        .map(t => ({
          title: t.title.trim(),
          description: t.description.trim() || undefined,
          priority: t.priority,
          labels: [category.trim()],
        })),
    }));

    try {
      await createCustomTemplate({
        name: name.trim(),
        description: description.trim() || `${formattedSections.length} stages multi-column pipeline`,
        icon,
        category: category.trim() || 'General',
        color,
        system_structure: {
          sections: formattedSections,
          view_mode: viewMode,
          color,
        },
      });

      setIsSystemBuilderOpen(false);
    } catch (err) {
      setErrorMsg('Failed to save system template.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsSystemBuilderOpen(false)} 
      />

      <div className="relative w-full max-w-5xl bg-[#09090b] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col max-h-[90vh] overflow-hidden z-10">
        {/* Glow Accent Strip */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${color}, #a855f7, #ff0055)`
          }}
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-[#0d0e12]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
                color: color,
                boxShadow: `0 0 16px ${color}30`
              }}
            >
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  SYSTEM ARCHITECT v1.0
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  // BLUEPRINT COMPILER
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 tracking-wide mt-0.5">
                Architect New System Blueprint
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all border ${
                showJsonPreview 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-zinc-200'
              }`}
              title="Toggle JSON Blueprint Inspector"
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">JSON Schema</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSystemBuilderOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-mono flex items-center justify-between">
              <span>[ERR] {errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg(null)} className="hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Configuration Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <span>System Name</span>
                <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Microservices Sprint Engine"
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-medium"
              />
            </div>

            {/* Custom Category Tag */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Category Tag
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Engineering, Architecture, Product"
                className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {QUICK_CATEGORIES.map(qc => (
                  <button
                    key={qc}
                    type="button"
                    onClick={() => setCategory(qc)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-all ${
                      category.toLowerCase() === qc.toLowerCase()
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-white/5'
                    }`}
                  >
                    #{qc}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                System Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_ICONS.map(item => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                          : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border border-white/5 hover:bg-white/10'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[9px] font-mono truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent & Default View Mode */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        color === c ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: c, 
                        boxShadow: color === c ? `0 0 14px ${c}` : undefined 
                      }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Default View Mode
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { mode: 'board', label: 'Kanban Board', icon: LayoutGrid },
                    { mode: 'list', label: 'List View', icon: List },
                    { mode: 'calendar', label: 'Calendar', icon: Calendar },
                  ].map(v => {
                    const ViewIcon = v.icon;
                    return (
                      <button
                        key={v.mode}
                        type="button"
                        onClick={() => setViewMode(v.mode as ViewMode)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
                          viewMode === v.mode
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold'
                            : 'bg-white/5 text-zinc-400 border-white/5 hover:text-zinc-200'
                        }`}
                      >
                        <ViewIcon className="w-3.5 h-3.5" />
                        <span>{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              System Description & Objectives
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. End-to-end framework for iterative development and high-cadence delivery"
              className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
          </div>

          {/* ================================================================= */}
          {/* STAGES & DEFAULT TASKS CANVAS                                     */}
          {/* ================================================================= */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">
                  Pipeline Stages ({sections.length})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  {totalTasks} Default Tasks
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)] active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Stage Column</span>
              </button>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {sections.map((section, sIdx) => (
                <div
                  key={section.id}
                  className="flex flex-col rounded-xl bg-black/50 border border-white/10 hover:border-white/20 p-3 space-y-3 transition-colors"
                >
                  {/* Section Title & Delete */}
                  <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-cyan-400 border border-white/10">
                        {String(sIdx + 1).padStart(2, '0')}
                      </span>
                      <input
                        type="text"
                        value={section.name}
                        onChange={e => handleSectionNameChange(section.id, e.target.value)}
                        placeholder="Stage name..."
                        className="w-full bg-transparent text-xs font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none focus:text-cyan-300 truncate"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
                      className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Remove Stage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tasks List inside Section */}
                  <div className="space-y-2 flex-1 min-h-[90px]">
                    {section.tasks.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-3 rounded-lg border border-dashed border-white/5 text-[11px] text-zinc-600 font-mono text-center">
                        No default tasks
                      </div>
                    ) : (
                      section.tasks.map(task => (
                        <div
                          key={task.id}
                          className="p-2.5 rounded-lg bg-[#12131a] border border-white/5 space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <input
                              type="text"
                              value={task.title}
                              onChange={e => handleTaskTitleChange(section.id, task.id, e.target.value)}
                              placeholder="Task title..."
                              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(section.id, task.id)}
                              className="p-0.5 text-zinc-600 hover:text-red-400 transition-colors opacity-60 group-hover:opacity-100"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Priority selector pill */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {(['p1', 'p2', 'p3', 'p4'] as const).map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => handleTaskPriorityChange(section.id, task.id, p)}
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-all ${
                                    task.priority === p
                                      ? p === 'p1'
                                        ? 'bg-[#ff0055]/30 text-[#ff0055] font-bold border border-[#ff0055]/50'
                                        : p === 'p2'
                                        ? 'bg-amber-500/30 text-amber-400 font-bold border border-amber-500/50'
                                        : p === 'p3'
                                        ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/50'
                                        : 'bg-zinc-700 text-zinc-200 font-bold border border-zinc-500'
                                      : 'text-zinc-600 hover:text-zinc-400'
                                  }`}
                                >
                                  {p.toUpperCase()}
                                </button>
                              ))}
                            </div>
                            <span className="text-[9px] font-mono text-zinc-600">Preset</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Task Button */}
                  <button
                    type="button"
                    onClick={() => handleAddTask(section.id)}
                    className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors border border-white/5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Schema Inspector Overlay */}
          {showJsonPreview && (
            <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/30 space-y-2 animate-in fade-in duration-100">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>// COMPILED SYSTEM_STRUCTURE JSONB PAYLOAD</span>
                <span className="text-zinc-500">{sections.length} stages, {totalTasks} tasks</span>
              </div>
              <pre className="text-[11px] font-mono text-zinc-300 bg-[#0d0e12] p-3 rounded-lg overflow-x-auto max-h-48 border border-white/5">
                {JSON.stringify(
                  {
                    name,
                    category,
                    icon,
                    color,
                    system_structure: {
                      view_mode: viewMode,
                      color,
                      sections: sections.map(s => ({
                        name: s.name,
                        tasks: s.tasks.map(t => ({
                          title: t.title,
                          priority: t.priority,
                          labels: [category],
                        })),
                      })),
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#0d0e12] flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-500">
            {sections.length} Stages · {totalTasks} Default Tasks Defined
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSystemBuilderOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveSystem}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold font-mono tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_28px_rgba(0,240,255,0.7)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-zinc-950" />
              <span>{isSaving ? 'Compiling Blueprint...' : 'Save System to Hub'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
