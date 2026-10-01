import { Task, Project, Section, KarmaProfile, UserProfile, Workspace, CustomTemplate, WorkspaceMember, LabelItem, NeuralNote, ArchivedNeuralNote } from '@/types';
import { formatDate } from '@/lib/parser';
import { INITIAL_CUSTOM_TEMPLATES } from '@/lib/templates';

const STORAGE_KEYS = {
  WORKSPACES: 'aerox_zenith_workspaces_v1',
  WORKSPACE_MEMBERS: 'aerox_zenith_workspace_members_v1',
  TASKS: 'aerox_zenith_tasks_v1',
  PROJECTS: 'aerox_zenith_projects_v1',
  SECTIONS: 'aerox_zenith_sections_v1',
  KARMA: 'aerox_zenith_karma_v1',
  USER: 'aerox_zenith_user_v1',
  PROFILES: 'aerox_zenith_profiles_v1',
  OPERATIVES: 'aerox_zenith_operatives_v1',
  CUSTOM_TEMPLATES: 'aerox_zenith_custom_templates_v1',
  LABELS: 'aerox_zenith_labels_v1',
  NOTES: 'aerox_zenith_notes_v1',
  ARCHIVED_NOTES: 'aerox_zenith_archived_notes_v1',
};

export { INITIAL_CUSTOM_TEMPLATES };

