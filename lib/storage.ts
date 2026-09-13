import { Task, Project, Section, KarmaProfile, UserProfile, Workspace } from '@/types';
import { formatDate } from '@/lib/parser';

const STORAGE_KEYS = {
  WORKSPACES: 'aerox_zenith_workspaces_v1',
  TASKS: 'aerox_zenith_tasks_v1',
  PROJECTS: 'aerox_zenith_projects_v1',
  SECTIONS: 'aerox_zenith_sections_v1',
  KARMA: 'aerox_zenith_karma_v1',
  USER: 'aerox_zenith_user_v1',
  PROFILES: 'aerox_zenith_profiles_v1',
};

export const INITIAL_USER: UserProfile = {
  id: 'usr_zenith_master',
  name: 'Zenith Architect',
  email: 'zenith@aerox.dev',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'Grandmaster Architect',
};

export const TEAM_PROFILES: UserProfile[] = [
  INITIAL_USER,
  {
    id: 'usr_aria',
    name: 'Aria Stark',
    email: 'aria@aerox.dev',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'Product Lead',
  },
  {
    id: 'usr_kai',
    name: 'Kai Tanaka',
    email: 'kai@aerox.dev',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'Frontend Specialist',
  },
  {
    id: 'usr_elena',
    name: 'Dr. Elena Rostova',
    email: 'elena@aerox.dev',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    role: 'Design Systems Lead',
  },
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'e0f214e2-9366-4e50-93cb-56272551ec41',
    name: 'Personal',
    type: 'personal',
    color: '#00f0ff',
    created_at: new Date().toISOString(),
  },
  {
    id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
    name: 'Core Team',
    type: 'group',
    color: '#a855f7',
    created_at: new Date().toISOString(),
  },
  {
    id: '79bcf3c8-e047-4959-bd98-c9233633d4bb',
    name: 'School / Research',
    type: 'group',
    color: '#10b981',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_core',
    name: 'Aerox Core Engine',
    color: '#00f0ff', // Electric cyan
    view_mode: 'list',
    is_team: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj_ui',
    name: 'Zenith UI System',
    color: '#a855f7', // Violet
    view_mode: 'board',
    is_team: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj_sprint',
    name: 'Sprint 26 Launch',
    color: '#ff0055', // Crimson
    view_mode: 'board',
    is_team: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj_gtd',
    name: 'Personal GTD Mastery',
    color: '#10b981', // Emerald
    view_mode: 'calendar',
    is_team: false,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SECTIONS: Section[] = [
  // Sections for Core Engine
  { id: 'sec_core_arch', project_id: 'proj_core', name: 'Architecture & Performance', order: 0 },
  { id: 'sec_core_realtime', project_id: 'proj_core', name: 'Realtime Channels', order: 1 },
  // Sections for UI System
  { id: 'sec_ui_todo', project_id: 'proj_ui', name: 'To Do', order: 0 },
  { id: 'sec_ui_progress', project_id: 'proj_ui', name: 'In Progress', order: 1 },
  { id: 'sec_ui_done', project_id: 'proj_ui', name: 'Done', order: 2 },
  // Sections for Sprint 26
  { id: 'sec_sp_backlog', project_id: 'proj_sprint', name: 'Sprint Backlog', order: 0 },
  { id: 'sec_sp_dev', project_id: 'proj_sprint', name: 'In Development', order: 1 },
  { id: 'sec_sp_review', project_id: 'proj_sprint', name: 'Quality Review', order: 2 },
  { id: 'sec_sp_done', project_id: 'proj_sprint', name: 'Shipped', order: 3 },
  // Sections for GTD
  { id: 'sec_gtd_inbox', project_id: 'proj_gtd', name: 'Clarify & Collect', order: 0 },
  { id: 'sec_gtd_action', project_id: 'proj_gtd', name: 'Next Actions', order: 1 },
];

const todayStr = formatDate(new Date());
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 5);
const nextWeekStr = formatDate(nextWeek);

