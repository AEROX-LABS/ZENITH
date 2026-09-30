'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { X, Tag, Folder, UserCheck, Sparkles, Check, Hash } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// Cybernetic Palette swatches as requested
export const HUE_PALETTE = [
  { name: 'Electric Cyan', hex: '#00E0FF' },
  { name: 'Cyber Magenta', hex: '#FF006E' },
  { name: 'Phosphor Emerald', hex: '#00F5D4' },
  { name: 'Solar Amber', hex: '#F59E0B' },
  { name: 'Deep Violet', hex: '#8B5CF6' },
  { name: 'Neon Blue', hex: '#3B82F6' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Teal', hex: '#14B8A6' },
];

// Tactical Reticle Micro-Brackets (┌ ┐ └ ┘)
export function ReticleHUD({
  active,
  color = '#00E0FF',
  offset = -4,
}: {
  active?: boolean;
  color?: string;
  offset?: number;
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none z-20"
        >
          <span
            className="absolute text-[11px] font-mono leading-none select-none transition-colors"
            style={{ top: offset, left: offset, color, textShadow: `0 0 8px ${color}` }}
          >
            ┌
          </span>
          <span
            className="absolute text-[11px] font-mono leading-none select-none transition-colors"
            style={{ top: offset, right: offset, color, textShadow: `0 0 8px ${color}` }}
          >
            ┐
          </span>
          <span
            className="absolute text-[11px] font-mono leading-none select-none transition-colors"
            style={{ bottom: offset, left: offset, color, textShadow: `0 0 8px ${color}` }}
          >
            └
          </span>
          <span
            className="absolute text-[11px] font-mono leading-none select-none transition-colors"
            style={{ bottom: offset, right: offset, color, textShadow: `0 0 8px ${color}` }}
          >
            ┘
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Magnetic Button Wrapper with elastic spring physics (gravitating 4-6px toward cursor)
export function MagneticButton({
  children,
  className = '',
  distance = 6,
  onClick,
  disabled = false,
  type = 'button',
  style = {},
  title,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  title?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 400, damping: 25 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    x.set(deltaX * distance);
    y.set(deltaY * distance);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      title={title}
      style={{ x: springX, y: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative ${className}`}
    >
      <ReticleHUD active={isHovered} color={style.borderColor as string || '#00E0FF'} />
      {children}
    </motion.button>
  );
}

export function DynamicEntityModal() {
  const {
    isEntityModalOpen,
    setIsEntityModalOpen,
    entityModalTab,
    setEntityModalTab,
    createLabel,
    createProject,
    createAssignee,
    showToast,
  } = useApp();

  // Selected hue state (defaulting to Electric Cyan)
  const [selectedColor, setSelectedColor] = useState<string>('#00E0FF');
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Form states
  const [labelName, setLabelName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectViewMode, setProjectViewMode] = useState<'list' | 'board'>('list');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [assigneeRole, setAssigneeRole] = useState('Senior Operative');

  // Input focus reticle state
  const [inputFocused, setInputFocused] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);

  // Dynamic Specular Torchlight mouse-tracking state
  const [pointerPos, setPointerPos] = useState({ x: -500, y: -500 });
  const [isPointerInside, setIsPointerInside] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset inputs when modal opens or tab changes
  useEffect(() => {
    if (isEntityModalOpen) {
      setLabelName('');
      setProjectName('');
      setAssigneeName('');
      setAssigneeEmail('');
      setAssigneeRole('Senior Operative');
      if (entityModalTab === 'project') setSelectedColor('#00E0FF');
      else if (entityModalTab === 'label') setSelectedColor('#FF006E');
      else setSelectedColor('#00F5D4');
    }
  }, [isEntityModalOpen, entityModalTab]);

  // Handle Specular Torchlight movement
  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsPointerInside(true);
  };

  const handleModalMouseLeave = () => {
    setIsPointerInside(false);
  };

  if (!isEntityModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (entityModalTab === 'label') {
        if (!labelName.trim()) {
          showToast('ENTER A VALID LABEL TAG NAME', 'error');
          return;
        }
        await createLabel({
          name: labelName.trim().toUpperCase(),
          color: selectedColor,
        });
      } else if (entityModalTab === 'project') {
        if (!projectName.trim()) {
          showToast('ENTER A VALID PROJECT NAME', 'error');
          return;
        }
        createProject({
          name: projectName.trim(),
          color: selectedColor,
          view_mode: projectViewMode,
          is_team: false,
        });
        showToast(`[SYS_ENTITY] PROJECT "${projectName.trim().toUpperCase()}" INITIALIZED!`, 'success');
      } else if (entityModalTab === 'assignee') {
        if (!assigneeName.trim() || !assigneeEmail.trim()) {
          showToast('ENTER OPERATIVE NAME AND COMM LINK (EMAIL)', 'error');
          return;
        }
        await createAssignee({
          name: assigneeName.trim(),
          email: assigneeEmail.trim(),
          role: assigneeRole.trim(),
        });
      }

      setIsEntityModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'PROTOCOL EXECUTION FAILED', 'error');
    }
  };

  const activeColor = hoveredColor || selectedColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Outer Obsidian Modal Shell with Dynamic Hue Border Glow */}
      <motion.div
        ref={modalRef}
        onMouseMove={handleModalMouseMove}
        onMouseLeave={handleModalMouseLeave}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl rounded-2xl bg-[#000101]/95 border text-zinc-100 shadow-2xl overflow-hidden font-mono select-none"
        style={{
          borderColor: `${activeColor}40`,
          boxShadow: `0 0 50px ${activeColor}15, 0 20px 40px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Dynamic Specular Torchlight Glass Layer (radial gradient tracking pointer) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            opacity: isPointerInside ? 1 : 0,
            background: `radial-gradient(300px circle at ${pointerPos.x}px ${pointerPos.y}px, ${activeColor}20, transparent 70%)`,
          }}
        />

        {/* Modal Corner Reticles */}
        <div className="absolute top-2 left-2 text-[10px] text-cyan-400/40 pointer-events-none select-none">┌</div>
        <div className="absolute top-2 right-2 text-[10px] text-cyan-400/40 pointer-events-none select-none">┐</div>
        <div className="absolute bottom-2 left-2 text-[10px] text-cyan-400/40 pointer-events-none select-none">└</div>
        <div className="absolute bottom-2 right-2 text-[10px] text-cyan-400/40 pointer-events-none select-none">┘</div>

        {/* Top Header Banner */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping absolute"
              style={{ backgroundColor: activeColor }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeColor, boxShadow: `0 0 10px ${activeColor}` }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest text-cyan-400 flex items-center gap-1.5 font-mono uppercase">
                ● DYNAMIC_ENTITY_CREATION // PROTOCOL
              </span>
              <span className="text-[10px] text-zinc-500 tracking-wider">
                CORE KERNEL REGISTRY // SUBSYSTEM INGESTION
              </span>
            </div>
          </div>

          {/* Tactical Close Button [X] with Reticle HUD on hover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsEntityModalOpen(false)}
              onMouseEnter={() => setCloseHovered(true)}
              onMouseLeave={() => setCloseHovered(false)}
              className="relative p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/40 transition-colors"
              title="Abort Protocol [ESC]"
            >
              <ReticleHUD active={closeHovered} color={activeColor} offset={-3} />
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Segmented Navigation Tabs */}
        <div className="relative z-10 flex border-b border-white/10 bg-black/40 px-6 pt-3 gap-2">
          {(
            [
              { id: 'project', label: '[+] PROJECT', icon: Folder },
              { id: 'label', label: '[+] LABEL', icon: Tag },
              { id: 'assignee', label: '[+] ASSIGNEE', icon: UserCheck },
            ] as const
          ).map(tab => {
            const isActive = entityModalTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEntityModalTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold transition-all rounded-t-lg ${
                  isActive
                    ? 'text-white bg-white/[0.04]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF006E]' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>

                {/* Active Tab Underlined Neon Glow (Cyber Magenta #FF006E) */}
                {isActive && (
                  <motion.div
                    layoutId="activeEntityTab"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF006E] shadow-[0_0_12px_#FF006E]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-6">
          {/* TAB 1: [+] LABEL */}
          {entityModalTab === 'label' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>LABEL TAG NAME</span>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-normal">AUTO-UPPERCASE</span>
                </label>

                {/* Input Container with Tactical Reticle & Focus Hue Illumination */}
                <div
                  className="relative rounded-xl transition-all duration-200"
                  style={{
                    boxShadow: inputFocused ? `0 0 16px ${selectedColor}40` : 'none',
                  }}
                >
                  <ReticleHUD active={inputFocused} color={selectedColor} offset={-4} />
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-zinc-500 font-mono text-xs">#</span>
                    <input
                      type="text"
                      autoFocus
                      value={labelName}
                      onChange={(e) => setLabelName(e.target.value.toUpperCase())}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      placeholder="E.G. CRITICAL, P1, INFRA, HOTFIX"
                      style={{
                        borderColor: inputFocused ? selectedColor : 'rgba(255,255,255,0.1)',
                        caretColor: selectedColor,
                      }}
                      className="w-full bg-[#0d0e12] border rounded-xl pl-8 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 tracking-wider focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tag Preview Live Box */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">HUD PREVIEW:</span>
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 tracking-wider"
                  style={{
                    color: selectedColor,
                    borderColor: `${selectedColor}60`,
                    backgroundColor: `${selectedColor}15`,
                    boxShadow: `0 0 12px ${selectedColor}30`,
                  }}
                >
                  <Hash className="w-3 h-3" />
                  {labelName.trim() ? labelName : 'LIVE_SAMPLE'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: [+] PROJECT */}
          {entityModalTab === 'project' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PROJECT DESIGNATION</span>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-normal">WORKSPACE BOUND</span>
                </label>

                <div
                  className="relative rounded-xl transition-all duration-200"
                  style={{
                    boxShadow: inputFocused ? `0 0 16px ${selectedColor}40` : 'none',
                  }}
                >
                  <ReticleHUD active={inputFocused} color={selectedColor} offset={-4} />
                  <input
                    type="text"
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="E.G. QUANTUM CORE, NEURAL API, INFRA-9"
                    style={{
                      borderColor: inputFocused ? selectedColor : 'rgba(255,255,255,0.1)',
                      caretColor: selectedColor,
                    }}
                    className="w-full bg-[#0d0e12] border rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 tracking-wider focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* View Layout Mode Selector */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
                  INITIAL VIEW ARCHITECTURE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectViewMode('list')}
                    className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                      projectViewMode === 'list'
                        ? 'bg-white/10 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-black/30 text-zinc-500 border-white/5 hover:text-zinc-300'
                    }`}
                  >
                    LIST VIEW (LINEAR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectViewMode('board')}
                    className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                      projectViewMode === 'board'
                        ? 'bg-white/10 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-black/30 text-zinc-500 border-white/5 hover:text-zinc-300'
                    }`}
                  >
                    KANBAN VIEW (STAGES)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: [+] ASSIGNEE */}
          {entityModalTab === 'assignee' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OPERATIVE CODENAME / NAME</span>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-normal">PROFILE RECORD</span>
                </label>

                <div
                  className="relative rounded-xl transition-all duration-200"
                  style={{
                    boxShadow: inputFocused ? `0 0 16px ${selectedColor}40` : 'none',
                  }}
                >
                  <ReticleHUD active={inputFocused} color={selectedColor} offset={-4} />
                  <input
                    type="text"
                    autoFocus
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="E.G. CYBER_COMMANDER"
                    style={{
                      borderColor: inputFocused ? selectedColor : 'rgba(255,255,255,0.1)',
                      caretColor: selectedColor,
                    }}
                    className="w-full bg-[#0d0e12] border rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 tracking-wider focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    COMM LINK (EMAIL)
                  </label>
                  <input
                    type="email"
                    value={assigneeEmail}
                    onChange={(e) => setAssigneeEmail(e.target.value)}
                    placeholder="operative@aerox.net"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    TACTICAL ROLE
                  </label>
                  <input
                    type="text"
                    value={assigneeRole}
                    onChange={(e) => setAssigneeRole(e.target.value)}
                    placeholder="Senior Operative"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hue Palette Selector (Horizontal Array of Glowing Circular Swatches) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>HUE PALETTE SELECTOR</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {HUE_PALETTE.find(h => h.hex === selectedColor)?.name.toUpperCase() || 'CUSTOM'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/5 gap-2 overflow-x-auto">
              {HUE_PALETTE.map((hue) => {
                const isSelected = selectedColor === hue.hex;

                return (
                  <motion.button
                    key={hue.hex}
                    type="button"
                    onClick={() => setSelectedColor(hue.hex)}
                    onMouseEnter={() => setHoveredColor(hue.hex)}
                    onMouseLeave={() => setHoveredColor(null)}
                    whileHover={{ scale: 1.25 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    style={{
                      backgroundColor: hue.hex,
                      boxShadow: isSelected
                        ? `0 0 20px ${hue.hex}, 0 0 8px ${hue.hex}`
                        : `0 0 10px ${hue.hex}60`,
                    }}
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={hue.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-black drop-shadow" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {/* CANCEL text button with Reticle on hover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEntityModalOpen(false)}
                onMouseEnter={() => setCancelHovered(true)}
                onMouseLeave={() => setCancelHovered(false)}
                className="relative px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-wider"
              >
                <ReticleHUD active={cancelHovered} color="#71717A" offset={-2} />
                CANCEL
              </button>
            </div>

            {/* High-Contrast Magnetic Button: COMMIT [LABEL] / COMMIT [PROJECT] / COMMIT [ASSIGNEE] */}
            <MagneticButton
              type="submit"
              distance={6}
              className="px-6 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider text-black flex items-center gap-2 shadow-lg transition-all"
              style={{
                backgroundColor: selectedColor,
                boxShadow: `0 0 24px ${selectedColor}80, 0 4px 12px rgba(0,0,0,0.5)`,
                borderColor: selectedColor,
              }}
            >
              <span>COMMIT [{entityModalTab.toUpperCase()}]</span>
            </MagneticButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
