'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  Clock, 
  Calendar, 
  User, 
  Folder, 
  MessageSquare, 
  Plus, 
  Send,
  Flag,
  Tag
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Priority, Task } from '@/types';

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'p1', label: 'P1 Urgent', color: '#ff0055' },
  { value: 'p2', label: 'P2 High', color: '#f59e0b' },
  { value: 'p3', label: 'P3 Medium', color: '#00f0ff' },
  { value: 'p4', label: 'P4 Low', color: '#71717a' },
];

function TaskDrawerContent({ task }: { task: Task }) {
  const { 
    setSelectedTaskId, 
    tasks, 
    updateTask, 
    toggleTask, 
    deleteTask, 
    addSubtask, 
    addComment, 
    projects, 
    sections, 
    profiles 
  } = useApp();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Find subtasks of this task
  const subtasks = tasks.filter(t => t.parent_id === task.id);
  const projectSections = task.project_id 
    ? sections.filter(s => s.project_id === task.project_id)
    : [];

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description: description.trim() });
    }
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim(), task.priority);
    setNewSubtaskTitle('');
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    const currentTags = task.labels || [];
    if (!currentTags.includes(newTagText.trim())) {
      updateTask(task.id, { labels: [...currentTags, newTagText.trim()] });
    }
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = task.labels || [];
    updateTask(task.id, { labels: currentTags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setSelectedTaskId(null)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 md:pl-10">
        {/* Drawer Container: Responsive slide-over desktop & bottom sheet mobile */}
        <div className="w-screen max-w-lg md:max-w-xl bg-[#0d0e12] border-t md:border-t-0 md:border-l border-white/10 shadow-2xl flex flex-col h-[75vh] md:h-full mt-auto md:mt-0 rounded-t-2xl md:rounded-none overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-200">
          {/* Mobile Handle Indicator */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2 md:hidden" />

          {/* Top Bar Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#09090b]">
            <div className="flex items-center gap-3">
              {/* Checkbox Toggle */}
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-cyan-400 border-cyan-400 text-zinc-950 shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                    : 'border-zinc-600 hover:border-cyan-400'
                }`}
                title={task.completed ? 'Mark incomplete' : 'Mark complete (+10 Karma)'}
              >
                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <span className="text-xs font-mono text-zinc-500">
                {task.completed ? 'Delivered' : 'In Progress'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="p-2 rounded-xl text-zinc-500 hover:text-[#ff0055] hover:bg-[#ff0055]/10 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-0 border-none p-0"
                placeholder="Task title..."
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 font-mono">
                Context & Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Add contextual details, technical notes, or documentation links..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-y"
              />
            </div>

            {/* Metadata Grid: Project, Section, Priority, Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-black/30 border border-white/5 rounded-xl text-xs">
              {/* Project selector */}
              <div>
                <span className="text-zinc-400 block mb-1 font-mono flex items-center gap-1">
                  <Folder className="w-3 h-3 text-zinc-400" />
                  Project
                </span>
                <select
                  value={task.project_id || ''}
                  onChange={(e) => updateTask(task.id, { project_id: e.target.value || null, section_id: null })}
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Inbox (Unassigned)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Section selector */}
              {projectSections.length > 0 && (
                <div>
                  <span className="text-zinc-400 block mb-1 font-mono">Section</span>
                  <select
                    value={task.section_id || ''}
                    onChange={(e) => updateTask(task.id, { section_id: e.target.value || null })}
                    className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">No Section</option>
                    {projectSections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority selector */}
              <div>
                <span className="text-zinc-400 block mb-1 font-mono flex items-center gap-1">
                  <Flag className="w-3 h-3 text-zinc-400" />
                  Priority
                </span>
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Assignee selector */}
              <div>
                <span className="text-zinc-400 block mb-1 font-mono flex items-center gap-1">
                  <User className="w-3 h-3 text-zinc-400" />
                  Assignee
                </span>
                <select
                  value={task.assignee_id || ''}
                  onChange={(e) => updateTask(task.id, { assignee_id: e.target.value || null })}
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Unassigned</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                  ))}
                </select>
              </div>

              {/* Due Date input */}
              <div>
                <span className="text-zinc-400 block mb-1 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Due Date
                </span>
                <input
                  type="date"
                  value={task.due_date || ''}
                  onChange={(e) => updateTask(task.id, { due_date: e.target.value || null })}
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              {/* Hard External Deadline input */}
              <div>
                <span className="text-zinc-400 block mb-1 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#ff0055]" />
                  Hard Deadline
                </span>
                <input
                  type="text"
                  value={task.deadline || ''}
                  onChange={(e) => updateTask(task.id, { deadline: e.target.value || null })}
                  placeholder="e.g. Friday 5pm, EOD"
                  className="w-full bg-[#12131a] border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            {/* Labels / Tags Manager */}
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2 font-mono flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-400" />
                <span>Tags & Labels</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.labels?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-violet-950/40 border border-violet-500/30 text-violet-300"
                  >
                    <span>@{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-violet-400 hover:text-violet-100 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isAddingTag ? (
                  <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      placeholder="Tag name..."
                      className="bg-black/50 border border-violet-500/40 rounded-lg px-2 py-0.5 text-xs text-zinc-200 focus:outline-none"
                    />
                    <button type="submit" className="text-xs text-violet-400 font-bold px-1">Add</button>
                    <button type="button" onClick={() => setIsAddingTag(false)} className="text-xs text-zinc-500">×</button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
                </span>
              </div>

              {/* Subtask list */}
              <div className="space-y-2 mb-3">
                {subtasks.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTask(sub.id)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          sub.completed ? 'bg-cyan-400 border-cyan-400 text-zinc-950' : 'border-zinc-600 hover:border-cyan-400'
                        }`}
                      >
                        {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <span className={`truncate ${sub.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {sub.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTask(sub.id)}
                      className="text-zinc-600 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Subtask Form */}
              <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask step..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Contextual Collaboration Comments Feed */}
            <div className="pt-4 border-t border-white/5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3 font-mono flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Discussion & Activity ({task.comments?.length || 0})</span>
              </span>

              {/* Comments Stream */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {task.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-2.5 p-3 rounded-xl bg-black/30 border border-white/5 text-xs">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-cyan-950 border border-cyan-500/40 text-[10px] font-bold text-cyan-400 flex items-center justify-center">
                      {comment.author_avatar ? (
                        <img src={comment.author_avatar} alt={comment.author} className="w-full h-full object-cover" />
                      ) : (
                        comment.author[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-zinc-300">{comment.author}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">{comment.date}</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed break-words">{comment.text}</p>
                    </div>
                  </div>
                ))}

                {(!task.comments || task.comments.length === 0) && (
                  <p className="text-xs text-zinc-600 italic">No notes or comments logged yet. Leave the first one below.</p>
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddCommentSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Leave a note or feedback..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="p-2 bg-cyan-500 text-zinc-950 rounded-xl font-bold hover:bg-cyan-400 disabled:opacity-40 transition-colors"
                  title="Send comment"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskDrawer() {
  const { selectedTaskId, selectedTask } = useApp();

  if (!selectedTaskId || !selectedTask) return null;

  return <TaskDrawerContent key={selectedTaskId} task={selectedTask} />;
}