export const INITIAL_TASKS: Task[] = [
  // Parent task with hierarchical subtasks for testing SVG branching lines
  {
    id: 'task_parent_1',
    project_id: 'proj_core',
    section_id: 'sec_core_arch',
    title: 'Architect Obsidian Reactive State Fabric',
    description: 'High throughput local-first cache with real-time Supabase replication and multi-tab synchronization.',
    priority: 'p1',
    completed: false,
    due_date: todayStr,
    deadline: 'Tonight EOD',
    parent_id: null,
    labels: ['Architecture', 'Core', 'V1'],
    assignee_id: 'usr_zenith_master',
    order: 0,
    comments: [
      {
        id: 'c1',
        author: 'Dr. Elena Rostova',
        author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        text: 'The glassmorphic blur filters and color matrix look incredibly crisp on Retina displays.',
        date: '10:45 AM',
      },
      {
        id: 'c2',
        author: 'Zenith Architect',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        text: 'Agreed! Zero-latency optimistic UI updates are now completely wired into the global reducer.',
        date: '11:15 AM',
      },
    ],
    created_at: new Date().toISOString(),
  },
  // Subtask 1 of task_parent_1
  {
    id: 'task_sub_1_1',
    project_id: 'proj_core',
    section_id: 'sec_core_arch',
    title: 'Implement SVG/CSS branching guide lines for subtask tree',
    description: 'Render smooth curved neon connectors linking parent tasks directly to nested sub-items.',
    priority: 'p1',
    completed: true,
    due_date: todayStr,
    deadline: '2:00 PM',
    parent_id: 'task_parent_1',
    labels: ['Frontend', 'Tree'],
    assignee_id: 'usr_kai',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  },
  // Subtask 2 of task_parent_1
  {
    id: 'task_sub_1_2',
    project_id: 'proj_core',
    section_id: 'sec_core_arch',
    title: 'Build non-AI regex token parser for Quick-Add bar',
    description: 'Parse #projects, @labels, p1-p4 priorities, today/tomorrow dates, and {deadline} tokens deterministically.',
    priority: 'p2',
    completed: false,
    due_date: todayStr,
    deadline: '5:00 PM',
    parent_id: 'task_parent_1',
    labels: ['Parser', 'Regex'],
    assignee_id: 'usr_zenith_master',
    order: 1,
    comments: [],
    created_at: new Date().toISOString(),
  },
  // Subtask 3 of task_parent_1
  {
    id: 'task_sub_1_3',
    project_id: 'proj_core',
    section_id: 'sec_core_arch',
    title: 'Integrate canvas-confetti burst on task completion',
    description: 'Multi-angle particle explosion with electric cyan and magenta embers whenever a task checkbox is ticked.',
    priority: 'p2',
    completed: false,
    due_date: tomorrowStr,
    deadline: 'Tomorrow Noon',
    parent_id: 'task_parent_1',
    labels: ['Animation'],
    assignee_id: 'usr_aria',
    order: 2,
    comments: [],
    created_at: new Date().toISOString(),
  },

  // Another task in Core Engine
  {
    id: 'task_core_2',
    project_id: 'proj_core',
    section_id: 'sec_core_realtime',
    title: 'Listen to Supabase postgres_changes on broadcast channel',
    description: 'Instant multi-client synchronization with zero polling or refresh requirements.',
    priority: 'p1',
    completed: false,
    due_date: todayStr,
    deadline: 'Friday Sprint Close',
    parent_id: null,
    labels: ['Supabase', 'Realtime'],
    assignee_id: 'usr_kai',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },

  // Board Tasks for Zenith UI System
  {
    id: 'task_ui_1',
    project_id: 'proj_ui',
    section_id: 'sec_ui_todo',
    title: 'Refine Obsidian theme tokens & Tailwind neon shadows',
    description: 'Tailor #09090b background with electric cyan (#00f0ff) and crimson (#ff0055) glows.',
    priority: 'p2',
    completed: false,
    due_date: tomorrowStr,
    deadline: null,
    parent_id: null,
    labels: ['Design', 'CSS'],
    assignee_id: 'usr_elena',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_ui_2',
    project_id: 'proj_ui',
    section_id: 'sec_ui_progress',
    title: 'Construct mobile portrait bottom dock and floating neon FAB',
    description: 'Glassmorphic bottom dock with Inbox, Today, Upcoming, and Projects navigation + right-5 floating action button.',
    priority: 'p1',
    completed: false,
    due_date: todayStr,
    deadline: 'Today EOD',
    parent_id: null,
    labels: ['Mobile', 'Responsive'],
    assignee_id: 'usr_zenith_master',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_ui_3',
    project_id: 'proj_ui',
    section_id: 'sec_ui_done',
    title: 'Initialize Lucide icon registry and glass panels',
    description: 'Clean icons throughout sidebar, modals, task items, and collaboration drawer.',
    priority: 'p3',
    completed: true,
    due_date: todayStr,
    deadline: null,
    parent_id: null,
    labels: ['Icons', 'Ready'],
    assignee_id: 'usr_aria',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  },

  // Sprint 26 Tasks
  {
    id: 'task_sp_1',
    project_id: 'proj_sprint',
    section_id: 'sec_sp_backlog',
    title: 'Implement 1-click project template library',
    description: 'Work (Agendas, Hiring, Clients), Tech (Sprints, Bugs, Roadmaps), Personal (Coursework, GTD, Goals).',
    priority: 'p2',
    completed: false,
    due_date: nextWeekStr,
    deadline: 'Next Monday',
    parent_id: null,
    labels: ['Templates', 'Feature'],
    assignee_id: 'usr_zenith_master',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_sp_2',
    project_id: 'proj_sprint',
    section_id: 'sec_sp_dev',
    title: 'Construct Karma Streak Engine & 7-Day Velocity Chart',
    description: 'Novice to Grandmaster tier ranks with daily/weekly target progress meters and glowing flame badge.',
    priority: 'p1',
    completed: false,
    due_date: todayStr,
    deadline: 'Tonight',
    parent_id: null,
    labels: ['Karma', 'Gamification'],
    assignee_id: 'usr_aria',
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },

  // Inbox Task (Unassigned to any specific project)
  {
    id: 'task_inbox_1',
    project_id: null,
    section_id: null,
    title: 'Quick thought: Evaluate Web Workers for large dataset filtering',
    description: 'Benchmark search performance across 10,000+ cached tasks.',
    priority: 'p3',
    completed: false,
    due_date: null,
    deadline: null,
    parent_id: null,
    labels: ['Idea', 'Performance'],
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_inbox_2',
    project_id: null,
    section_id: null,
    title: 'Book annual cloud server reservations for Q4',
    description: 'Save 35% on multi-region database compute instances.',
    priority: 'p2',
    completed: false,
    due_date: todayStr,
    deadline: 'End of month',
    parent_id: null,
    labels: ['Finance'],
    assignee_id: 'usr_zenith_master',
    order: 1,
    comments: [],
    created_at: new Date().toISOString(),
  },
];

