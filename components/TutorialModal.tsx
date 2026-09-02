'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Command, 
  List, 
  Kanban, 
  Calendar as CalendarIcon, 
  GitBranch, 
  Users, 
  Zap, 
  Flame, 
  Award, 
  Check, 
  Tag, 
  Clock, 
  MessageSquare,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TourStep {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export function TutorialModal() {
  const { isTutorialOpen, completeTutorial } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isTutorialOpen) return null;

  const steps: TourStep[] = [
    // STEP 1: WELCOME TO AEROX-ZENITH
    {
      id: 1,
      title: 'Welcome to AEROX-ZENITH',
      subtitle: 'The Obsidian Cyberpunk Task & Project Operating System',
      badge: 'Command Center',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            AEROX-ZENITH is an uncompromising, high-speed task command center engineered with an obsidian dark theme, vibrant neon telemetry, and zero-latency reactive state synchronization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                100% Private & Local-First
              </span>
              <p className="text-xs text-zinc-400">
                Immediate offline responsiveness with resilient local cache, syncing seamlessly to Supabase in the background.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-xs font-bold text-violet-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Deterministic Non-AI Engine
              </span>
              <p className="text-xs text-zinc-400">
                Zero external AI API dependencies. Pure, blazing fast client-side regex parsing for instant keystroke evaluation.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/20 to-purple-950/20 border border-cyan-500/20 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xs text-zinc-300">
              Take this quick 2-minute tour to master keyboard shortcuts, branching subtasks, Kanban workflows, and the Karma streak engine.
            </p>
          </div>
        </div>
      ),
    },

    // STEP 2: SMART QUICK-ADD BAR (NON-AI)
    {
      id: 2,
      title: 'Smart Quick-Add Bar (Non-AI)',
      subtitle: 'Lightning-fast task creation with natural syntax tokens',
      badge: 'Cmd + K Shortcut',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
      icon: Command,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs border border-white/10">Cmd + K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs border border-white/10">Ctrl + K</kbd> anywhere (or tap the neon <span className="text-cyan-400 font-bold">+</span> button) to summon the instant parsing modal.
          </p>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
              Token Syntax Cheat Sheet:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-cyan-400 font-mono font-bold">#ProjectName</span>
                <span className="text-zinc-400 text-[11px]">Assigns Project</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-violet-400 font-mono font-bold">@LabelName</span>
                <span className="text-zinc-400 text-[11px]">Categorizes Tag</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-[#ff0055] font-mono font-bold">p1, p2, p3, p4</span>
                <span className="text-zinc-400 text-[11px]">Priority Level</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-emerald-400 font-mono font-bold">today / tomorrow</span>
                <span className="text-zinc-400 text-[11px]">Schedules Due Date</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-[#ff0055]/30 flex items-center justify-between text-xs">
              <span className="text-[#ff0055] font-mono font-bold">{`{Friday EOD}`}</span>
              <span className="text-zinc-400 text-[11px]">Assigns Hard External Deadline</span>
            </div>
          </div>

          {/* Live Badge Preview Simulation */}
          <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 block">Real-time Reactive Preview:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono">
                #CoreEngine
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#ff0055]/20 border border-[#ff0055]/50 text-[#ff0055] font-mono font-bold">
                P1 URGENT
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                Today
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#ff0055]/15 border border-[#ff0055]/40 text-[#ff0055] font-mono">
                Deadline: 5:00 PM
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-500/40 text-violet-300">
                @Deploy
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // STEP 3: TRI-VIEW MODES
    {
      id: 3,
      title: 'Tri-View Modes (List, Board, Calendar)',
      subtitle: 'Adapt visual density to your focus mode in 1 click',
      badge: 'Tri-View Switcher',
      badgeColor: 'border-violet-500/40 text-violet-400 bg-violet-950/30',
      icon: List,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Every project and view can be seamlessly rendered in three dedicated perspective engines using the top-right switcher:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <List className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100">1. Hierarchical List View</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Organized by sections with drag-and-drop vertical ordering, expandable subtask trees, and quick priority indicators.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Kanban className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100">2. Kanban Board View</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visual stage cards (To Do, In Progress, Done) with smooth drag-and-drop. Dropping cards into Done automatically awards Karma!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100">3. Calendar View</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Interactive monthly matrix displaying tasks on assigned due dates with quick-add date clicking.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // STEP 4: BRANCHING SUBTASKS & DRAG-AND-DROP
    {
      id: 4,
      title: 'Branching Subtasks & Drag-and-Drop',
      subtitle: 'Break complex objectives into visual dependency trees',
      badge: 'Branching Engine',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
      icon: GitBranch,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Deconstruct large roadmap initiatives into bite-sized actionable steps. Any task can spawn hierarchical child subtasks that link with SVG/CSS neon branching guide lines.
          </p>

          {/* Visual Branching Simulation */}
          <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-2">
            {/* Parent task */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200">
              <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <span className="font-semibold">Launch AEROX Production Core</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                2/3 Completed
              </span>
            </div>

            {/* Child subtask with visual L branch */}
            <div className="relative pl-6 space-y-2">
              <div className="absolute left-2.5 top-0 bottom-4 w-3 border-l-2 border-b-2 border-cyan-400/40 rounded-bl-md" />
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900/60 border border-white/5 text-xs text-zinc-300">
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="line-through text-zinc-500">Configure Supabase realtime postgres_changes</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900/60 border border-white/5 text-xs text-zinc-300">
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-600" />
                <span>Implement SVG branching tree connector lines</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Hover over any task in List View to reveal the left grip handle for instant vertical drag reordering powered by <code className="text-cyan-400">@hello-pangea/dnd</code>.
          </p>
        </div>
      ),
    },

    // STEP 5: COLLABORATION & TASK DRAWER
    {
      id: 5,
      title: 'Collaboration & Task Drawer',
      subtitle: 'Slide-over inspect panel with assignees and discussion logs',
      badge: 'Command Drawer',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Clicking any task card opens the slide-over inspection drawer on desktop (or smooth bottom sheet on mobile portrait) for in-depth coordination:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Team Assignment
              </span>
              <p className="text-xs text-zinc-400">
                Assign tasks to team members with custom avatar badges and role tags.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Contextual Discussion
              </span>
              <p className="text-xs text-zinc-400">
                Log live contextual notes, code reviews, and updates in the built-in comment feed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-[#ff0055] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Hard External Deadlines
              </span>
              <p className="text-xs text-zinc-400">
                Define non-negotiable external delivery target dates with crimson alert flags.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tag & Label Manager
              </span>
              <p className="text-xs text-zinc-400">
                Attach and remove custom tags to filter tasks across large multi-project scopes.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // STEP 6: 1-CLICK TEMPLATE ENGINE
    {
      id: 6,
      title: '1-Click Template Engine',
      subtitle: 'Spin up production project systems in milliseconds',
      badge: '9 Pre-Built Systems',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Never start from a blank canvas. Click <span className="text-cyan-400 font-semibold">Launch Template...</span> in the sidebar or mobile header to instantiate pre-configured workflows complete with sections and tasks:
          </p>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300">Work Systems</span>
                <p className="text-[11px] text-zinc-400">Meeting Agenda & Sync, Hiring CRM, Client Retainers</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800">
                3 Templates
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-300">Tech Systems</span>
                <p className="text-[11px] text-zinc-400">Sprint Backlog, Bug Tracker & QA, Product Roadmap</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800">
                3 Templates
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-300">Personal Systems</span>
                <p className="text-[11px] text-zinc-400">Student Coursework, Weekly Review (GTD), Goal Tracker</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                3 Templates
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // STEP 7: KARMA ENGINE, GOALS & STREAKS
    {
      id: 7,
      title: 'Karma Engine, Goals & Streaks',
      subtitle: 'Gamify your execution and build unbreakable momentum',
      badge: 'Mastery Engine',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
      icon: Flame,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Execution is rewarded. Checking off any task or subtask triggers a particle burst of celebratory confetti and awards <span className="text-cyan-400 font-bold">+10 Karma points</span> to your profile.
          </p>

          <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>Active Streak Engine</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                    🔥 7 Days
                  </span>
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complete at least 1 task daily to protect your streak flame from extinguishing.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-zinc-500 font-mono text-[10px] uppercase block">Rank Tiers</span>
              <span className="font-bold text-zinc-200 mt-0.5 block">Novice → Grandmaster</span>
              <span className="text-[11px] text-zinc-500">Unlocks at point thresholds</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-zinc-500 font-mono text-[10px] uppercase block">Velocity Telemetry</span>
              <span className="font-bold text-cyan-400 mt-0.5 block">7-Day Completion Chart</span>
              <span className="text-[11px] text-zinc-500">Volume tracking across days</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 italic text-center pt-1">
            Ready to experience peak productivity? Launch your command center below.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      {/* Click outside backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={completeTutorial} 
      />

      {/* Main Obsidian Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0c0d12] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Neon Gradient Accent Stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-[#ff0055]" />

        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
                  {current.badge}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  Step {current.id} of {steps.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 mt-1">
                {current.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={completeTutorial}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            title="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-[260px]">
          {current.content}
        </div>

        {/* Footer Navigation & Glowing Pagination Dots */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#09090b] flex items-center justify-between gap-4">
          {/* Skip Button */}
          <button
            type="button"
            onClick={completeTutorial}
            className="text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors px-2 py-1"
          >
            Skip Tour
          </button>

          {/* Glowing Pagination Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                    : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Go to step ${s.id}`}
              />
            ))}
          </div>

          {/* Controls: Back & Next */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 border border-white/5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.6)] active:scale-95"
            >
              <span>{isLastStep ? 'Launch Workspace' : 'Next'}</span>
              {isLastStep ? (
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
