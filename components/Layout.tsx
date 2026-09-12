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
  HelpCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/parser';
import { ToastContainer } from '@/components/Toast';

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    activeView,
    setActiveView,
    projects,
    tasks,
    karma,
    user,
    setUser,
    openAddTaskModal,
    setIsTemplateModalOpen,
    setIsKarmaModalOpen,
    setIsAuthModalOpen,
    openTutorial,
    createProject,
    deleteProject,
  } = useApp();

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

        {/* Quick Add Neon Trigger Button */}
        <div className="p-3">
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
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
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

          {/* Project Tree Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Projects ({projects.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="p-1 rounded text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
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

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {projectTaskCount > 0 && (
                        <span className="text-[10px] font-mono text-zinc-500 group-hover/proj:opacity-0 transition-opacity">
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

          {/* Template Browser Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-cyan-400/90 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Launch Template...</span>
            </button>
          </div>
        </div>

        {/* Karma Streak Flame Banner */}
        <div className="p-3 border-t border-white/5 bg-[#09090b]">
          <div
            onClick={() => setIsKarmaModalOpen(true)}
            className="p-3 rounded-xl bg-black/40 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                <span>Streak: {karma.streak_days} Days</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                {karma.points} pts
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Goal: {karma.daily_goal} daily</span>
              <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 transition-colors" />
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

        {/* User Account / Sign Out Footer */}
        <div className="p-3 border-t border-white/5 bg-[#09090b] flex items-center justify-between">
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-500/40 flex-shrink-0 bg-cyan-950 flex items-center justify-center text-xs font-bold text-cyan-300">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0] : 'U'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{user?.name || 'Guest Architect'}</p>
              <p className="text-[10px] text-zinc-500 truncate font-mono">{user?.role || 'Tap to sign in'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => user ? setUser(null) : setIsAuthModalOpen(true)}
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
            {/* Karma Flame Pill */}
            <button
              type="button"
              onClick={() => setIsKarmaModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{karma.streak_days}d</span>
            </button>

            {/* Template Launcher */}
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-cyan-400"
              title="Launch Templates"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
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
            onClick={() => setIsKarmaModalOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-zinc-500 hover:text-amber-400 transition-colors"
          >
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-[10px]">Karma</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