// Helper to generate 7-day history ending today
function generateInitialKarmaHistory(): { date: string; count: number }[] {
  const history: { date: string; count: number }[] = [];
  const counts = [3, 6, 5, 8, 4, 7, 4]; // realistic week of task completion
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    history.push({
      date: formatDate(d),
      count: counts[6 - i],
    });
  }
  return history;
}

export const INITIAL_KARMA: KarmaProfile = {
  points: 1240, // Specialist Rank (500 - 1499)
  streak_days: 7, // Active 7-day flame streak!
  daily_goal: 5,
  weekly_goal: 25,
  history: generateInitialKarmaHistory(),
  last_active_date: todayStr,
};

export const storage = {
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) return INITIAL_TASKS;
      const parsed: Task[] = JSON.parse(data);
      return parsed.map(t => {
        let wsId = t.workspace_id;
        if (!wsId || wsId === 'ws_personal') wsId = 'e0f214e2-9366-4e50-93cb-56272551ec41';
        else if (wsId === 'ws_core_team') wsId = '81db2b29-fc5c-4d37-8ffc-991f8c4749f7';
        else if (wsId === 'ws_school') wsId = '79bcf3c8-e047-4959-bd98-c9233633d4bb';
        return {
          ...t,
          workspace_id: wsId
        };
      });
    } catch {
      return INITIAL_TASKS.map(t => ({
        ...t,
        workspace_id: t.workspace_id || (t.project_id === 'proj_gtd' ? 'e0f214e2-9366-4e50-93cb-56272551ec41' : '81db2b29-fc5c-4d37-8ffc-991f8c4749f7')
      }));
    }
  },
  setTasks: (tasks: Task[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage setTasks failed', e);
    }
  },

  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return INITIAL_PROJECTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  },
  setProjects: (projects: Project[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('LocalStorage setProjects failed', e);
    }
  },

  getSections: (): Section[] => {
    if (typeof window === 'undefined') return INITIAL_SECTIONS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      return data ? JSON.parse(data) : INITIAL_SECTIONS;
    } catch {
      return INITIAL_SECTIONS;
    }
  },
  setSections: (sections: Section[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
    } catch (e) {
      console.warn('LocalStorage setSections failed', e);
    }
  },

  getKarma: (): KarmaProfile => {
    if (typeof window === 'undefined') return INITIAL_KARMA;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KARMA);
      return data ? JSON.parse(data) : INITIAL_KARMA;
    } catch {
      return INITIAL_KARMA;
    }
  },
  setKarma: (karma: KarmaProfile) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.KARMA, JSON.stringify(karma));
    } catch (e) {
      console.warn('LocalStorage setKarma failed', e);
    }
  },

  getUser: (): UserProfile => {
    if (typeof window === 'undefined') return INITIAL_USER;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  },
  setUser: (user: UserProfile | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.warn('LocalStorage setUser failed', e);
    }
  },

  getProfiles: (): UserProfile[] => {
    if (typeof window === 'undefined') return TEAM_PROFILES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return data ? JSON.parse(data) : TEAM_PROFILES;
    } catch {
      return TEAM_PROFILES;
    }
  },

  getWorkspaces: (): Workspace[] => {
    if (typeof window === 'undefined') return INITIAL_WORKSPACES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      return data ? JSON.parse(data) : INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  },
  setWorkspaces: (workspaces: Workspace[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
    } catch (e) {
      console.warn('LocalStorage setWorkspaces failed', e);
    }
  },
};
