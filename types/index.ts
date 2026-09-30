export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export type ViewMode = 'list' | 'board' | 'calendar';

export interface Comment {
  id: string;
  author: string;
  author_avatar?: string;
  text: string;
  date: string;
}

export interface Task {
  id: string;
  user_id?: string | null;
  workspace_id?: string | null;
  project_id: string | null;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  due_date: string | null;
  deadline: string | null;
  parent_id: string | null;
  section_id: string | null;
  labels: string[];
  assignee_id: string | null;
  order: number;
  comments: Comment[];
  recurrence?: string | null;
  created_at?: string;
  completed_at?: string | null;
}

export interface Project {
  id: string;
  user_id?: string | null;
  name: string;
  color: string;
  view_mode: ViewMode;
  is_team: boolean;
  created_at?: string;
  icon?: string;
}

export interface Section {
  id: string;
  user_id?: string | null;
  project_id: string;
  name: string;
  order: number;
}

export interface KarmaHistoryItem {
  date: string;
  count: number;
}

export interface KarmaProfile {
  id?: string;
  user_id?: string | null;
  points: number;
  streak_days: number;
  daily_goal: number;
  weekly_goal: number;
  history: KarmaHistoryItem[];
  last_active_date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

export type ActiveFilterView = 'inbox' | 'today' | 'upcoming' | 'completed' | string;

export interface SystemStructureTask {
  title: string;
  description?: string;
  priority?: Priority;
  labels?: string[];
  due_days_offset?: number;
  subtasks?: string[];
}

export interface SystemStructureSection {
  name: string;
  tasks: SystemStructureTask[];
}

export interface SystemStructure {
  sections: SystemStructureSection[];
  view_mode?: ViewMode;
  color?: string;
}

export interface CustomTemplate {
  id: string;
  user_id?: string | null;
  name: string;
  description: string;
  icon: string;
  category: string;
  color?: string;
  system_structure: SystemStructure;
  created_at?: string;
}

export type WorkspaceType = 'personal' | 'group';

export interface Workspace {
  id: string;
  user_id?: string | null;
  name: string;
  type: WorkspaceType;
  color: string;
  created_at?: string;
}
