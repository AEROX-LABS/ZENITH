'use client';

import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Clock, 
  Plus, 
  GripVertical,
  MessageSquare,
  Tag
} from 'lucide-react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Task, Priority } from '@/types';
import { useApp } from '@/context/AppContext';

interface TaskItemProps {
  task: Task;
  subtasks?: Task[];
  isSubtask?: boolean;
  isLastSubtask?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const PRIORITY_STYLES: Record<Priority, { border: string; bg: string; text: string; glow: string }> = {
  p1: {
    border: 'border-[#ff0055]',
    bg: 'bg-[#ff0055]/10 hover:bg-[#ff0055]/20',
    text: 'text-[#ff0055]',
    glow: 'shadow-[0_0_12px_rgba(255,0,85,0.4)]',
  },
  p2: {
    border: 'border-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20',
    text: 'text-[#f59e0b]',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  p3: {
    border: 'border-[#00f0ff]',
    bg: 'bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20',
    text: 'text-[#00f0ff]',
    glow: 'shadow-[0_0_12px_rgba(0,240,255,0.3)]',
  },
  p4: {
    border: 'border-zinc-700',
    bg: 'bg-zinc-800/20 hover:bg-zinc-800/40',
    text: 'text-zinc-400',
    glow: '',
  },
};

export function TaskItem({
  task,
  subtasks = [],
  isSubtask = false,
  _isLastSubtask,
  dragHandleProps,
}: TaskItemProps & { _isLastSubtask?: boolean }) {
  const { toggleTask, setSelectedTaskId, addSubtask, projects, profiles } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.p4;
  const project = projects.find(p => p.id === task.project_id);
  const assignee = profiles.find(pr => pr.id === task.assignee_id);
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasksCount = subtasks.filter(s => s.completed).length;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(task.id);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim(), task.priority);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    setIsExpanded(true);
  };

  return (
    <div className="relative group/task select-none">
      {/* Branching SVG/CSS Guide Lines for Subtask */}
      {isSubtask && (
        <div className="absolute -left-6 top-0 bottom-1/2 w-5 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-lg pointer-events-none" />
      )}

      {/* Main Task Row */}
      <div
        onClick={() => setSelectedTaskId(task.id)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          task.completed
            ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-500 opacity-60'
            : 'bg-[#0d0e12]/80 hover:bg-[#13141c] border-white/5 hover:border-white/15 text-zinc-200 shadow-sm'
        } ${isSubtask ? 'text-sm py-2' : ''}`}
      >
        {/* Drag Handle */}
        {!isSubtask && dragHandleProps && (
          <div
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover/task:opacity-100 transition-opacity cursor-grab active:cursor-grabbing -ml-1"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Expand/Collapse Toggle for Parent Task */}
        {hasSubtasks ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors -ml-1"
            title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            )}
          </button>
        ) : !isSubtask ? (
          <div className="w-4" />
        ) : null}

        {/* Neon Checkbox Ring */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
            task.completed
              ? 'bg-[#00f0ff] border-[#00f0ff] text-zinc-950 shadow-[0_0_10px_rgba(0,240,255,0.6)]'
              : `${pStyle.border} ${pStyle.bg} hover:scale-110`
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete (+10 Karma)'}
        >
          {task.completed ? (
            <Check className="w-3 h-3 stroke-[3]" />
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full ${pStyle.text} opacity-0 group-hover/task:opacity-100 transition-opacity`} />
          )}
        </button>

        {/* Task Content: Title & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-medium truncate transition-all ${
                task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
              }`}
            >
              {task.title}
            </span>

            {/* Subtask count badge */}
            {hasSubtasks && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-mono">
                {completedSubtasksCount}/{subtasks.length}
              </span>
            )}

            {/* Priority Indicator Pill */}
            {task.priority !== 'p4' && (
              <span
                className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded border ${pStyle.border} ${pStyle.text} bg-black/40`}
              >
                {task.priority.toUpperCase()}
              </span>
            )}

            {/* Project Badge */}
            {project && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate max-w-[120px]">{project.name}</span>
              </span>
            )}
          </div>

          {/* Description Preview (if any) */}
          {task.description && !task.completed && (
            <p className="text-xs text-zinc-400 truncate mt-0.5 font-normal">
              {task.description}
            </p>
          )}
        </div>

        {/* Right Metadata: Tags, Dates, Deadline, Comments, Assignee */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Labels / Tags */}
          {task.labels && task.labels.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {task.labels.slice(0, 2).map((label, idx) => (
                <span
                  key={idx}
                  className="text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-0.5"
                >
                  <Tag className="w-2.5 h-2.5 text-zinc-500" />
                  {label}
                </span>
              ))}
              {task.labels.length > 2 && (
                <span className="text-[10px] text-zinc-500">+{task.labels.length - 2}</span>
              )}
            </div>
          )}

          {/* Hard External Deadline Badge */}
          {task.deadline && (
            <span className="flex items-center gap-1 text-[11px] text-[#ff0055] bg-[#ff0055]/10 border border-[#ff0055]/30 px-2 py-0.5 rounded-md font-mono">
              <Clock className="w-3 h-3 text-[#ff0055]" />
              <span className="hidden md:inline">{task.deadline}</span>
            </span>
          )}

          {/* Due Date */}
          {task.due_date && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>{task.due_date}</span>
            </span>
          )}

          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </span>
          )}

          {/* Assignee Avatar */}
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

      {/* Subtasks Container with Branching Guide Lines */}
      {hasSubtasks && isExpanded && (
        <div className="relative pl-7 mt-1.5 space-y-1.5">
          {/* Vertical Branch Guide Line */}
          <div className="absolute left-3.5 top-0 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/30 via-cyan-500/15 to-transparent pointer-events-none" />

          {subtasks.map((sub, idx) => (
            <TaskItem
              key={sub.id}
              task={sub}
              isSubtask={true}
              isLastSubtask={idx === subtasks.length - 1}
            />
          ))}
        </div>
      )}

      {/* Inline "+ Add Subtask" Action */}
      {!isSubtask && isExpanded && (
        <div className="pl-7 mt-1">
          {isAddingSubtask ? (
            <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 py-1">
              <input
                type="text"
                autoFocus
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Subtask title... (Press Enter to save)"
                className="flex-1 bg-black/50 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubtask(false);
                  setNewSubtaskTitle('');
                }}
                className="px-2 py-1.5 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors group/subbtn"
            >
              <Plus className="w-3 h-3 text-zinc-500 group-hover/subbtn:text-cyan-400 transition-colors" />
              <span>Add subtask</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
