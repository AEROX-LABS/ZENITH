'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  Calendar, 
  CalendarDays, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  Flame, 
  Trash2, 
  LogOut, 
  LogIn, 
  Folder,
  Command,
  ChevronRight,
  HelpCircle,
  Layers,
  User,
  Users,
  Workflow,
  Tag,
  Activity,
  ChevronDown,
  Check,
  Settings,
  Brain
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/parser';
import { ToastContainer } from '@/components/Toast';
import { CreateWorkspaceModal } from '@/components/CreateWorkspaceModal';
import { GlobalRadarButton } from '@/components/GlobalRadarButton';
import { GlobalNetworkPanel } from '@/components/GlobalNetworkPanel';
import { DynamicEntityModal, MagneticButton } from '@/components/DynamicEntityModal';
import { OperatorProfileModal } from '@/components/OperatorProfileModal';
import { PurgeWorkspaceModal } from '@/components/PurgeWorkspaceModal';
import { PlasmaShockwaveHost } from '@/components/PlasmaShockwave';
import { NeuralCanvasModal } from '@/components/NeuralCanvasModal';
import { useAudio } from '@/hooks/useAudio';

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    activeView,
    setActiveView,
    projects,
    tasks,
    karma,
    user,
    setUser,
    signOut,
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setIsCreateWorkspaceOpen,
    openAddTaskModal,
    setIsTemplateModalOpen,
    setIsKarmaModalOpen,
    setIsAuthModalOpen,
    openTutorial,
    createProject,
    deleteProject,
    labels,
    deleteLabel,
    openEntityModal,
    filterLabel,
    setFilterLabel,
    openOperatorProfile,
    openPurgeWorkspaceModal,
    shockwaves,
    removeShockwave,
    openNeuralCanvas,
  } = useApp();

  const { playTick, playClack } = useAudio();

  const [isActiveWorkspaceMenuOpen, setIsActiveWorkspaceMenuOpen] = useState(false);
  const [workspaceSettingsOpenId, setWorkspaceSettingsOpenId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#00f0ff');

  const todayStr = formatDate(new Date());

  // Task Counts for Sidebar Badges
  const todayCount = tasks.filter(t => !t.parent_id && !t.completed && t.due_date === todayStr).length;
  const inboxCount = tasks.filter(t => !t.parent_id && !t.completed && t.project_id === null).length;
  const upcomingCount = tasks.filter(t => !t.parent_id && !t.completed && t.due_date !== null && t.due_date >= todayStr).length;

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createProject({
      name: newProjectName.trim(),
      color: newProjectColor,
      view_mode: 'list',
      is_team: false,
    });
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 select-none">
      {/* Real-time Global Toast Notifications */}
      <ToastContainer />

      {/* ========================================================================= */}
      {/* DESKTOP OBSIDIAN SIDEBAR (md+)                                            */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-[#0d0e12] border-r border-white/5 flex-shrink-0 z-30">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-black border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm text-zinc-100 flex items-center gap-1 font-mono">
                AEROX<span className="text-cyan-400">·</span>ZENITH
              </span>
              <span className="block text-[10px] text-zinc-500 font-mono">v1.0 Obsidian Core</span>
            </div>
          </div>
        </div>

        {/* Active Workspace Selector & Settings Dropdown Trigger */}
        <div className="px-3 pt-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playClack();
                setIsActiveWorkspaceMenuOpen(prev => !prev);
              }}
              onMouseEnter={() => playTick()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 hover:border-cyan-500/40 text-xs font-mono transition-all group cursor-pointer"
              title="Active Workspace Settings & Switcher"
              aria-expanded={isActiveWorkspaceMenuOpen}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: activeWorkspace?.color || '#00F5D4',
                    boxShadow: `0 0 8px ${activeWorkspace?.color || '#00F5D4'}80`
                  }}
                />
                <span className="truncate font-semibold text-zinc-200 group-hover:text-white">
                  {activeWorkspace?.name || 'Personal Space'}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded font-mono text-zinc-500 bg-white/5 uppercase">
                  {activeWorkspace?.type || 'personal'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-transform ${isActiveWorkspaceMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {/* Active Workspace Dropdown Menu Popover */}
            {isActiveWorkspaceMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsActiveWorkspaceMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl bg-[#000101]/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_15px_rgba(0,224,255,0.1)] backdrop-blur-2xl p-2.5 space-y-2 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Workspace</span>
                    <span className="text-[9px] text-cyan-400 font-mono">ONLINE</span>
                  </div>

                  {/* Switch Workspace List */}
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          playClack();
                          setActiveView(ws.id);
                          setIsActiveWorkspaceMenuOpen(false);
                          if (typeof window !== 'undefined') {
                            window.history.pushState(null, '', `/workspace/${ws.id}`);
                          }
                        }}
                        onMouseEnter={() => playTick()}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          ws.id === activeWorkspace?.id
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
                        {ws.id === activeWorkspace?.id && <Check className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* Create Workspace Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsActiveWorkspaceMenuOpen(false);
                      setIsCreateWorkspaceOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors text-xs cursor-pointer border border-transparent hover:border-cyan-500/30"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Create Workspace...</span>
                  </button>

                  {/* Bottom Aligned Destructive Action Button */}
                  {activeWorkspace && (
                    <div className="pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          playClack();
                          setIsActiveWorkspaceMenuOpen(false);
                          openPurgeWorkspaceModal(activeWorkspace);
                        }}
                        onMouseEnter={() => playTick()}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#FF006E]/30 hover:border-[#FF006E] hover:bg-[#FF006E]/10 text-[#FF006E] text-xs font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,110,0.15)] hover:shadow-[0_0_20px_rgba(255,0,110,0.35)] active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>[ PURGE WORKSPACE ]</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tactical Action Triggers: Quick Add & Neural Canvas */}
        <div className="p-3 space-y-2">
          <button
            type="button"
            onClick={() => openAddTaskModal()}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-zinc-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-cyan-400 text-zinc-950 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Quick Add</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/5 flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </button>

          <button
            type="button"
            onClick={() => openNeuralCanvas()}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#00E0FF]/10 to-pink-950/20 hover:from-cyan-950/60 hover:to-pink-950/40 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400/60 text-xs font-mono font-semibold transition-all group shadow-[0_0_15px_rgba(0,224,255,0.1)]"
            title="Open Neural Canvas Tactical Quick-Note System"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#00E0FF] to-[#FF006E] text-zinc-950 flex items-center justify-center shadow-[0_0_10px_rgba(0,224,255,0.4)]">
                <Brain className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="tracking-wider">[+] SCRATCHPAD</span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-mono px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />J
            </span>
          </button>
        </div>

        {/* Navigation Views Tree */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Primary Filters */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveView('today')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'today'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Today</span>
              </div>
              {todayCount > 0 && (
                <span suppressHydrationWarning className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                  {todayCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('inbox')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'inbox'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-zinc-400" />
                <span>Inbox</span>
              </div>
              {inboxCount > 0 && (
                <span suppressHydrationWarning className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                  {inboxCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('upcoming')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'upcoming'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4 text-violet-400" />
                <span>Upcoming</span>
              </div>
              {upcomingCount > 0 && (
                <span suppressHydrationWarning className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                  {upcomingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('completed')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'completed'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Completed Archive</span>
              </div>
            </button>
          </div>

          {/* Workspaces / Contexts Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Workspaces ({workspaces.length})</span>
              </span>
              <MagneticButton
                distance={5}
                onClick={() => setIsCreateWorkspaceOpen(true)}
                className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
                style={{ borderColor: 'rgba(0,224,255,0.2)' }}
              >
                <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </MagneticButton>
            </div>

            <div className="space-y-1">
              {workspaces.map(ws => {
                const wsTaskCount = tasks.filter(t => !t.parent_id && !t.completed && t.workspace_id === ws.id).length;
                const isActive = activeView === ws.id;

                return (
                  <div key={ws.id} className="group/ws relative flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        playClack();
                        setActiveView(ws.id);
                        if (typeof window !== 'undefined') {
                          window.history.pushState(null, '', `/workspace/${ws.id}`);
                        }
                      }}
                      onMouseEnter={() => playTick()}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#181924] text-zinc-100 border border-white/15 font-semibold shadow-[0_0_12px_rgba(0,0,0,0.5)]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-6">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover/ws:scale-125"
                          style={{ 
                            backgroundColor: ws.color, 
                            boxShadow: `0 0 8px ${ws.color}80` 
                          }}
                        />
                        <span className="truncate">{ws.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono text-zinc-500 bg-white/5 flex items-center gap-0.5">
                          {ws.type === 'group' ? (
                            <Users className="w-2.5 h-2.5 text-purple-400" />
                          ) : (
                            <User className="w-2.5 h-2.5 text-cyan-400" />
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" suppressHydrationWarning>
                        {wsTaskCount > 0 && (
                          <span suppressHydrationWarning className="text-[10px] font-mono text-zinc-500 group-hover/ws:hidden">
                            {wsTaskCount}
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="absolute right-2 opacity-0 group-hover/ws:opacity-100 flex items-center gap-1 transition-opacity">
                      {/* Workspace Settings Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playClack();
                            setWorkspaceSettingsOpenId(prev => prev === ws.id ? null : ws.id);
                          }}
                          onMouseEnter={() => playTick()}
                          title={`Workspace Settings: ${ws.name}`}
                          className={`p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 border transition-all cursor-pointer ${
                            workspaceSettingsOpenId === ws.id ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' : 'border-transparent'
                          }`}
                        >
                          <Settings className="w-3 h-3" />
                        </button>

                        {/* Workspace Settings Menu Popover */}
                        {workspaceSettingsOpenId === ws.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40 cursor-default"
                              onClick={(e) => {
                                e.stopPropagation();
                                setWorkspaceSettingsOpenId(null);
                              }}
                            />
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[#000101]/95 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.9),0_0_15px_rgba(0,224,255,0.1)] backdrop-blur-2xl p-2.5 space-y-2 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
                            >
                              <div className="px-2 py-1 border-b border-white/10 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[130px]">
                                  {ws.name}
                                </span>
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 border border-white/5">
                                  {ws.type}
                                </span>
                              </div>

                              <div className="px-2 py-1 text-[10px] text-zinc-400 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-500">COLOR ACCENT</span>
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ws.color }} />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-500">TASKS</span>
                                  <span>{wsTaskCount}</span>
                                </div>
                              </div>

                              {/* Bottom Aligned Destructive Action Button */}
                              <div className="pt-2 border-t border-white/10">
                                <button
                                  type="button"
                                  onClick={() => {
                                    playClack();
                                    setWorkspaceSettingsOpenId(null);
                                    openPurgeWorkspaceModal(ws);
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
                      </div>

                      {/* Purge Workspace Quick Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClack();
                          openPurgeWorkspaceModal(ws);
                        }}
                        onMouseEnter={() => playTick()}
                        title={`Purge Workspace "${ws.name}"`}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-[#FF006E] hover:bg-[#FF006E]/15 border border-transparent hover:border-[#FF006E]/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Tree Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Folder className="w-3 h-3 text-cyan-400" />
                <span>Projects ({projects.length})</span>
              </span>
              <MagneticButton
                distance={5}
                onClick={() => openEntityModal('project')}
                className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all group"
                style={{ borderColor: 'rgba(0,240,255,0.3)' }}
              >
                <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </MagneticButton>
            </div>

            {/* Inline Project Creator */}
            {isCreatingProject && (
              <form onSubmit={handleCreateProjectSubmit} className="mb-2 p-2.5 rounded-xl bg-black/50 border border-cyan-500/30 space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
                <div className="flex items-center justify-between gap-1">
                  {/* Color dots */}
                  <div className="flex items-center gap-1.5">
                    {['#00f0ff', '#ff0055', '#a855f7', '#f59e0b', '#10b981'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewProjectColor(c)}
                        className={`w-3.5 h-3.5 rounded-full transition-transform ${
                          newProjectColor === c ? 'scale-125 ring-2 ring-white/50' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProject(false)}
                      className="px-2 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-0.5 bg-cyan-500 text-zinc-950 font-bold rounded text-[10px]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Project List */}
            <div className="space-y-1">
              {projects.map(project => {
                const projectTaskCount = tasks.filter(t => !t.parent_id && !t.completed && t.project_id === project.id).length;
                const isActive = activeView === project.id;

                return (
                  <div
                    key={project.id}
                    onClick={() => setActiveView(project.id)}
                    className={`w-full group/proj flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#181924] text-zinc-100 border border-white/10 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color, boxShadow: `0 0 8px ${project.color}60` }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" suppressHydrationWarning>
                      {projectTaskCount > 0 && (
                        <span suppressHydrationWarning className="text-[10px] font-mono text-zinc-500 group-hover/proj:opacity-0 transition-opacity">
                          {projectTaskCount}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete project "${project.name}" and all associated sections?`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="p-1 text-zinc-600 hover:text-red-400 rounded opacity-0 group-hover/proj:opacity-100 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Labels Protocol Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#FF006E]" />
                <span>LABELS ({labels.length})</span>
              </span>
              <MagneticButton
                distance={5}
                onClick={() => openEntityModal('label')}
                className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all group"
                style={{ borderColor: 'rgba(0,240,255,0.3)' }}
              >
                <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </MagneticButton>
            </div>

            {/* Labels List with Filter & Tag Counters */}
            <div className="space-y-1">
              {labels.length === 0 ? (
                <div
                  onClick={() => openEntityModal('label')}
                  className="px-3 py-2 text-[11px] text-zinc-500 font-mono italic border border-dashed border-white/5 rounded-xl text-center cursor-pointer hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
                >
                  + DYNAMIC_LABEL // INGEST
                </div>
              ) : (
                labels.map(lbl => {
                  const isFilterActive = filterLabel === lbl.name;
                  const matchingTaskCount = tasks.filter(t => !t.completed && t.labels?.includes(lbl.name)).length;

                  return (
                    <div
                      key={lbl.id}
                      onClick={() => setFilterLabel(isFilterActive ? 'all' : lbl.name)}
                      className={`w-full group/lbl flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all font-mono ${
                        isFilterActive
                          ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_12px_rgba(255,0,110,0.25)]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover/lbl:scale-125"
                          style={{
                            backgroundColor: lbl.color,
                            boxShadow: `0 0 8px ${lbl.color}`,
                          }}
                        />
                        <span className="truncate tracking-wider font-semibold">#{lbl.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {matchingTaskCount > 0 && (
                          <span className="text-[10px] text-zinc-500 group-hover/lbl:opacity-0 transition-opacity">
                            {matchingTaskCount}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove label "${lbl.name}" from kernel?`)) {
                              deleteLabel(lbl.id);
                            }
                          }}
                          className="p-1 text-zinc-600 hover:text-red-400 rounded opacity-0 group-hover/lbl:opacity-100 transition-opacity"
                          title="Delete label"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Custom System Hub Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-cyan-400/90 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group/hub shadow-[0_0_12px_rgba(0,240,255,0.05)]"
            >
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400 group-hover/hub:rotate-12 transition-transform" />
                <span className="font-semibold">System Hub...</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                Architect
              </span>
            </button>
          </div>
        </div>

        {/* Telemetry Velocity Banner (Purged Gamification) */}
        <div className="p-3 border-t border-white/5 bg-[#09090b]">
          <div
            onClick={() => openOperatorProfile()}
            className="p-3 rounded-xl bg-black/40 border border-[#00F5D4]/20 hover:border-[#00F5D4]/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00F5D4]">
                <Flame className="w-4 h-4 fill-[#00F5D4] text-[#00F5D4] animate-pulse" />
                <span>Active Streak: {karma.streak_days} Days</span>
              </div>
              <span className="text-[10px] font-mono text-[#00E0FF] font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>TELEMETRY</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Consistency Matrix</span>
              <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-[#00F5D4] transition-colors" />
            </div>
          </div>
        </div>

        {/* Feature Tour / Onboarding Guide Button */}
        <div className="p-3 bg-[#09090b] border-t border-white/5">
          <button
            type="button"
            onClick={openTutorial}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-semibold transition-all group shadow-[0_0_12px_rgba(0,240,255,0.06)] hover:shadow-[0_0_16px_rgba(0,240,255,0.18)]"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Tour & Command Guide</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              7 Steps
            </span>
          </button>
        </div>

        {/* User Account / Profile & Analytics Bottom-Left Trigger */}
        <div className="p-3 border-t border-white/5 bg-[#09090b] flex items-center justify-between">
          <div
            onClick={() => {
              playClack();
              openOperatorProfile();
            }}
            onMouseEnter={() => playTick()}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity group/avatar"
            title="Profile & Analytics"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00F5D4]/50 flex-shrink-0 bg-cyan-950 flex items-center justify-center text-xs font-bold text-cyan-300 shadow-[0_0_10px_rgba(0,245,212,0.3)] group-hover/avatar:scale-105 transition-transform">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0] : 'U'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-100 truncate group-hover/avatar:text-[#00F5D4] transition-colors">{user?.name || 'Workspace Member'}</p>
              <p className="text-[10px] text-zinc-500 truncate font-mono">Profile & Analytics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => user ? signOut() : setIsAuthModalOpen(true)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            title={user ? 'Sign out' : 'Sign in'}
          >
            {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEW AREA                                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        {/* MOBILE TOP BAR (< md) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d0e12] border-b border-white/5 flex-shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-400 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
              Z
            </div>
            <span className="font-extrabold text-xs tracking-wider text-zinc-100 font-mono">
              AEROX-ZENITH
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Operator Telemetry Streak Pill */}
            <button
              type="button"
              onClick={() => openOperatorProfile()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-[0_0_10px_rgba(0,245,212,0.15)] transition-all cursor-pointer"
              title="Open Operator Telemetry Profile"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#00F5D4]" />
              <span>STREAK: {karma.streak_days}D</span>
            </button>

            {/* Neural Canvas Top HUD Trigger */}
            <button
              type="button"
              onClick={() => openNeuralCanvas()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 text-xs font-mono font-semibold shadow-[0_0_10px_rgba(0,224,255,0.15)] transition-all cursor-pointer"
              title="Open Neural Canvas Tactical Quick-Note System"
            >
              <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">[ NEURAL CANVAS ]</span>
            </button>

            {/* Custom System Hub Trigger */}
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300"
              title="Custom System Hub"
            >
              <Workflow className="w-4 h-4" />
            </button>

            {/* Feature Tour Guide Trigger */}
            <button
              type="button"
              onClick={openTutorial}
              className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-colors"
              title="Tour & Command Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Auth avatar */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-6 h-6 rounded-full overflow-hidden border border-cyan-500/40 bg-cyan-950 text-[10px] text-cyan-300 font-bold flex items-center justify-center"
            >
              {user?.name ? user.name[0] : 'U'}
            </button>
          </div>
        </header>

        {/* Children: TaskView & Drawer */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* ========================================================================= */}
        {/* MOBILE PORTRAIT FLOATING NEON '+' ACTION BUTTON (bottom-20 right-5)       */}
        {/* ========================================================================= */}
        <button
          type="button"
          onClick={() => openAddTaskModal()}
          className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-[#00f0ff] hover:bg-cyan-300 text-zinc-950 flex items-center justify-center shadow-[0_0_24px_rgba(0,240,255,0.7)] active:scale-95 transition-all"
          aria-label="Quick Add Task"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* ========================================================================= */}
        {/* MOBILE PORTRAIT FIXED BOTTOM DOCK NAVIGATION (< md)                       */}
        {/* ========================================================================= */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-40">
          <button
            type="button"
            onClick={() => setActiveView('today')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeView === 'today' ? 'text-cyan-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Today</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('inbox')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeView === 'inbox' ? 'text-cyan-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span className="text-[10px]">Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('upcoming')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeView === 'upcoming' ? 'text-cyan-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px]">Upcoming</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (projects.length > 0) {
                setActiveView(projects[0].id);
              }
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeView.startsWith('proj_') ? 'text-cyan-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <Folder className="w-5 h-5" />
            <span className="text-[10px]">Projects</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClack();
              openOperatorProfile();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-zinc-500 hover:text-[#00F5D4] transition-colors cursor-pointer"
          >
            <Activity className="w-5 h-5 text-[#00F5D4]" />
            <span className="text-[10px]">Analytics</span>
          </button>
        </nav>
      </div>

      {/* Dynamic Create Workspace Dialog */}
      <CreateWorkspaceModal />

      {/* Global Radar Floating Action Button (Continuous Sonar Rings & Scan Network Tooltip) */}
      <GlobalRadarButton />

      {/* Global Network Directory & Members Panel */}
      <GlobalNetworkPanel />

      {/* Dynamic Entity Creation Protocol Modal */}
      <DynamicEntityModal />

      {/* Profile & Analytics Modal */}
      <OperatorProfileModal />

      {/* Purge Workspace Anti-Accident Confirmation Modal */}
      <PurgeWorkspaceModal />

      {/* Phosphor Emerald Plasma Shockwave Host (Mounted at click coordinates on completion) */}
      <PlasmaShockwaveHost shockwaves={shockwaves} onComplete={removeShockwave} />

      {/* Neural Canvas (Tactical Quick-Note System) */}
      <NeuralCanvasModal />
    </div>
  );
}
