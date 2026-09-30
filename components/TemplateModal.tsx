'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Zap, 
  ArrowRight, 
  Cpu, 
  Layers, 
  FolderKanban, 
  Workflow, 
  GitBranch, 
  Boxes, 
  Database, 
  Flame, 
  ShieldAlert, 
  Target,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CustomTemplate } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Layers,
  FolderKanban,
  Workflow,
  Zap,
  GitBranch,
  Boxes,
  Database,
  Sparkles,
  Flame,
  Target,
  ShieldAlert,
};

export function TemplateModal() {
  const { 
    isTemplateModalOpen, 
    setIsTemplateModalOpen, 
    customTemplates, 
    deleteCustomTemplate, 
    launchCustomTemplate,
    openSystemBuilder 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadingTmplId, setLoadingTmplId] = useState<string | null>(null);

  // Dynamically derive categories from user's custom templates (NO hardcoded tabs)
  const categories = useMemo(() => {
    const set = new Set<string>();
    customTemplates.forEach(t => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return ['all', ...Array.from(set)];
  }, [customTemplates]);

  if (!isTemplateModalOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? customTemplates
    : customTemplates.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleLaunch = async (tmpl: CustomTemplate) => {
    setLoadingTmplId(tmpl.id);
    try {
      await launchCustomTemplate(tmpl);
    } finally {
      setLoadingTmplId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, tmpl: CustomTemplate) => {
    e.stopPropagation();
    if (confirm(`Remove system blueprint "${tmpl.name}" from your Hub?`)) {
      deleteCustomTemplate(tmpl.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsTemplateModalOpen(false)} 
      />

      <div className="relative w-full max-w-5xl bg-[#09090b] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.12)] flex flex-col max-h-[85vh] overflow-hidden z-10">
        {/* Glow Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-[#ff0055]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0e12]">
          <div className="flex items-center gap-3">
            {/* Prominent Architect Button on Top Left */}
            <button
              type="button"
              onClick={() => openSystemBuilder()}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs font-mono tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_28px_rgba(0,240,255,0.6)] transition-all active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ ARCHITECT NEW SYSTEM</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-white/10" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  SYSTEM HUB
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {customTemplates.length} Custom Blueprints
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-wide mt-0.5">
                Zenith Custom System Hub
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Bar */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-white/5 bg-[#09090b]/80 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat === 'all' ? 'All Systems' : `#${cat}`}
              </button>
            ))}
          </div>
        )}

        {/* Template Grid or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-2xl bg-black/40 border border-dashed border-white/10 my-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_24px_rgba(0,240,255,0.2)]">
                <Workflow className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-zinc-100 font-mono">
                  No Custom Systems Found
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Architect your first repeatable project architecture with custom stages and default tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSystemBuilder()}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs font-mono tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ARCHITECT FIRST SYSTEM</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(tmpl => {
                const IconComponent = ICON_MAP[tmpl.icon] || Cpu;
                const tmplColor = tmpl.color || '#00f0ff';
                const sectionsList = tmpl.system_structure?.sections || [];
                const totalTasks = sectionsList.reduce((acc, s) => acc + (s.tasks?.length || 0), 0);

                return (
                  <div
                    key={tmpl.id}
                    className="flex flex-col justify-between p-4 rounded-xl bg-black/50 border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all group relative"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div
                          className="p-2.5 rounded-xl border transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${tmplColor}15`,
                            borderColor: `${tmplColor}40`,
                            color: tmplColor,
                            boxShadow: `0 0 14px ${tmplColor}25`,
                          }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                            {tmpl.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, tmpl)}
                            className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                            title="Delete system"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors font-mono tracking-tight">
                        {tmpl.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>

                      {/* Architecture Blueprint summary */}
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between">
                          <span>{sectionsList.length} Stages</span>
                          <span className="text-cyan-400 font-semibold">{totalTasks} Default Tasks</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sectionsList.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 truncate max-w-[130px] font-mono"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Launch Project Button */}
                    <button
                      type="button"
                      onClick={() => handleLaunch(tmpl)}
                      disabled={loadingTmplId === tmpl.id}
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all group/btn shadow-[0_0_12px_rgba(0,240,255,0.08)] hover:shadow-[0_0_18px_rgba(0,240,255,0.2)] active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                      <span>{loadingTmplId === tmpl.id ? 'Deploying Pipeline...' : 'Launch Project'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
