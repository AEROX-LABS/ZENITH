'use client';

import React, { useState, useMemo } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  List, 
  Kanban, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Sparkles, 
  Layers, 
  FolderPlus,
  User,
  Users,
  ChevronDown,
  Trash2,
  Check
} from 'lucide-react';
import { Priority, UserProfile } from '@/types';
import { useApp } from '@/context/AppContext';
import { TaskItem } from './TaskItem';
import { KanbanBoard } from './KanbanBoard';
import { CalendarView } from './CalendarView';
import { formatDate } from '@/lib/parser';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';

/**
 * 3-Phase Plasma Glitch Disintegration Exit Animation:
 * Phase 1 (Ignition): Background flashes rgba(0, 245, 212, 0.2) and scales to 1.02.
 * Phase 2 (Glitch): Brief CSS filter drop-shadow(2px 0 red) drop-shadow(-2px 0 cyan) for digital tear.
 * Phase 3 (Disintegration): Card smoothly collapses to opacity 0, height 0, padding 0, margin 0.
 */
const TASK_DISINTEGRATION_EXIT: TargetAndTransition = {
  scale: [1, 1.02, 1.02, 0.98, 0.9],
  backgroundColor: [
    'rgba(13, 14, 18, 0.8)',
    'rgba(0, 245, 212, 0.2)',
    'rgba(0, 245, 212, 0.2)',
    'rgba(0, 245, 212, 0)',
    'rgba(0, 245, 212, 0)',
  ],
  filter: [
    'drop-shadow(0px 0px 0px transparent)',
    'drop-shadow(2px 0px 0px red) drop-shadow(-2px 0px 0px cyan)',
    'drop-shadow(2px 0px 0px red) drop-shadow(-2px 0px 0px cyan)',
    'drop-shadow(0px 0px 0px transparent)',
    'drop-shadow(0px 0px 0px transparent)',
  ],
  opacity: [1, 1, 0.8, 0.2, 0],
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  marginTop: 0,
  marginBottom: 0,
  overflow: 'hidden',
  transition: {
    duration: 0.42,
    times: [0, 0.2, 0.45, 0.75, 1],
    ease: 'easeInOut',
  },
};
import { useAudio } from '@/hooks/useAudio';

