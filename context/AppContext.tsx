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
  Priority 
} from '@/types';
import { storage } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDate } from '@/lib/parser';
import { TEMPLATES } from '@/lib/templates';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppContextType {
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
  // Primary collections with lazy storage initializers
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [sections, setSections] = useState<Section[]>(() => storage.getSections());
  const [karma, setKarma] = useState<KarmaProfile>(() => storage.getKarma());
  const [user, setUserState] = useState<UserProfile | null>(() => storage.getUser());
  const [profiles, setProfiles] = useState<UserProfile[]>(() => storage.getProfiles());

  // Navigation & Filtering
  const [activeView, setActiveViewState] = useState<ActiveFilterView>('today');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterLabel, setFilterLabel] = useState<string | 'all'>('all');

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [addTaskInitialData, setAddTaskInitialData] = useState<Partial<Task> | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isKarmaModalOpen, setIsKarmaModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('aerox_tutorial_completed');
    }
    return false;
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
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

  // Save to storage on change
  useEffect(() => {
    if (tasks.length > 0) storage.setTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (projects.length > 0) storage.setProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (sections.length > 0) storage.setSections(sections);
  }, [sections]);

  useEffect(() => {
    storage.setKarma(karma);
  }, [karma]);

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

  // Supabase Real-time listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    try {
      const channel = supabase
        .channel('aerox_zenith_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newTask = payload.new as Task;
              setTasks(prev => prev.some(t => t.id === newTask.id) ? prev : [newTask, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Task;
              setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            } else if (payload.eventType === 'DELETE') {
              const deleted = payload.old as { id: string };
              setTasks(prev => prev.filter(t => t.id !== deleted.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel subscription error:', err);
    }
  }, []);

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

      // Update history for today
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

      // Check streak days
      let streak_days = prev.streak_days;
      if (isCompleting && prev.last_active_date !== todayStr) {
        streak_days += 1;
      }

      return {
        ...prev,
        points: newPoints,
        streak_days,
        history: history.slice(-7), // Keep last 7 entries
        last_active_date: todayStr,
      };
    });
  }, []);

  // Actions
  const addTask = useCallback(async (taskData: Partial<Task>): Promise<Task> => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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

    // 1. Optimistic Update (zero latency in UI)
    setTasks(prev => [newTask, ...prev]);

    // 2. Persist to Supabase if online/configured
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('tasks').insert([newTask]);
        if (error) {
          // Revert optimistic update
          setTasks(prev => prev.filter(t => t.id !== newTask.id));
          throw new Error(error.message || 'Failed to save task to database.');
        }
      } catch (err: unknown) {
        setTasks(prev => prev.filter(t => t.id !== newTask.id));
        const message = err instanceof Error ? err.message : 'Database insert failed.';
        throw new Error(message);
      }
    }

    return newTask;
  }, [activeView, tasks.length]);

  const toggleTask = useCallback((taskId: string) => {
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
            supabase.from('tasks').update({
              completed: updated.completed,
              completed_at: updated.completed_at,
            }).eq('id', taskId).then();
          }

          return updated;
        }
        return task;
      });
    });
  }, [fireConfetti, recordKarmaDelta]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId && t.parent_id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (isSupabaseConfigured) {
      supabase.from('tasks').delete().eq('id', taskId).then();
    }
  }, [selectedTaskId]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, ...updates };
        if (isSupabaseConfigured) {
          supabase.from('tasks').update(updates).eq('id', taskId).then();
        }
        return updated;
      }
      return task;
    }));
  }, []);

  const reorderTasks = useCallback((sourceIndex: number, destIndex: number, sectionId?: string | null) => {
    setTasks(prev => {
      // Filter tasks belonging to this section or project context
      const filtered = prev.filter(t => sectionId !== undefined ? t.section_id === sectionId : true);
      const other = prev.filter(t => sectionId !== undefined ? t.section_id !== sectionId : false);

      if (sourceIndex < 0 || sourceIndex >= filtered.length || destIndex < 0 || destIndex >= filtered.length) {
        return prev;
      }

      const reordered = [...filtered];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(destIndex, 0, moved);

      // Re-assign orders
      const updatedFiltered = reordered.map((t, idx) => ({ ...t, order: idx }));
      return [...updatedFiltered, ...other];
    });
  }, []);

  const moveTaskStage = useCallback((taskId: string, targetSectionId: string | null, targetCompleted?: boolean) => {
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
          supabase.from('tasks').update({
            section_id: targetSectionId,
            completed: isCompleting,
            completed_at: updated.completed_at,
          }).eq('id', taskId).then();
        }

        return updated;
      }
      return task;
    }));
  }, [fireConfetti, recordKarmaDelta]);

  const addSubtask = useCallback((parentId: string, title: string, priority: Priority = 'p4'): Task => {
    const parentTask = tasks.find(t => t.id === parentId);
    const subtask: Task = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
  }, [tasks]);

  const assignTask = useCallback((taskId: string, assigneeId: string | null) => {
    updateTask(taskId, { assignee_id: assigneeId });
  }, [updateTask]);

  const addComment = useCallback((taskId: string, text: string, author?: string) => {
    if (!text.trim()) return;
    const currentUser = user || storage.getUser();
    const newComment = {
      id: `comm_${Date.now()}`,
      author: author || currentUser.name,
      author_avatar: currentUser.avatar_url,
      text: text.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const comments = [...(task.comments || []), newComment];
        if (isSupabaseConfigured) {
          supabase.from('tasks').update({ comments }).eq('id', taskId).then();
        }
        return { ...task, comments };
      }
      return task;
    }));
  }, [user]);

  // Project operations
  const createProject = useCallback((projectData: Partial<Project>): Project => {
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, ...updates };
        if (isSupabaseConfigured) {
          supabase.from('projects').update(updates).eq('id', projectId).then();
        }
        return updated;
      }
      return p;
    }));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSections((prev: Section[]): Section[] => prev.filter(s => s.project_id !== projectId));
    setTasks(prev => prev.filter(t => t.project_id !== projectId));
    if (activeView === projectId) {
      setActiveView('today');
    }
    if (isSupabaseConfigured) {
      supabase.from('projects').delete().eq('id', projectId).then();
    }
  }, [activeView, setActiveView]);

  // Section operations
  const createSection = useCallback((sectionData: Partial<Section>): Section => {
    const newSection: Section = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      project_id: sectionData.project_id || '',
      name: sectionData.name?.trim() || 'New Section',
      order: sections.filter(s => s.project_id === sectionData.project_id).length,
    };

    setSections((prev: Section[]): Section[] => [...prev, newSection]);

    if (isSupabaseConfigured) {
      supabase.from('sections').insert([newSection]).then();
    }

    return newSection;
  }, [sections]);

  const deleteSection = useCallback((sectionId: string) => {
    setSections((prev: Section[]): Section[] => prev.filter(s => s.id !== sectionId));
    setTasks(prev => prev.map(t => t.section_id === sectionId ? { ...t, section_id: null } : t));
    if (isSupabaseConfigured) {
      supabase.from('sections').delete().eq('id', sectionId).then();
    }
  }, []);

  // Template Launcher Engine
  const applyTemplate = useCallback((templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    // 1. Create Project
    const newProjId = `proj_${Date.now()}_${tmpl.id}`;
    const newProject: Project = {
      id: newProjId,
      name: tmpl.title,
      color: tmpl.color,
      view_mode: tmpl.category === 'tech' ? 'board' : tmpl.category === 'work' ? 'list' : 'calendar',
      is_team: tmpl.category === 'work' || tmpl.category === 'tech',
      created_at: new Date().toISOString(),
      icon: tmpl.icon,
    };

    // 2. Create Sections and Tasks
    const newSections: Section[] = [];
    const newTasks: Task[] = [];
    const now = new Date();

    tmpl.sections.forEach((sec, sIdx) => {
      const secId = `sec_${Date.now()}_${sIdx}`;
      newSections.push({
        id: secId,
        project_id: newProjId,
        name: sec.name,
        order: sIdx,
      });

      sec.tasks.forEach((t, tIdx) => {
        const taskId = `task_${Date.now()}_${sIdx}_${tIdx}`;
        let dueDate: string | null = null;
        if (t.due_days_offset !== undefined) {
          const d = new Date(now);
          d.setDate(d.getDate() + t.due_days_offset);
          dueDate = formatDate(d);
        }

        const task: Task = {
          id: taskId,
          project_id: newProjId,
          section_id: secId,
          title: t.title,
          description: t.description || '',
          priority: t.priority,
          completed: false,
          due_date: dueDate,
          deadline: t.due_days_offset !== undefined && t.due_days_offset <= 1 ? 'Hard Deadline' : null,
          parent_id: null,
          labels: [...t.labels],
          assignee_id: null,
          order: tIdx,
          comments: [],
          created_at: new Date().toISOString(),
        };
        newTasks.push(task);

        // Nested subtasks
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach((subTitle, subIdx) => {
            const subtask: Task = {
              id: `sub_${Date.now()}_${sIdx}_${tIdx}_${subIdx}`,
              project_id: newProjId,
              section_id: secId,
              title: subTitle,
              description: '',
              priority: t.priority,
              completed: false,
              due_date: dueDate,
              deadline: null,
              parent_id: taskId,
              labels: [...t.labels],
              assignee_id: null,
              order: subIdx,
              comments: [],
              created_at: new Date().toISOString(),
            };
            newTasks.push(subtask);
          });
        }
      });
    });

    // Update global state
    setProjects(prev => [...prev, newProject]);
    setSections((prev: Section[]): Section[] => [...prev, ...newSections]);
    setTasks(prev => [...newTasks, ...prev]);
    setActiveView(newProjId);
    setIsTemplateModalOpen(false);
    fireConfetti();

    // Async push to Supabase if configured
    if (isSupabaseConfigured) {
      supabase.from('projects').insert([newProject]).then();
      supabase.from('sections').insert(newSections).then();
      supabase.from('tasks').insert(newTasks).then();
    }
  }, [fireConfetti, setActiveView]);

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
  }, []);

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
