import { ProjectTemplate } from '@/types';

export const TEMPLATES: ProjectTemplate[] = [
  // WORK TEMPLATES
  {
    id: 'meeting-agenda',
    title: 'Meeting Agenda & Sync',
    description: 'Structure team meetings, keep executive discussions focused, and assign actionable next steps.',
    category: 'work',
    icon: 'Users',
    color: '#00f0ff', // Electric cyan
    sections: [
      {
        name: 'Topics & Agenda',
        tasks: [
          {
            title: 'Q3 Objectives & Key Results Review',
            description: 'Align product metrics and quarterly target check-ins with team leads.',
            priority: 'p1',
            labels: ['Strategy', 'Leadership'],
            due_days_offset: 0,
            subtasks: [
              'Gather engineering velocity report',
              'Summarize customer retention delta',
              'Draft executive briefing slide',
            ],
          },
          {
            title: 'Budget Allocation for Cloud Infrastructure',
            description: 'Review AWS and Supabase capacity projections for the upcoming product launch.',
            priority: 'p2',
            labels: ['Finance', 'Ops'],
            due_days_offset: 1,
          },
        ],
      },
      {
        name: 'Discussion & Decisions',
        tasks: [
          {
            title: 'Microservices vs Monolith Architectural Decision',
            description: 'Evaluate latency benchmarks before committing to decoupling core services.',
            priority: 'p2',
            labels: ['Architecture'],
            due_days_offset: 2,
          },
        ],
      },
      {
        name: 'Action Items',
        tasks: [
          {
            title: 'Publish meeting notes to internal knowledge base',
            description: 'Send recorded decisions and owners to Slack announcements channel.',
            priority: 'p3',
            labels: ['Follow-up'],
            due_days_offset: 0,
          },
          {
            title: 'Schedule 1-on-1 sprint refinement sessions',
            priority: 'p4',
            labels: ['Sync'],
            due_days_offset: 3,
          },
        ],
      },
    ],
  },
  {
    id: 'hiring-pipeline',
    title: 'Hiring Pipeline & Talent CRM',
    description: 'Track candidate flow from initial sourcing to technical challenges and final offers.',
    category: 'work',
    icon: 'Briefcase',
    color: '#a855f7', // Violet
    sections: [
      {
        name: 'Sourced & Screening',
        tasks: [
          {
            title: 'Alex Mercer - Principal Frontend Engineer',
            description: '10+ yrs React/Next.js and WebGL experience. Profile sourced via GitHub.',
            priority: 'p1',
            labels: ['Senior', 'Engineering'],
            due_days_offset: 1,
            subtasks: [
              'Screening call with Head of Talent',
              'Review portfolio codebase',
            ],
          },
          {
            title: 'Elena Rostova - Product Designer',
            description: 'Ex-Figma design system maintainer. Expert in dark mode micro-interactions.',
            priority: 'p2',
            labels: ['Design', 'UI/UX'],
            due_days_offset: 2,
          },
        ],
      },
      {
        name: 'Technical Challenge',
        tasks: [
          {
            title: 'Marcus Vance - Systems Architect',
            description: 'Working on real-time event streaming challenge with Postgres and WebSockets.',
            priority: 'p2',
            labels: ['Backend', 'Challenge'],
            due_days_offset: 3,
          },
        ],
      },
      {
        name: 'Final Round & Offer',
        tasks: [
          {
            title: 'Sophia Chen - Staff Security Lead',
            description: 'Completed culture fit and VP interviews. Preparing equity package and offer letter.',
            priority: 'p1',
            labels: ['Offer', 'Security'],
            due_days_offset: 4,
          },
        ],
      },
    ],
  },
  {
    id: 'client-management',
    title: 'Client Management & Retainers',
    description: 'High-touch agency workflow tracking client onboarding, weekly deliverables, and milestone invoicing.',
    category: 'work',
    icon: 'FolderKanban',
    color: '#f59e0b', // Amber
    sections: [
      {
        name: 'Discovery & Onboarding',
        tasks: [
          {
            title: 'Nexus Corp - Brand Architecture Kickoff',
            description: 'Collect brand assets, competitor positioning, and stakeholder interview schedules.',
            priority: 'p1',
            labels: ['Onboarding', 'Enterprise'],
            due_days_offset: 1,
          },
        ],
      },
      {
        name: 'Active Deliverables',
        tasks: [
          {
            title: 'Vanguard Health - Design System V2',
            description: 'Deliver WCAG AAA accessible components and token catalog.',
            priority: 'p1',
            labels: ['Design', 'High-Priority'],
            due_days_offset: 2,
            subtasks: [
              'Audit color contrast ratios',
              'Export Figma tokens to JSON',
              'Conduct client walkthrough',
            ],
          },
        ],
      },
      {
        name: 'Invoicing & Retainers',
        tasks: [
          {
            title: 'Send monthly retainer invoice for Horizon Labs',
            description: 'Net-30 terms including additional 20 engineering hours.',
            priority: 'p3',
            labels: ['Billing'],
            due_days_offset: 5,
          },
        ],
      },
    ],
  },

  // TECH TEMPLATES
  {
    id: 'sprint-backlog',
    title: 'Sprint Backlog & Pipeline',
    description: 'Agile 2-week sprint cycle tracker with code review pipelines and automated testing milestones.',
    category: 'tech',
    icon: 'Cpu',
    color: '#00f0ff', // Electric cyan
    sections: [
      {
        name: 'Backlog',
        tasks: [
          {
            title: 'Implement optimistic UI updates for task completion',
            description: 'Ensure instant feedback without waiting for server network round-trip.',
            priority: 'p2',
            labels: ['Performance', 'Frontend'],
            due_days_offset: 7,
          },
          {
            title: 'Export workspace data to encrypted JSON backup',
            description: 'Allow users to download their entire task tree and karma history locally.',
            priority: 'p3',
            labels: ['Data', 'Compliance'],
            due_days_offset: 10,
          },
        ],
      },
      {
        name: 'In Progress (Active Sprint)',
        tasks: [
          {
            title: 'Build real-time Supabase replication channel',
            description: 'Subscribe to postgres_changes broadcast channel for instant multi-client sync.',
            priority: 'p1',
            labels: ['Realtime', 'Supabase'],
            due_days_offset: 1,
            subtasks: [
              'Initialize supabase channel listener',
              'Handle optimistic cache reconciliation',
              'Implement connection state indicator',
            ],
          },
          {
            title: 'Design high-framerate particle burst with canvas-confetti',
            description: 'Custom particle shapes with electric cyan and magenta embers on task completion.',
            priority: 'p2',
            labels: ['UI/UX', 'Animation'],
            due_days_offset: 2,
          },
        ],
      },
      {
        name: 'In Code Review',
        tasks: [
          {
            title: 'PR #142: Fix nested subtask indentation and SVG branch render',
            description: 'Ensures subtasks dynamically compute ancestor depth and render smooth connecting arcs.',
            priority: 'p1',
            labels: ['Bugfix', 'Review'],
            due_days_offset: 0,
          },
        ],
      },
      {
        name: 'Deployed to Production',
        tasks: [
          {
            title: 'Upgrade Next.js App Router and Turbopack compiler',
            description: 'Sub-second HMR and optimized static generation verified in staging.',
            priority: 'p3',
            labels: ['Infrastructure'],
            due_days_offset: -1,
          },
        ],
      },
    ],
  },
  {
    id: 'bug-tracker',
    title: 'Bug Tracker & Quality Assurance',
    description: 'Track critical defects, edge case repros, and verification across staging environments.',
    category: 'tech',
    icon: 'ShieldAlert',
    color: '#ff0055', // Crimson
    sections: [
      {
        name: 'Triage & Unconfirmed',
        tasks: [
          {
            title: 'BUG-401: Drag and drop card flicker on high DPI trackpads',
            description: 'Occasional transform jump when releasing cards near container boundaries.',
            priority: 'p1',
            labels: ['DnD', 'Edge-Case'],
            due_days_offset: 1,
          },
        ],
      },
      {
        name: 'Confirmed / Investigating',
        tasks: [
          {
            title: 'BUG-388: Quick-Add regex fails on quoted multi-word project titles',
            description: 'Fix parser regex to accept #"My Custom Project" syntax.',
            priority: 'p2',
            labels: ['Parser', 'Regex'],
            due_days_offset: 2,
          },
        ],
      },
      {
        name: 'Resolved & Verified',
        tasks: [
          {
            title: 'BUG-310: Session persistence token loss after tab reload',
            description: 'Wrapped localStorage sync with fallback state recovery.',
            priority: 'p1',
            labels: ['Auth', 'Security'],
            due_days_offset: -2,
          },
        ],
      },
    ],
  },
  {
    id: 'product-roadmap',
    title: 'Product Roadmap & Vision',
    description: 'Strategic feature releases planned across quarters from discovery to general availability.',
    category: 'tech',
    icon: 'Layers',
    color: '#a855f7', // Violet
    sections: [
      {
        name: 'Q1: Core Foundation',
        tasks: [
          {
            title: 'Zero-latency Natural Language Quick-Add Engine',
            description: 'Deterministic parsing of projects, dates, labels, and deadlines.',
            priority: 'p1',
            labels: ['Core', 'UX'],
            due_days_offset: 1,
          },
          {
            title: 'Multi-view switching (List, Board, Calendar)',
            description: 'Seamlessly toggle task representation without losing selection state.',
            priority: 'p1',
            labels: ['Feature'],
            due_days_offset: 3,
          },
        ],
      },
      {
        name: 'Q2: Team Collaboration',
        tasks: [
          {
            title: 'Collaborative task slide-over drawer with live comments',
            description: 'Threaded commentary, real-time presence indicators, and task activity log.',
            priority: 'p2',
            labels: ['Team', 'Collaboration'],
            due_days_offset: 14,
          },
        ],
      },
      {
        name: 'Q3: Zenith Karma & Gamification',
        tasks: [
          {
            title: 'Streak flames, achievement ranks, and completion analytics',
            description: 'Reward consistent daily focus with tiered masteries from Novice to Grandmaster.',
            priority: 'p2',
            labels: ['Gamification'],
            due_days_offset: 30,
          },
        ],
      },
    ],
  },

  // PERSONAL TEMPLATES
  {
    id: 'student-coursework',
    title: 'Student Planning & Coursework',
    description: 'Academic semester tracker for lectures, term projects, thesis research, and exam preparation.',
    category: 'personal',
    icon: 'GraduationCap',
    color: '#00f0ff',
    sections: [
      {
        name: 'Lectures & Readings',
        tasks: [
          {
            title: 'CS-482: Distributed Systems Consensus Algorithms',
            description: 'Read Paxos and Raft comparative evaluation paper.',
            priority: 'p2',
            labels: ['Computer Science', 'Reading'],
            due_days_offset: 1,
          },
          {
            title: 'MATH-301: Multivariate Calculus Problem Set 4',
            description: 'Complete questions 12 through 28 on Stokes theorem.',
            priority: 'p1',
            labels: ['Math', 'Homework'],
            due_days_offset: 2,
          },
        ],
      },
      {
        name: 'Term Projects',
        tasks: [
          {
            title: 'Distributed Key-Value Store Capstone Implementation',
            description: 'Build fault-tolerant replicated log with leader election in Go/Rust.',
            priority: 'p1',
            labels: ['Capstone', 'Code'],
            due_days_offset: 5,
            subtasks: [
              'Implement RPC heartbeat mechanism',
              'Write unit test suite for split-brain scenario',
              'Benchmarking throughput under 20% packet loss',
            ],
          },
        ],
      },
      {
        name: 'Exams & Revisions',
        tasks: [
          {
            title: 'Midterm Preparation: Flashcard drill for Algorithms',
            description: 'Focus on Dynamic Programming, Bellman-Ford, and Network Flow.',
            priority: 'p2',
            labels: ['Exam', 'Revision'],
            due_days_offset: 4,
          },
        ],
      },
    ],
  },
  {
    id: 'weekly-review-gtd',
    title: 'Weekly Review (GTD System)',
    description: 'Getting Things Done weekly mental reset to empty inboxes, clarify goals, and prioritize the week ahead.',
    category: 'personal',
    icon: 'CheckCircle2',
    color: '#10b981', // Emerald
    sections: [
      {
        name: '1. Get Clear (Inbox Zero)',
        tasks: [
          {
            title: 'Empty email inbox to zero',
            description: 'Archive, delegate, or convert emails into actionable tasks.',
            priority: 'p1',
            labels: ['GTD', 'Habit'],
            due_days_offset: 0,
          },
          {
            title: 'Review physical workspace and scratch notes',
            description: 'Digitize quick thoughts and purge unnecessary scraps.',
            priority: 'p3',
            labels: ['Declutter'],
            due_days_offset: 0,
          },
        ],
      },
      {
        name: '2. Get Current',
        tasks: [
          {
            title: 'Review upcoming 14 days on calendar',
            description: 'Check for upcoming deadlines, travel, or scheduling conflicts.',
            priority: 'p2',
            labels: ['Planning'],
            due_days_offset: 1,
          },
          {
            title: 'Audit waiting-for list and pending delegated items',
            priority: 'p2',
            labels: ['Follow-up'],
            due_days_offset: 1,
          },
        ],
      },
      {
        name: '3. Get Creative & Mind Sweep',
        tasks: [
          {
            title: '15-minute unstructured ideation session',
            description: 'Jot down ambitious ideas for upcoming personal projects or adventures.',
            priority: 'p4',
            labels: ['Inspiration'],
            due_days_offset: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'goal-tracker',
    title: 'Goal Tracker & Habit Streaks',
    description: 'High-impact personal OKRs, daily habit adherence, and milestone achievement logging.',
    category: 'personal',
    icon: 'Target',
    color: '#f59e0b',
    sections: [
      {
        name: 'Daily Keystone Habits',
        tasks: [
          {
            title: '45-minute deep focus coding sprint',
            description: 'No Slack, no notifications, deep flow state on architecture.',
            priority: 'p1',
            labels: ['Habit', 'Focus'],
            due_days_offset: 0,
          },
          {
            title: 'Hydration & 10,000 steps daily target',
            priority: 'p3',
            labels: ['Health'],
            due_days_offset: 0,
          },
        ],
      },
      {
        name: 'Monthly Milestones',
        tasks: [
          {
            title: 'Publish technical article on Realtime Web Architecture',
            description: 'Breakdown of Postgres changes, state synchronization, and low-latency UI.',
            priority: 'p2',
            labels: ['Writing', 'Milestone'],
            due_days_offset: 8,
          },
        ],
      },
      {
        name: 'Trophy / Completed Goals',
        tasks: [
          {
            title: 'Ran first 10K road race in under 50 minutes',
            priority: 'p1',
            labels: ['Achievement', 'Fitness'],
            due_days_offset: -5,
          },
        ],
      },
    ],
  },
];
