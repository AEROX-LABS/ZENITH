'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Task, 
  Project, 
  Section, 
  KarmaProfile, 
  UserProfile, 
  ActiveFilterView, 
  ViewMode, 
  Priority,
  Workspace,
  CustomTemplate
} from '@/types';
import { 
  storage, 
  INITIAL_KARMA, 
  TEAM_PROFILES,
} from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDate } from '@/lib/parser';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppContextType {
  isHydrated: boolean;
  isAuthLoading: boolean;
  session: any | null;
  setSessionState: (session: any | null) => void;
  signOut: () => Promise<void>;

  // Collections
  tasks: Task[];
  projects: Project[];
  sections: Section[];
  karma: KarmaProfile;
  user: UserProfile | null;
  profiles: UserProfile[];
  
  // Navigation & View Mode
  activeView: ActiveFilterView;
  setActiveView: (view: ActiveFilterView) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentProject: Project | null;
  currentWorkspace: Workspace | null;
  
  // Workspaces
  workspaces: Workspace[];
  createWorkspace: (workspace: Partial<Workspace>) => Promise<Workspace>;
  isCreateWorkspaceOpen: boolean;
  setIsCreateWorkspaceOpen: (open: boolean) => void;
  
  // Selection & Search & Filter
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedTask: Task | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPriority: Priority | 'all';
  setFilterPriority: (priority: Priority | 'all') => void;
  filterLabel: string | 'all';
  setFilterLabel: (label: string | 'all') => void;

  // Custom System Builder & Templates
  customTemplates: CustomTemplate[];
  createCustomTemplate: (template: Omit<CustomTemplate, 'id' | 'created_at'> & { id?: string }) => Promise<CustomTemplate>;
  deleteCustomTemplate: (templateId: string) => Promise<void>;
  launchCustomTemplate: (template: CustomTemplate) => Promise<void>;
  isSystemBuilderOpen: boolean;
  setIsSystemBuilderOpen: (open: boolean) => void;
  openSystemBuilder: () => void;

  // Modals & Triggers
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  openAddTaskModal: (initialData?: Partial<Task>) => void;
  addTaskInitialData: Partial<Task> | null;
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (open: boolean) => void;
  isKarmaModalOpen: boolean;
  setIsKarmaModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  openTutorial: () => void;
  completeTutorial: () => void;

  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // CRUD Operations
  addTask: (task: Partial<Task>) => Promise<Task>;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  reorderTasks: (sourceIndex: number, destIndex: number, sectionId?: string | null) => void;
  moveTaskStage: (taskId: string, targetSectionId: string | null, targetCompleted?: boolean) => void;
  addSubtask: (parentId: string, title: string, priority?: Priority) => Task;
  assignTask: (taskId: string, assigneeId: string | null) => void;
  addComment: (taskId: string, text: string, author?: string) => void;
  
  // Project & Section Operations
  createProject: (project: Partial<Project>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  createSection: (section: Partial<Section>) => Section;
  deleteSection: (sectionId: string) => void;
  applyTemplate: (templateId: string) => void;
  
  // Karma & User
  updateKarmaGoals: (dailyGoal: number, weeklyGoal: number) => void;
  setUser: (user: UserProfile | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSessionState] = useState<any | null>(null);

  // Collections isolated per user (start empty, populated only for authenticated user)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [karma, setKarma] = useState<KarmaProfile>(INITIAL_KARMA);
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>(TEAM_PROFILES);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  // Navigation & Filtering
  const [activeView, setActiveViewState] = useState<ActiveFilterView>('today');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterLabel, setFilterLabel] = useState<string | 'all'>('all');

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isSystemBuilderOpen, setIsSystemBuilderOpen] = useState(false);
  const [addTaskInitialData, setAddTaskInitialData] = useState<Partial<Task> | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isKarmaModalOpen, setIsKarmaModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Strict Client-State Wipe (Per-Email Sandboxing)
  const wipeAllClientState = useCallback(() => {
    // 1. Wipe all React state to empty/null
    setTasks([]);
    setWorkspaces([]);
    setProjects([]);
    setSections([]);
    setCustomTemplates([]);
    setKarma(INITIAL_KARMA);
    setSelectedTaskId(null);
    setUserState(null);
    setSessionState(null);

    // 2. Wipe all browser storage (localStorage and sessionStorage)
    storage.clearAll();

    // 3. Close all modals
    setIsQuickAddOpen(false);
    setIsCreateWorkspaceOpen(false);
    setIsSystemBuilderOpen(false);
    setIsTemplateModalOpen(false);
    setIsKarmaModalOpen(false);
    setIsAuthModalOpen(false);
    setIsTutorialOpen(false);

    // 4. Aggressively route to /login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  // Supabase Sign Out with state purge
  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AUTH_SIGNOUT_ERR]', err);
    } finally {
      wipeAllClientState();
    }
  }, [wipeAllClientState]);

  // Strict RLS query enforcement for loading user data
  const loadUserDataFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured || !userId) return;

    try {
      // 1. Fetch workspaces for this user
      const { data: wsData, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId);

      if (!wsError && wsData && wsData.length > 0) {
        setWorkspaces(wsData as Workspace[]);
      } else if (!wsError && (!wsData || wsData.length === 0)) {
        // Automatically provision default Personal workspace for new user
        const defaultWs: Workspace = {
          id: crypto.randomUUID(),
          user_id: userId,
          name: 'Personal Space',
          type: 'personal',
          color: '#00f0ff',
          created_at: new Date().toISOString(),
        };
        setWorkspaces([defaultWs]);
        await supabase.from('workspaces').insert([defaultWs]);
      }

      // 2. Fetch projects strictly for this user
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
      if (!projError && projData) {
        setProjects(projData as Project[]);
      }

      // 3. Fetch sections strictly for this user
      const { data: secData, error: secError } = await supabase
        .from('sections')
        .select('*')
        .eq('user_id', userId);
      if (!secError && secData) {
        setSections(secData as Section[]);
      }

      // 4. Fetch tasks strictly for this user
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      if (!taskError && taskData) {
        setTasks(taskData as Task[]);
      }

      // 5. Fetch custom templates strictly for this user
      const { data: tmplData, error: tmplError } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('user_id', userId);
      if (!tmplError && tmplData) {
        setCustomTemplates(tmplData as CustomTemplate[]);
      }
    } catch (err) {
      console.warn('[SUPABASE_DATA_LOAD_FAIL]', err);
    }
  }, []);

  // Hydrate and check authentication
  useEffect(() => {
    let isSubscribed = true;

    const initAuthAndData = async () => {
      try {
        let activeUser: UserProfile | null = null;
        let activeSession: any | null = null;

        if (isSupabaseConfigured) {
          const { data: { session: existingSession }, error } = await supabase.auth.getSession();
          if (!error && existingSession?.user) {
            activeSession = existingSession;
            activeUser = {
              id: existingSession.user.id,
              name: existingSession.user.user_metadata?.name || existingSession.user.email?.split('@')[0] || 'Zenith Operator',
              email: existingSession.user.email || '',
              avatar_url: existingSession.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              role: 'Zenith Operator',
            };
            storage.setUser(activeUser);
          }
        }

        // Check stored user if no supabase session was returned
        if (!activeUser) {
          activeUser = storage.getUser();
        }

        if (isSubscribed) {
          setUserState(activeUser);
          setSessionState(activeSession);

          if (activeUser) {
            // Load user data from local storage
            const storedTasks = storage.getTasks();
            if (storedTasks && storedTasks.length > 0) setTasks(storedTasks);

            const storedWorkspaces = storage.getWorkspaces();
            if (storedWorkspaces && storedWorkspaces.length > 0) setWorkspaces(storedWorkspaces);

            const storedProjects = storage.getProjects();
            if (storedProjects && storedProjects.length > 0) setProjects(storedProjects);

            const storedSections = storage.getSections();
            if (storedSections && storedSections.length > 0) setSections(storedSections);

            const storedKarma = storage.getKarma();
            if (storedKarma) setKarma(storedKarma);

            const storedCustomTemplates = storage.getCustomTemplates();
            if (storedCustomTemplates && storedCustomTemplates.length > 0) setCustomTemplates(storedCustomTemplates);

            // Fetch from Supabase strictly for activeUser.id
            if (isSupabaseConfigured) {
              loadUserDataFromSupabase(activeUser.id);
            }
          } else {
            setTasks([]);
            setWorkspaces([]);
            setProjects([]);
            setSections([]);
            setCustomTemplates([]);
          }

          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/workspace/')) {
            const match = window.location.pathname.match(/^\/workspace\/([^/?#]+)/);
            if (match && match[1]) {
              setActiveViewState(match[1]);
            }
          }

          if (typeof window !== 'undefined' && !localStorage.getItem('aerox_tutorial_completed')) {
            setIsTutorialOpen(true);
          }
        }
      } catch (err) {
        console.warn('Auth and data hydration failed', err);
      } finally {
        if (isSubscribed) {
          setIsHydrated(true);
          setIsAuthLoading(false);
        }
      }
    };

    initAuthAndData();

    // Supabase Auth State Change Listener
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isSubscribed) return;
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            const newUser: UserProfile = {
              id: newSession.user.id,
              name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || 'Zenith Operator',
              email: newSession.user.email || '',
              avatar_url: newSession.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              role: 'Zenith Operator',
            };
            setSessionState(newSession);
            setUserState(newUser);
            storage.setUser(newUser);
            setIsAuthLoading(false);
            loadUserDataFromSupabase(newUser.id);
          }
        } else if (event === 'SIGNED_OUT') {
          wipeAllClientState();
        }
      });
      authListener = data;
    }

    return () => {
      isSubscribed = false;
      authListener?.subscription.unsubscribe();
    };
  }, [loadUserDataFromSupabase, wipeAllClientState]);

  // Synchronize storage on change only when user is present
  useEffect(() => {
    if (!isHydrated || !user) return;
    storage.setTasks(tasks);
  }, [tasks, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    storage.setWorkspaces(workspaces);
  }, [workspaces, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    storage.setProjects(projects);
  }, [projects, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    storage.setSections(sections);
  }, [sections, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    storage.setKarma(karma);
  }, [karma, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    storage.setCustomTemplates(customTemplates);
  }, [customTemplates, isHydrated, user]);

  // Keyboard shortcut listener: Cmd/Ctrl + K opens Quick Add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickAddOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
        setIsTemplateModalOpen(false);
        setIsKarmaModalOpen(false);
        setIsAuthModalOpen(false);
        setIsTutorialOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Supabase Real-time listener for tasks and workspaces with user_id isolation
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    const currentUserId = user.id;

    try {
      const taskChannel = supabase
        .channel(`aerox_tasks_${currentUserId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newTask = payload.new as Task;
              if (newTask.user_id && newTask.user_id !== currentUserId) return;
              setTasks(prev => prev.some(t => t.id === newTask.id) ? prev : [newTask, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Task;
              if (updated.user_id && updated.user_id !== currentUserId) return;
              setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            } else if (payload.eventType === 'DELETE') {
              const deleted = payload.old as { id: string };
              setTasks(prev => prev.filter(t => t.id !== deleted.id));
            }
          }
        )
        .subscribe();

      const wsChannel = supabase
        .channel(`aerox_workspaces_${currentUserId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'workspaces' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newWs = payload.new as Workspace;
              if (newWs.user_id && newWs.user_id !== currentUserId) return;
              setWorkspaces(prev => prev.some(w => w.id === newWs.id) ? prev : [...prev, newWs]);
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Workspace;
              if (updated.user_id && updated.user_id !== currentUserId) return;
              setWorkspaces(prev => prev.map(w => (w.id === updated.id ? updated : w)));
            } else if (payload.eventType === 'DELETE') {
              const deleted = payload.old as { id: string };
              setWorkspaces(prev => prev.filter(w => w.id !== deleted.id));
            }
          }
        )
        .subscribe();

      const tmplChannel = supabase
        .channel(`aerox_templates_${currentUserId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'custom_templates' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newTmpl = payload.new as CustomTemplate;
              if (newTmpl.user_id && newTmpl.user_id !== currentUserId) return;
              setCustomTemplates(prev => prev.some(t => t.id === newTmpl.id) ? prev : [newTmpl, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as CustomTemplate;
              if (updated.user_id && updated.user_id !== currentUserId) return;
              setCustomTemplates(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            } else if (payload.eventType === 'DELETE') {
              const deleted = payload.old as { id: string };
              setCustomTemplates(prev => prev.filter(t => t.id !== deleted.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(taskChannel);
        supabase.removeChannel(wsChannel);
        supabase.removeChannel(tmplChannel);
      };
    } catch (err) {
      console.warn('Realtime channel subscription error:', err);
    }
  }, [user?.id]);

  // Helper: Trigger Confetti Explosion
  const fireConfetti = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#00f0ff', '#ff0055', '#a855f7', '#f59e0b', '#10b981'],
        disableForReducedMotion: true,
      });
    } catch {
      // Ignore if confetti is not available
    }
  }, []);

  // Helper: Update Karma on completion
  const recordKarmaDelta = useCallback((isCompleting: boolean) => {
    const todayStr = formatDate(new Date());
    setKarma(prev => {
      const deltaPoints = isCompleting ? 10 : -10;
      const newPoints = Math.max(0, prev.points + deltaPoints);

      const history = [...prev.history];
      const todayIndex = history.findIndex(h => h.date === todayStr);
      if (todayIndex >= 0) {
        history[todayIndex] = {
          ...history[todayIndex],
          count: Math.max(0, history[todayIndex].count + (isCompleting ? 1 : -1)),
        };
      } else if (isCompleting) {
        history.push({ date: todayStr, count: 1 });
      }

      let streak_days = prev.streak_days;
      if (isCompleting && prev.last_active_date !== todayStr) {
        streak_days += 1;
      }

      return {
        ...prev,
        points: newPoints,
        streak_days,
        history: history.slice(-7),
        last_active_date: todayStr,
      };
    });
  }, []);

  const openAddTaskModal = useCallback((initialData?: Partial<Task>) => {
    setAddTaskInitialData(initialData || null);
    setIsQuickAddOpen(true);
  }, []);

  const openTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerox_tutorial_completed', 'true');
    }
  }, []);

  const openSystemBuilder = useCallback(() => {
    setIsSystemBuilderOpen(true);
  }, []);

  // Synchronized activeView updater
  const setActiveView = useCallback((view: ActiveFilterView) => {
    setActiveViewState(view);
    if (view !== 'inbox' && view !== 'today' && view !== 'upcoming' && view !== 'completed') {
      const proj = projects.find(p => p.id === view);
      if (proj && proj.view_mode) {
        setViewMode(proj.view_mode);
      }
    }
  }, [projects]);

  // Current active workspace derived state
  const currentWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === activeView) || null;
  }, [workspaces, activeView]);

  // Actions with strict RLS user_id enforcement
  const createWorkspace = useCallback(async (workspaceData: Partial<Workspace>): Promise<Workspace> => {
    const activeUserId = user?.id || null;
    const newWs: Workspace = {
      id: crypto.randomUUID(),
      user_id: activeUserId,
      name: workspaceData.name?.trim() || 'New Workspace',
      type: workspaceData.type || 'personal',
      color: workspaceData.color || '#00f0ff',
      created_at: new Date().toISOString(),
    };

    setWorkspaces(prev => [...prev, newWs]);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('workspaces').insert([{
          id: newWs.id,
          name: newWs.name,
          type: newWs.type,
          color: newWs.color,
          user_id: activeUserId,
        }]);
        if (error) {
          console.warn('Supabase workspace insert note (saved locally):', error.message);
        }
      } catch (err) {
        console.warn('Supabase workspace insert error:', err);
      }
    }

    return newWs;
  }, [user?.id]);

  const addTask = useCallback(async (taskData: Partial<Task>): Promise<Task> => {
    const activeUserId = user?.id || null;
    const effectiveWorkspaceId = 
      taskData.workspace_id || 
      (workspaces.some(w => w.id === activeView) ? activeView : (workspaces[0]?.id || 'ws_personal'));

    const taskId = crypto.randomUUID();

    const newTask: Task = {
      id: taskId,
      user_id: activeUserId,
      workspace_id: effectiveWorkspaceId,
      project_id: taskData.project_id || (activeView.startsWith('proj_') ? activeView : null),
      title: taskData.title?.trim() || 'Untitled Task',
      description: taskData.description || '',
      priority: taskData.priority || 'p4',
      completed: taskData.completed ?? false,
      due_date: taskData.due_date || (activeView === 'today' ? formatDate(new Date()) : null),
      deadline: taskData.deadline || null,
      parent_id: taskData.parent_id || null,
      section_id: taskData.section_id || null,
      labels: taskData.labels || [],
      assignee_id: taskData.assignee_id || null,
      order: tasks.length,
      comments: [],
      recurrence: taskData.recurrence || null,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          id: newTask.id,
          user_id: activeUserId,
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          completed: newTask.completed,
          due_date: newTask.due_date,
          workspace_id: newTask.workspace_id,
          assignee_id: newTask.assignee_id,
          created_at: newTask.created_at,
        };

        if (newTask.project_id && projects.some(p => p.id === newTask.project_id)) {
          payload.project_id = newTask.project_id;
        }

        const { error } = await supabase.from('tasks').insert([payload]);
        if (error) {
          console.warn('Supabase task insert note (task preserved locally):', error.message);
        }
      } catch (err: unknown) {
        console.warn('Supabase task insert catch:', err);
      }
    }

    return newTask;
  }, [activeView, tasks.length, workspaces, projects, user?.id]);

  const toggleTask = useCallback((taskId: string) => {
    const activeUserId = user?.id || null;
    setTasks(prev => {
      return prev.map(task => {
        if (task.id === taskId) {
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            fireConfetti();
            recordKarmaDelta(true);
          } else {
            recordKarmaDelta(false);
          }

          const updated: Task = {
            ...task,
            completed: nextCompleted,
            completed_at: nextCompleted ? new Date().toISOString() : null,
          };

          if (isSupabaseConfigured) {
            let q = supabase.from('tasks').update({
              completed: updated.completed,
              completed_at: updated.completed_at,
            }).eq('id', taskId);
            if (activeUserId) q = q.eq('user_id', activeUserId);
            q.then();
          }

          return updated;
        }
        return task;
      });
    });
  }, [fireConfetti, recordKarmaDelta, user?.id]);

  const deleteTask = useCallback((taskId: string) => {
    const activeUserId = user?.id || null;
    setTasks(prev => prev.filter(t => t.id !== taskId && t.parent_id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (isSupabaseConfigured) {
      let q = supabase.from('tasks').delete().eq('id', taskId);
      if (activeUserId) q = q.eq('user_id', activeUserId);
      q.then();
    }
  }, [selectedTaskId, user?.id]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const activeUserId = user?.id || null;
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, ...updates };
        if (isSupabaseConfigured) {
          let q = supabase.from('tasks').update(updates).eq('id', taskId);
          if (activeUserId) q = q.eq('user_id', activeUserId);
          q.then();
        }
        return updated;
      }
      return task;
    }));
  }, [user?.id]);

  const reorderTasks = useCallback((sourceIndex: number, destIndex: number, sectionId?: string | null) => {
    setTasks(prev => {
      const filtered = prev.filter(t => sectionId !== undefined ? t.section_id === sectionId : true);
      const other = prev.filter(t => sectionId !== undefined ? t.section_id !== sectionId : false);

      if (sourceIndex < 0 || sourceIndex >= filtered.length || destIndex < 0 || destIndex >= filtered.length) {
        return prev;
      }

      const reordered = [...filtered];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(destIndex, 0, moved);

      const updatedFiltered = reordered.map((t, idx) => ({ ...t, order: idx }));
      return [...updatedFiltered, ...other];
    });
  }, []);

  const moveTaskStage = useCallback((taskId: string, targetSectionId: string | null, targetCompleted?: boolean) => {
    const activeUserId = user?.id || null;
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const isCompleting = targetCompleted !== undefined ? targetCompleted : task.completed;
        if (isCompleting && !task.completed) {
          fireConfetti();
          recordKarmaDelta(true);
        } else if (!isCompleting && task.completed) {
          recordKarmaDelta(false);
        }

        const updated: Task = {
          ...task,
          section_id: targetSectionId,
          completed: isCompleting,
          completed_at: isCompleting ? new Date().toISOString() : null,
        };

        if (isSupabaseConfigured) {
          let q = supabase.from('tasks').update({
            section_id: targetSectionId,
            completed: isCompleting,
            completed_at: updated.completed_at,
          }).eq('id', taskId);
          if (activeUserId) q = q.eq('user_id', activeUserId);
          q.then();
        }

        return updated;
      }
      return task;
    }));
  }, [fireConfetti, recordKarmaDelta, user?.id]);

  const addSubtask = useCallback((parentId: string, title: string, priority: Priority = 'p4'): Task => {
    const activeUserId = user?.id || null;
    const parentTask = tasks.find(t => t.id === parentId);
    const subtask: Task = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: activeUserId,
      project_id: parentTask ? parentTask.project_id : null,
      section_id: parentTask ? parentTask.section_id : null,
      title: title.trim(),
      description: '',
      priority,
      completed: false,
      due_date: parentTask ? parentTask.due_date : null,
      deadline: null,
      parent_id: parentId,
      labels: parentTask ? [...parentTask.labels] : [],
      assignee_id: null,
      order: 999,
      comments: [],
      created_at: new Date().toISOString(),
    };

    setTasks(prev => [...prev, subtask]);

    if (isSupabaseConfigured) {
      supabase.from('tasks').insert([subtask]).then();
    }

    return subtask;
  }, [tasks, user?.id]);

  const assignTask = useCallback((taskId: string, assigneeId: string | null) => {
    updateTask(taskId, { assignee_id: assigneeId });
  }, [updateTask]);

  const addComment = useCallback((taskId: string, text: string, author?: string) => {
    if (!text.trim()) return;
    const activeUserId = user?.id || null;
    const currentUser = user || storage.getUser();
    const newComment = {
      id: `comm_${Date.now()}`,
      author: author || (currentUser ? currentUser.name : 'Architect'),
      author_avatar: currentUser?.avatar_url,
      text: text.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const comments = [...(task.comments || []), newComment];
        if (isSupabaseConfigured) {
          let q = supabase.from('tasks').update({ comments }).eq('id', taskId);
          if (activeUserId) q = q.eq('user_id', activeUserId);
          q.then();
        }
        return { ...task, comments };
      }
      return task;
    }));
  }, [user]);

  // Project operations
  const createProject = useCallback((projectData: Partial<Project>): Project => {
    const activeUserId = user?.id || null;
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: activeUserId,
      name: projectData.name?.trim() || 'New Project',
      color: projectData.color || '#00f0ff',
      view_mode: projectData.view_mode || 'list',
      is_team: projectData.is_team || false,
      created_at: new Date().toISOString(),
      icon: projectData.icon || 'Folder',
    };

    setProjects(prev => [...prev, newProject]);
    setActiveView(newProject.id);

    if (isSupabaseConfigured) {
      supabase.from('projects').insert([newProject]).then();
    }

    return newProject;
  }, [setActiveView, user?.id]);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    const activeUserId = user?.id || null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, ...updates };
        if (isSupabaseConfigured) {
          let q = supabase.from('projects').update(updates).eq('id', projectId);
          if (activeUserId) q = q.eq('user_id', activeUserId);
          q.then();
        }
        return updated;
      }
      return p;
    }));
  }, [user?.id]);

  const deleteProject = useCallback((projectId: string) => {
    const activeUserId = user?.id || null;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSections((prev: Section[]): Section[] => prev.filter(s => s.project_id !== projectId));
    setTasks(prev => prev.filter(t => t.project_id !== projectId));
    if (activeView === projectId) {
      setActiveView('today');
    }
    if (isSupabaseConfigured) {
      let q = supabase.from('projects').delete().eq('id', projectId);
      if (activeUserId) q = q.eq('user_id', activeUserId);
      q.then();
    }
  }, [activeView, setActiveView, user?.id]);

  // Section operations
  const createSection = useCallback((sectionData: Partial<Section>): Section => {
    const activeUserId = user?.id || null;
    const newSection: Section = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: activeUserId,
      project_id: sectionData.project_id || '',
      name: sectionData.name?.trim() || 'New Section',
      order: sections.filter(s => s.project_id === sectionData.project_id).length,
    };

    setSections((prev: Section[]): Section[] => [...prev, newSection]);

    if (isSupabaseConfigured) {
      supabase.from('sections').insert([newSection]).then();
    }

    return newSection;
  }, [sections, user?.id]);

  const deleteSection = useCallback((sectionId: string) => {
    const activeUserId = user?.id || null;
    setSections((prev: Section[]): Section[] => prev.filter(s => s.id !== sectionId));
    setTasks(prev => prev.map(t => t.section_id === sectionId ? { ...t, section_id: null } : t));
    if (isSupabaseConfigured) {
      let q = supabase.from('sections').delete().eq('id', sectionId);
      if (activeUserId) q = q.eq('user_id', activeUserId);
      q.then();
    }
  }, [user?.id]);

  // Custom System Builder & Launch Logic
  const createCustomTemplate = useCallback(async (templateData: Omit<CustomTemplate, 'id' | 'created_at'> & { id?: string }) => {
    const activeUserId = user?.id || null;
    const newTemplate: CustomTemplate = {
      id: templateData.id || `tmpl_custom_${Date.now()}`,
      user_id: activeUserId,
      name: templateData.name,
      description: templateData.description || '',
      icon: templateData.icon || 'Layers',
      category: templateData.category || 'General',
      color: templateData.color || '#00f0ff',
      system_structure: templateData.system_structure,
      created_at: new Date().toISOString(),
    };
    setCustomTemplates(prev => [newTemplate, ...prev]);
    showToast(`System "${newTemplate.name}" architected and saved to Hub!`, 'success');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('custom_templates').insert([newTemplate]);
      } catch (e) {
        console.warn('Supabase template insert error', e);
      }
    }
    return newTemplate;
  }, [user?.id, showToast]);

  const deleteCustomTemplate = useCallback(async (templateId: string) => {
    const activeUserId = user?.id || null;
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    showToast('System removed from Hub', 'info');
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('custom_templates').delete().eq('id', templateId);
        if (activeUserId) q = q.eq('user_id', activeUserId);
        await q;
      } catch (e) {
        console.warn('Supabase template delete error', e);
      }
    }
  }, [showToast, user?.id]);

  const launchCustomTemplate = useCallback(async (tmpl: CustomTemplate) => {
    const activeUserId = user?.id || null;
    // 1. Create Project
    const newProjId = `proj_${Date.now()}`;
    const newProject: Project = {
      id: newProjId,
      user_id: activeUserId,
      name: tmpl.name,
      color: tmpl.color || '#00f0ff',
      view_mode: tmpl.system_structure.view_mode || 'board',
      is_team: true,
      created_at: new Date().toISOString(),
      icon: tmpl.icon,
    };

    // 2. Parse sections and tasks from JSONB system_structure
    const newSections: Section[] = [];
    const newTasks: Task[] = [];
    const targetWorkspaceId = currentWorkspace ? currentWorkspace.id : (workspaces[0]?.id || 'ws_default');
    const now = new Date();

    (tmpl.system_structure.sections || []).forEach((sec, sIdx) => {
      const secId = `sec_${Date.now()}_${sIdx}`;
      newSections.push({
        id: secId,
        user_id: activeUserId,
        project_id: newProjId,
        name: sec.name,
        order: sIdx,
      });

      (sec.tasks || []).forEach((t, tIdx) => {
        const taskId = `task_${Date.now()}_${sIdx}_${tIdx}`;
        let dueDate: string | null = null;
        if (t.due_days_offset !== undefined) {
          const d = new Date(now);
          d.setDate(d.getDate() + t.due_days_offset);
          dueDate = formatDate(d);
        } else {
          dueDate = formatDate(now);
        }

        const task: Task = {
          id: taskId,
          user_id: activeUserId,
          workspace_id: targetWorkspaceId,
          project_id: newProjId,
          section_id: secId,
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'p3',
          completed: false,
          due_date: dueDate,
          deadline: null,
          parent_id: null,
          labels: t.labels && t.labels.length > 0 ? [...t.labels] : [tmpl.category],
          assignee_id: activeUserId,
          order: tIdx,
          comments: [],
          created_at: new Date().toISOString(),
        };
        newTasks.push(task);

        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach((subTitle, subIdx) => {
            newTasks.push({
              id: `sub_${Date.now()}_${sIdx}_${tIdx}_${subIdx}`,
              user_id: activeUserId,
              workspace_id: targetWorkspaceId,
              project_id: newProjId,
              section_id: secId,
              title: subTitle,
              description: '',
              priority: t.priority || 'p3',
              completed: false,
              due_date: dueDate,
              deadline: null,
              parent_id: taskId,
              labels: t.labels && t.labels.length > 0 ? [...t.labels] : [tmpl.category],
              assignee_id: null,
              order: subIdx,
              comments: [],
              created_at: new Date().toISOString(),
            });
          });
        }
      });
    });

    // 3. Batch-insert into local state
    setProjects(prev => [...prev, newProject]);
    setSections((prev: Section[]): Section[] => [...prev, ...newSections]);
    setTasks(prev => [...newTasks, ...prev]);
    setActiveView(newProjId);
    setIsTemplateModalOpen(false);
    fireConfetti();
    showToast(`System "${tmpl.name}" deployed! Created ${newSections.length} sections and ${newTasks.length} tasks.`, 'success');

    // 4. Batch-insert into Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from('projects').insert([newProject]);
        if (newSections.length > 0) {
          await supabase.from('sections').insert(newSections);
        }
        if (newTasks.length > 0) {
          await supabase.from('tasks').insert(newTasks);
        }
      } catch (e) {
        console.warn('Supabase batch insert error', e);
      }
    }
  }, [currentWorkspace, workspaces, user?.id, fireConfetti, showToast, setActiveView]);

  // Backward compatibility alias for applyTemplate
  const applyTemplate = useCallback((templateId: string) => {
    const tmpl = customTemplates.find(t => t.id === templateId);
    if (tmpl) {
      launchCustomTemplate(tmpl);
    }
  }, [customTemplates, launchCustomTemplate]);

  // Update Karma goals
  const updateKarmaGoals = useCallback((dailyGoal: number, weeklyGoal: number) => {
    setKarma(prev => ({
      ...prev,
      daily_goal: Math.max(1, dailyGoal),
      weekly_goal: Math.max(1, weeklyGoal),
    }));
  }, []);

  const setUser = useCallback((newUser: UserProfile | null) => {
    setUserState(newUser);
    storage.setUser(newUser);
    if (newUser) {
      setIsAuthLoading(false);
      if (isSupabaseConfigured) {
        loadUserDataFromSupabase(newUser.id);
      }
    } else {
      wipeAllClientState();
    }
  }, [loadUserDataFromSupabase, wipeAllClientState]);

  // Computed: currently selected task object
  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Computed: currently active project object
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === activeView) || null;
  }, [projects, activeView]);

  return (
    <AppContext.Provider
      value={{
        isHydrated,
        isAuthLoading,
        session,
        setSessionState,
        signOut,
        tasks,
        projects,
        sections,
        karma,
        user,
        profiles,
        activeView,
        setActiveView,
        viewMode,
        setViewMode,
        currentProject,
        currentWorkspace,
        workspaces,
        createWorkspace,
        isCreateWorkspaceOpen,
        setIsCreateWorkspaceOpen,
        selectedTaskId,
        setSelectedTaskId,
        selectedTask,
        searchQuery,
        setSearchQuery,
        filterPriority,
        setFilterPriority,
        filterLabel,
        setFilterLabel,
        isQuickAddOpen,
        setIsQuickAddOpen,
        openAddTaskModal,
        addTaskInitialData,
        isTemplateModalOpen,
        setIsTemplateModalOpen,
        isKarmaModalOpen,
        setIsKarmaModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isTutorialOpen,
        setIsTutorialOpen,
        openTutorial,
        completeTutorial,
        toasts,
        showToast,
        dismissToast,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        reorderTasks,
        moveTaskStage,
        addSubtask,
        assignTask,
        addComment,
        createProject,
        updateProject,
        deleteProject,
        createSection,
        deleteSection,
        applyTemplate,
        customTemplates,
        createCustomTemplate,
        deleteCustomTemplate,
        launchCustomTemplate,
        isSystemBuilderOpen,
        setIsSystemBuilderOpen,
        openSystemBuilder,
        updateKarmaGoals,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