export const INITIAL_NOTES: NeuralNote[] = [
  {
    id: 'note_neural_1',
    user_id: null,
    color: '#00E0FF',
    order_index: 0,
    blocks: [
      { id: 'blk_1', type: 'h1', text: 'QUANTUM ARCHITECTURE // V3', depth: 0 },
      { id: 'blk_2', type: 'bullet', text: 'Optimize LLVM intermediate representation bytecode', depth: 1 },
      { id: 'blk_3', type: 'bullet', text: 'Enforce memory safety barriers on register transfers', depth: 2 },
      { id: 'blk_4', type: 'text', text: 'Telemetry streams synchronized at 1000Hz via WebSocket tunnel', depth: 1 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'note_neural_2',
    user_id: null,
    color: '#FF006E',
    order_index: 1,
    blocks: [
      { id: 'blk_5', type: 'h2', text: 'TACTICAL DEPLOYMENT VECTORS', depth: 0 },
      { id: 'blk_6', type: 'bullet', text: 'Verify edge computing nodes across regional clusters', depth: 1 },
      { id: 'blk_7', type: 'bullet', text: 'Inspect cryptographic handshake latencies (<2ms)', depth: 2 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'note_neural_3',
    user_id: null,
    color: '#00F5D4',
    order_index: 2,
    blocks: [
      { id: 'blk_8', type: 'h1', text: 'NEURAL LINK SYNC PROTOCOLS', depth: 0 },
      { id: 'blk_9', type: 'bullet', text: 'Calibrate bio-telemetry impedance threshold', depth: 1 },
      { id: 'blk_10', type: 'bullet', text: 'Activate sub-millisecond audio feedback engine', depth: 1 },
      { id: 'blk_11', type: 'bullet', text: 'Buffer overflow safeguards set to armed', depth: 2 },
    ],
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_LABELS: LabelItem[] = [
  { id: 'lbl_critical', name: 'Critical', color: '#ff0055', created_at: new Date().toISOString() },
  { id: 'lbl_p1', name: 'P1', color: '#ff006e', created_at: new Date().toISOString() },
  { id: 'lbl_infra', name: 'Infra', color: '#00f0ff', created_at: new Date().toISOString() },
  { id: 'lbl_hotfix', name: 'Hotfix', color: '#f59e0b', created_at: new Date().toISOString() },
];

export const INITIAL_OPERATIVES: UserProfile[] = [];

export const INITIAL_USER: UserProfile = {
  id: 'usr_default',
  name: 'Workspace Member',
  email: 'member@aerox.dev',
  role: 'Member',
};

export const TEAM_PROFILES: UserProfile[] = [];

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
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
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
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  },
  // Subtask 2 of task_parent_1
  {
    id: 'task_sub_1_2',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 1,
    comments: [],
    created_at: new Date().toISOString(),
  },
  // Subtask 3 of task_parent_1
  {
    id: 'task_sub_1_3',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
    project_id: 'proj_core',
    section_id: 'sec_core_arch',
    title: 'Plasma Shockwave & Glitch Disintegration on task completion',
    description: 'Phosphor emerald kinetic shockwave with digital glitch tear and smooth collapse when a task checkbox is ticked.',
    priority: 'p2',
    completed: false,
    due_date: tomorrowStr,
    deadline: 'Tomorrow Noon',
    parent_id: 'task_parent_1',
    labels: ['Animation'],
    assignee_id: null,
    order: 2,
    comments: [],
    created_at: new Date().toISOString(),
  },

  // Another task in Core Engine
  {
    id: 'task_core_2',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },

  // Board Tasks for Zenith UI System
  {
    id: 'task_ui_1',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_ui_2',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_ui_3',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  },

  // Sprint 26 Tasks
  {
    id: 'task_sp_1',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
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
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_sp_2',
    workspace_id: '81db2b29-fc5c-4d37-8ffc-991f8c4749f7',
    project_id: 'proj_sprint',
    section_id: 'sec_sp_dev',
    title: 'Deploy Operator Profile Telemetry & Consistency Matrix',
    description: '365-day consistency heatmap, 7-day velocity Framer Motion graph, and unbroken streak telemetry.',
    priority: 'p1',
    completed: false,
    due_date: todayStr,
    deadline: '20:00',
    parent_id: null,
    labels: ['Telemetry', 'Operator'],
    assignee_id: null,
    order: 0,
    comments: [],
    created_at: new Date().toISOString(),
  },

  // Inbox Task (Unassigned to any specific project)
  {
    id: 'task_inbox_1',
    workspace_id: 'e0f214e2-9366-4e50-93cb-56272551ec41',
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
    workspace_id: 'e0f214e2-9366-4e50-93cb-56272551ec41',
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
    assignee_id: null,
    order: 1,
    comments: [],
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_KARMA: KarmaProfile = {
  points: 0,
  streak_days: 0,
  daily_goal: 5,
  weekly_goal: 25,
  history: [],
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

  getUser: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
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
  clearAll: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('LocalStorage clearAll failed', e);
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

  getCustomTemplates: (): CustomTemplate[] => {
    if (typeof window === 'undefined') return INITIAL_CUSTOM_TEMPLATES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      return data ? JSON.parse(data) : INITIAL_CUSTOM_TEMPLATES;
    } catch {
      return INITIAL_CUSTOM_TEMPLATES;
    }
  },
  setCustomTemplates: (templates: CustomTemplate[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.warn('LocalStorage setCustomTemplates failed', e);
    }
  },

  getWorkspaceMembers: (): WorkspaceMember[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKSPACE_MEMBERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setWorkspaceMembers: (members: WorkspaceMember[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.warn('LocalStorage setWorkspaceMembers failed', e);
    }
  },

  getOperatives: (): UserProfile[] => {
    if (typeof window === 'undefined') return INITIAL_OPERATIVES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPERATIVES);
      return data ? JSON.parse(data) : INITIAL_OPERATIVES;
    } catch {
      return INITIAL_OPERATIVES;
    }
  },
  setOperatives: (operatives: UserProfile[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.OPERATIVES, JSON.stringify(operatives));
    } catch (e) {
      console.warn('LocalStorage setOperatives failed', e);
    }
  },

  getLabels: (): LabelItem[] => {
    if (typeof window === 'undefined') return INITIAL_LABELS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LABELS);
      return data ? JSON.parse(data) : INITIAL_LABELS;
    } catch {
      return INITIAL_LABELS;
    }
  },
  setLabels: (labels: LabelItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
    } catch (e) {
      console.warn('LocalStorage setLabels failed', e);
    }
  },

  getNotes: (): NeuralNote[] => {
    if (typeof window === 'undefined') return INITIAL_NOTES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  },
  setNotes: (notes: NeuralNote[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('LocalStorage setNotes failed', e);
    }
  },

  getArchivedNotes: (): ArchivedNeuralNote[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARCHIVED_NOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setArchivedNotes: (notes: ArchivedNeuralNote[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ARCHIVED_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('LocalStorage setArchivedNotes failed', e);
    }
  },
};