export function TaskView() {
  const {
    tasks,
    sections,
    activeView,
    viewMode,
    setViewMode,
    currentProject,
    currentWorkspace,
    workspaces,
    workspaceMembers,
    operatives,
    user,
    openGlobalRadar,
    profiles,
    openAddTaskModal,
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterLabel,
    setFilterLabel,
    reorderTasks,
    createSection,
    setActiveView,
    activeWorkspace,
    openPurgeWorkspaceModal,
  } = useApp();

  const { playTick, playClack, playThud } = useAudio();

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const todayStr = formatDate(new Date());

  // Real authenticated members of the active workspace (purges fake dummy architects)
  const activeWorkspaceMembers = useMemo(() => {
    if (!currentWorkspace) return [];
    const membersForWs = workspaceMembers.filter(m => m.workspace_id === currentWorkspace.id);
    const memberProfiles: UserProfile[] = [];

    // The current authenticated user is always a member of their workspace
    if (user) {
      memberProfiles.push(user);
    }

    membersForWs.forEach(m => {
      if (m.profile) {
        if (!memberProfiles.some(p => p.id === m.profile!.id)) {
          memberProfiles.push(m.profile);
        }
      } else {
        const found = operatives.find(o => o.id === m.user_id) || profiles.find(p => p.id === m.user_id);
        if (found && !memberProfiles.some(p => p.id === found.id)) {
          memberProfiles.push(found);
        } else if (!memberProfiles.some(p => p.id === m.user_id)) {
          memberProfiles.push({
            id: m.user_id,
            name: `Member ${m.user_id.slice(-4)}`,
            email: 'member@aerox.dev',
            role: m.role || 'Member',
          });
        }
      }
    });

    return memberProfiles;
  }, [currentWorkspace, workspaceMembers, user, operatives, profiles]);

  // Collect all unique labels for filtering
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => t.labels?.forEach(l => set.add(l)));
    return Array.from(set);
  }, [tasks]);

  // Filter tasks based on active view, search, priority, and label
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesLabel = task.labels?.some(l => l.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesLabel) return false;
      }

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      // Label filter
      if (filterLabel !== 'all' && (!task.labels || !task.labels.includes(filterLabel))) {
        return false;
      }

      // View category filter
      if (activeView === 'completed') {
        return Boolean(task.completed);
      }

      // Operational views display active tasks; completed tasks glitch and disintegrate via AnimatePresence
      if (task.completed) {
        return false;
      }

      if (activeView === 'inbox') {
        return task.project_id === null;
      } else if (activeView === 'today') {
        return task.due_date === todayStr || Boolean(task.due_date && task.due_date < todayStr);
      } else if (activeView === 'upcoming') {
        return task.due_date !== null && task.due_date >= todayStr;
      } else if (currentWorkspace) {
        return task.workspace_id === currentWorkspace.id;
      } else {
        // Project ID
        return task.project_id === activeView;
      }
    });
  }, [tasks, activeView, currentWorkspace, searchQuery, filterPriority, filterLabel, todayStr]);

  // Header Title & Subtitle Info
  const viewInfo = useMemo(() => {
    if (activeView === 'inbox') {
      return {
        title: 'Inbox',
        subtitle: 'Capture fleeting thoughts and unprocessed items',
        color: '#00f0ff',
      };
    } else if (activeView === 'today') {
      return {
        title: 'Today',
        subtitle: `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
        color: '#00f0ff',
      };
    } else if (activeView === 'upcoming') {
      return {
        title: 'Upcoming',
        subtitle: 'Milestones and schedule across upcoming cycles',
        color: '#a855f7',
      };
    } else if (activeView === 'completed') {
      return {
        title: 'Completed Archive',
        subtitle: 'Verified delivered tasks and historical accomplishments',
        color: '#10b981',
      };
    } else if (currentWorkspace) {
      return {
        title: currentWorkspace.name,
        subtitle: currentWorkspace.type === 'group' 
          ? 'Group Workspace · Team collaboration, member assignees, and shared deliverables' 
          : 'Personal Workspace · Solo focus space and private task streams',
        color: currentWorkspace.color,
      };
    } else if (currentProject) {
      return {
        title: currentProject.name,
        subtitle: currentProject.is_team ? 'Team Shared Workspace' : 'Personal Workspace',
        color: currentProject.color,
      };
    }
    return {
      title: 'Workspace',
      subtitle: 'Zenith task management engine',
      color: '#00f0ff',
    };
  }, [activeView, currentWorkspace, currentProject]);

  // Statistics for the current view
  const stats = useMemo(() => {
    const total = filteredTasks.filter(t => !t.parent_id).length;
    const completed = filteredTasks.filter(t => !t.parent_id && t.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [filteredTasks]);

  // Handle Drag Reorder in List View
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
    playThud(0.28);
    reorderTasks(source.index, destination.index);
  };

  const handleCreateSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !currentProject) return;
    createSection({
      project_id: currentProject.id,
      name: newSectionName.trim(),
    });
    setNewSectionName('');
    setIsAddingSection(false);
  };

  // Top level tasks only (parent_id === null)
  const topLevelTasks = useMemo(() => {
    return filteredTasks.filter(t => !t.parent_id);
  }, [filteredTasks]);

  // Current project's sections
  const projectSections = useMemo(() => {
    if (!currentProject) return [];
    return sections.filter(s => s.project_id === currentProject.id).sort((a, b) => a.order - b.order);
  }, [currentProject, sections]);

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: viewInfo.color,
                boxShadow: `0 0 12px ${viewInfo.color}` 
              }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {viewInfo.title}
            </h1>            {/* Active Workspace Settings / Dropdown Menu Trigger */}
            {(currentWorkspace || activeWorkspace) && (
              <div className="relative">
                {(() => {
                  const targetWs = currentWorkspace || activeWorkspace!;
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          playClack();
                          setIsWorkspaceMenuOpen(prev => !prev);
                        }}
                        onMouseEnter={() => playTick()}
                        className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
                          targetWs.type === 'group'
                            ? 'bg-purple-950/50 border-purple-500/40 text-purple-300 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        }`}
                        title="Active Workspace Settings & Switcher"
                        aria-expanded={isWorkspaceMenuOpen}
                      >
                        {targetWs.type === 'group' ? (
                          <Users className="w-3 h-3 text-purple-400" />
                        ) : (
                          <User className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{targetWs.name}</span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isWorkspaceMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                      </button>

                      {/* Dropdown Menu Popover */}
                      {isWorkspaceMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30 cursor-default"
                            onClick={() => setIsWorkspaceMenuOpen(false)}
                          />
                          <div className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-[#000101]/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_15px_rgba(0,224,255,0.1)] backdrop-blur-2xl p-2.5 space-y-2 z-40 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                            {/* Workspace Header info */}
                            <div className="px-2 py-1.5 border-b border-white/10 flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: targetWs.color, boxShadow: `0 0 8px ${targetWs.color}` }}
                                />
                                <span className="font-bold text-zinc-100 truncate">{targetWs.name}</span>
                              </div>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                                {targetWs.type}
                              </span>
                            </div>

                            {/* Switch Workspace Quick List */}
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              <p className="text-[10px] text-zinc-500 uppercase px-2 py-0.5">Switch Workspace</p>
                              {workspaces.map((ws) => (
                                <button
                                  key={ws.id}
                                  type="button"
                                  onClick={() => {
                                    playClack();
                                    setActiveView(ws.id);
                                    setIsWorkspaceMenuOpen(false);
                                    if (typeof window !== 'undefined') {
                                      window.history.pushState(null, '', `/workspace/${ws.id}`);
                                    }
                                  }}
                                  onMouseEnter={() => playTick()}
                                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                    ws.id === targetWs.id
                                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-medium'
                                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: ws.color }}
                                    />
                                    <span className="truncate">{ws.name}</span>
                                  </div>
                                  {ws.id === targetWs.id && <Check className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                                </button>
                              ))}
                            </div>

                            {/* Bottom Aligned Destructive Action Button */}
                            <div className="pt-2 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  playClack();
                                  setIsWorkspaceMenuOpen(false);
                                  openPurgeWorkspaceModal(targetWs);
                                }}
                                onMouseEnter={() => playTick()}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#FF006E]/30 hover:border-[#FF006E] hover:bg-[#FF006E]/10 text-[#FF006E] text-xs font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,110,0.15)] hover:shadow-[0_0_20px_rgba(255,0,110,0.35)] active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>[ PURGE WORKSPACE ]</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 font-mono border border-white/5">
              {stats.remaining} remaining
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap mt-1">
            <p className="text-xs sm:text-sm text-zinc-400">{viewInfo.subtitle}</p>

            {/* Real Authenticated Workspace Members Collaboration Stack */}
            {currentWorkspace?.type === 'group' && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <span className="text-[11px] text-zinc-500 font-mono">Members:</span>
                <div className="flex items-center -space-x-1.5">
                  {activeWorkspaceMembers.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="w-5 h-5 rounded-full overflow-hidden border border-[#0d0e12] ring-1 ring-cyan-400/40 bg-black flex items-center justify-center text-[9px] font-bold text-cyan-300"
                      title={`${p.name} (${p.role})`}
                    >
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{p.name ? p.name[0] : 'A'}</span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClack();
                    openGlobalRadar();
                  }}
                  onMouseEnter={() => playTick()}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-colors"
                  title="View Directory & Invite Members"
                >
                  <span>
                    {activeWorkspaceMembers.length === 1 ? '1 Member' : `${activeWorkspaceMembers.length} Members`}
                  </span>
                  <Plus className="w-2.5 h-2.5 text-cyan-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Tri-View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tri-View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#0d0e12] border border-white/10 shadow-inner">
            <button
              type="button"
              onMouseEnter={() => playTick()}
              onClick={() => {
                playClack();
                setViewMode('list');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onMouseEnter={() => playTick()}
              onClick={() => {
                playClack();
                setViewMode('board');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              type="button"
              onMouseEnter={() => playTick()}
              onClick={() => {
                playClack();
                setViewMode('calendar');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onMouseEnter={() => playTick()}
            onClick={() => {
              playClack();
              openAddTaskModal({
                workspace_id: currentWorkspace ? currentWorkspace.id : undefined,
                project_id: currentProject ? currentProject.id : null,
                due_date: activeView === 'today' ? todayStr : null
              });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.6)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-mono">NEW TASK</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or tags... (Press / to focus)"
            className="w-full bg-[#0d0e12] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Priority & Label Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className="bg-[#0d0e12] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="p1">P1 — Urgent</option>
            <option value="p2">P2 — High</option>
            <option value="p3">P3 — Medium</option>
            <option value="p4">P4 — Low</option>
          </select>

          {/* Labels filter */}
          {allLabels.length > 0 && (
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="bg-[#0d0e12] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="all">All Labels</option>
              {allLabels.map(lbl => (
                <option key={lbl} value={lbl}>@{lbl}</option>
              ))}
            </select>
          )}

          {/* Add Section Button (in project mode) */}
          {currentProject && (
            <button
              type="button"
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-400 hover:text-cyan-400 border border-white/5 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Section</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Section Creator */}
      {isAddingSection && currentProject && (
        <form onSubmit={handleCreateSectionSubmit} className="mb-4 p-3 rounded-xl bg-[#0d0e12] border border-cyan-500/30 flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="New section name (e.g., Quality Assurance, Sprint 2)..."
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-500 text-zinc-950 font-bold rounded-lg text-xs"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingSection(false);
              setNewSectionName('');
            }}
            className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        </form>
      )}

      {/* VIEW MODES RENDERING */}
      {viewMode === 'board' ? (
        <KanbanBoard tasks={filteredTasks} />
      ) : viewMode === 'calendar' ? (
        <CalendarView tasks={filteredTasks} />
      ) : (
        /* LIST VIEW */
        <div className="space-y-6 pt-2">
          {/* Todoist Zero State for Today View */}
          {activeView === 'today' && stats.remaining === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0d0e12]/60 border border-cyan-500/20 rounded-2xl shadow-xl my-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Zenith Achieved — Zero Tasks Remaining!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                You have completely cleared your scheduled obligations for today. Enjoy the headspace or review upcoming project milestones.
              </p>
              <button
                type="button"
                onClick={() => openAddTaskModal({
                  project_id: currentProject ? currentProject.id : null,
                  due_date: activeView === 'today' ? todayStr : null
                })}
                className="mt-5 px-4 py-2 bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                Plan Next Priority (Cmd + K)
              </button>
            </div>
          )}

          {/* Sectioned or Grouped List View */}
          {projectSections.length > 0 ? (
            /* Render Sections */
            projectSections.map(section => {
              const sectionTasks = topLevelTasks.filter(t => t.section_id === section.id);
              return (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                      {section.name}
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      ({sectionTasks.length})
                    </span>
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={`droppable_sec_${section.id}`}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-2"
                        >
                          <AnimatePresence mode="popLayout" initial={false}>
                            {sectionTasks.map((task, index) => {
                              const subtasks = filteredTasks.filter(t => t.parent_id === task.id);
                              return (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(dragProvided) => (
                                    <motion.div
                                      layout
                                      key={task.id}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={TASK_DISINTEGRATION_EXIT}
                                      transition={{
                                        layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                                      }}
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                    >
                                      <TaskItem
                                        task={task}
                                        subtasks={subtasks}
                                        dragHandleProps={dragProvided.dragHandleProps}
                                      />
                                    </motion.div>
                                  )}
                                </Draggable>
                              );
                            })}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              );
            })
          ) : (
            /* Unsectioned Tasks in List View with Drag and Drop */
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable_main_tasks">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {topLevelTasks.map((task, index) => {
                        const subtasks = filteredTasks.filter(t => t.parent_id === task.id);
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(dragProvided) => (
                              <motion.div
                                layout
                                key={task.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={TASK_DISINTEGRATION_EXIT}
                                transition={{
                                  layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                                }}
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                              >
                                <TaskItem
                                  task={task}
                                  subtasks={subtasks}
                                  dragHandleProps={dragProvided.dragHandleProps}
                                />
                              </motion.div>
                            )}
                          </Draggable>
                        );
                      })}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Empty state if no tasks at all in current filter */}
          {topLevelTasks.length === 0 && activeView !== 'today' && (
            <div className="text-center py-16 px-4 border border-dashed border-white/10 rounded-2xl">
              <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">No tasks found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                No tasks match your current query or view. Tap the quick add bar to draft one.
              </p>
              <button
                type="button"
                onClick={() => openAddTaskModal({
                  workspace_id: currentWorkspace ? currentWorkspace.id : undefined,
                  project_id: currentProject ? currentProject.id : null,
                  due_date: activeView === 'today' ? todayStr : null
                })}
                className="mt-4 px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium transition-colors"
              >
                Add First Task (Cmd + K)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
