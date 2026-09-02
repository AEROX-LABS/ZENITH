'use client';

import React, { useState, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  Plus, 
  Clock, 
  Check, 
  MessageSquare, 
  Tag, 
  Calendar 
} from 'lucide-react';
import { Task, Section, Priority } from '@/types';
import { useApp } from '@/context/AppContext';

interface KanbanColumnData {
  id: string;
  title: string;
  isDoneStage: boolean;
  tasks: Task[];
}

const PRIORITY_BADGES: Record<Priority, { border: string; text: string; bg: string }> = {
  p1: { border: 'border-[#ff0055]/50', text: 'text-[#ff0055]', bg: 'bg-[#ff0055]/10' },
  p2: { border: 'border-[#f59e0b]/50', text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10' },
  p3: { border: 'border-[#00f0ff]/50', text: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10' },
  p4: { border: 'border-zinc-700/50', text: 'text-zinc-400', bg: 'bg-zinc-800/30' },
};

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const { 
    currentProject, 
    sections, 
    moveTaskStage, 
    addTask, 
    setSelectedTaskId, 
    toggleTask,
    profiles 
  } = useApp();
  
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Filter out subtasks from the top-level board columns (they are tracked within their parent cards)
  const topLevelTasks = tasks.filter(t => !t.parent_id);

  // Determine board columns
  const projectSections = currentProject 
    ? sections.filter(s => s.project_id === currentProject.id)
    : [];

  let columns: KanbanColumnData[] = [];

  if (projectSections.length > 0) {
    // Use project custom sections as columns
    columns = projectSections.map(sec => {
      const isDone = sec.name.toLowerCase().includes('done') || 
                     sec.name.toLowerCase().includes('shipped') || 
                     sec.name.toLowerCase().includes('closed') ||
                     sec.name.toLowerCase().includes('verified');
      return {
        id: sec.id,
        title: sec.name,
        isDoneStage: isDone,
        tasks: topLevelTasks.filter(t => t.section_id === sec.id),
      };
    });

    // Also collect any tasks in this project without a section
    const unsectionedTasks = topLevelTasks.filter(t => !t.section_id);
    if (unsectionedTasks.length > 0) {
      columns.unshift({
        id: 'unsectioned',
        title: 'General Backlog',
        isDoneStage: false,
        tasks: unsectionedTasks,
      });
    }
  } else {
    // Default 3 standard stages: To Do, In Progress, Done
    columns = [
      {
        id: 'stage_todo',
        title: 'To Do',
        isDoneStage: false,
        tasks: topLevelTasks.filter(t => !t.completed && (!t.section_id || t.section_id === 'stage_todo')),
      },
      {
        id: 'stage_progress',
        title: 'In Progress',
        isDoneStage: false,
        tasks: topLevelTasks.filter(t => !t.completed && t.section_id === 'stage_progress'),
      },
      {
        id: 'stage_done',
        title: 'Done',
        isDoneStage: true,
        tasks: topLevelTasks.filter(t => t.completed || t.section_id === 'stage_done'),
      },
    ];
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destColId = destination.droppableId;
    const targetCol = columns.find(c => c.id === destColId);
    const isDone = targetCol?.isDoneStage || destColId === 'stage_done';

    // Update task's section and completed status
    moveTaskStage(
      draggableId, 
      destColId.startsWith('stage_') || destColId === 'unsectioned' ? null : destColId, 
      isDone
    );
  };

  const handleQuickAddSubmit = (columnId: string, isDoneStage: boolean) => {
    if (!newCardTitle.trim()) return;
    const isDefaultStage = columnId.startsWith('stage_') || columnId === 'unsectioned';
    addTask({
      title: newCardTitle.trim(),
      section_id: isDefaultStage ? null : columnId,
      project_id: currentProject ? currentProject.id : null,
      completed: isDoneStage,
    });
    setNewCardTitle('');
    setAddingToCol(null);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-500 font-mono text-xs">
        Initializing Kanban Engine...
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-220px)]">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-[#0d0e12]/90 border border-white/5 rounded-2xl p-3 flex flex-col max-h-[calc(100vh-200px)] shadow-lg"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    column.isDoneStage 
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                      : column.id.includes('progress')
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                  }`}
                />
                <h3 className="text-sm font-semibold text-zinc-200">{column.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 font-mono">
                  {column.tasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAddingToCol(column.id)}
                className="p-1 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                title="Add task to stage"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Droppable Task Container */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto py-2 space-y-2.5 min-h-[120px] transition-colors rounded-xl ${
                    snapshot.isDraggingOver ? 'bg-cyan-950/20 ring-1 ring-cyan-500/30' : ''
                  }`}
                >
                  {column.tasks.map((task, index) => {
                    const badge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.p4;
                    const assignee = profiles.find(p => p.id === task.assignee_id);
                    const subtasks = tasks.filter(t => t.parent_id === task.id);
                    const completedSubtasks = subtasks.filter(s => s.completed).length;

                    return (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                              dragSnapshot.isDragging
                                ? 'bg-[#181924] border-cyan-400 shadow-2xl scale-[1.02] rotate-1 z-50'
                                : 'bg-black/40 hover:bg-white/5 border-white/5 hover:border-white/15'
                            } ${task.completed ? 'opacity-60 line-through' : ''}`}
                          >
                            {/* Card Top Row: Priority & Quick Toggle */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded border ${badge.border} ${badge.text} ${badge.bg}`}
                              >
                                {task.priority.toUpperCase()}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTask(task.id);
                                }}
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                  task.completed
                                    ? 'bg-cyan-400 border-cyan-400 text-zinc-950'
                                    : 'border-zinc-700 hover:border-cyan-400'
                                }`}
                              >
                                {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </button>
                            </div>

                            {/* Card Title */}
                            <h4 className="text-sm font-medium text-zinc-200 leading-snug line-clamp-2">
                              {task.title}
                            </h4>

                            {/* Card Description Preview */}
                            {task.description && (
                              <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-normal">
                                {task.description}
                              </p>
                            )}

                            {/* Subtask count */}
                            {subtasks.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span>Subtasks: {completedSubtasks}/{subtasks.length}</span>
                              </div>
                            )}

                            {/* Card Bottom Meta */}
                            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/5 text-[11px] text-zinc-500">
                              <div className="flex items-center gap-2">
                                {task.due_date && (
                                  <span className="flex items-center gap-1 text-zinc-400">
                                    <Calendar className="w-3 h-3 text-cyan-400" />
                                    <span>{task.due_date}</span>
                                  </span>
                                )}

                                {task.deadline && (
                                  <span className="flex items-center gap-1 text-[#ff0055]">
                                    <Clock className="w-3 h-3" />
                                    <span className="font-mono">{task.deadline}</span>
                                  </span>
                                )}

                                {task.comments?.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{task.comments.length}</span>
                                  </span>
                                )}
                              </div>

                              {assignee && (
                                <div
                                  className="w-5 h-5 rounded-full overflow-hidden border border-cyan-500/40"
                                  title={`Assigned to ${assignee.name}`}
                                >
                                  {assignee.avatar_url ? (
                                    <img
                                      src={assignee.avatar_url}
                                      alt={assignee.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                                      {assignee.name[0]}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Quick Card Input Form at Bottom */}
            {addingToCol === column.id ? (
              <div className="mt-2 pt-2 border-t border-white/5">
                <textarea
                  autoFocus
                  rows={2}
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickAddSubmit(column.id, column.isDoneStage);
                    }
                  }}
                  placeholder="Task title... (Enter to save)"
                  className="w-full bg-black/60 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToCol(null);
                      setNewCardTitle('');
                    }}
                    className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddSubmit(column.id, column.isDoneStage)}
                    className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-medium transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingToCol(column.id)}
                className="mt-2 py-2 flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 hover:bg-white/5 rounded-xl border border-dashed border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
