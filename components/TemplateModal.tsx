'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  Briefcase, 
  FolderKanban, 
  Cpu, 
  ShieldAlert, 
  Layers, 
  GraduationCap, 
  CheckCircle2, 
  Target,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TEMPLATES } from '@/lib/templates';
import { ProjectTemplate } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Briefcase,
  FolderKanban,
  Cpu,
  ShieldAlert,
  Layers,
  GraduationCap,
  CheckCircle2,
  Target,
};

export function TemplateModal() {
  const { isTemplateModalOpen, setIsTemplateModalOpen, applyTemplate } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'work' | 'tech' | 'personal'>('all');
  const [loadingTmplId, setLoadingTmplId] = useState<string | null>(null);

  if (!isTemplateModalOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleLaunch = (tmpl: ProjectTemplate) => {
    setLoadingTmplId(tmpl.id);
    setTimeout(() => {
      applyTemplate(tmpl.id);
      setLoadingTmplId(null);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsTemplateModalOpen(false)} 
      />

      <div className="relative w-full max-w-4xl bg-[#0d0e12] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10">
        {/* Glow Accent Border */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-[#ff0055]" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Zenith Template Launcher</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pre-configured, production-grade project systems with sections, tasks, and deadlines
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(false)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-[#09090b]/50">
          {(['all', 'work', 'tech', 'personal'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-semibold capitalize transition-all border-b-2 -mb-px ${
                selectedCategory === cat
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat === 'all' ? 'All Templates' : `${cat} Systems`}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(tmpl => {
            const IconComponent = ICON_MAP[tmpl.icon] || FolderKanban;
            const totalTasks = tmpl.sections.reduce((acc, s) => acc + s.tasks.length, 0);

            return (
              <div
                key={tmpl.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.02] transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className="p-2.5 rounded-xl border"
                      style={{
                        backgroundColor: `${tmpl.color}15`,
                        borderColor: `${tmpl.color}40`,
                        color: tmpl.color,
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                      {tmpl.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* Sections preview */}
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                    <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between">
                      <span>Includes {tmpl.sections.length} stages:</span>
                      <span className="text-cyan-400">{totalTasks} tasks</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tmpl.sections.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 truncate max-w-[130px]"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={() => handleLaunch(tmpl)}
                  disabled={loadingTmplId === tmpl.id}
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group/btn"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{loadingTmplId === tmpl.id ? 'Seeding...' : 'Launch Project'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
