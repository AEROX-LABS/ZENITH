'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Brain, 
  Plus, 
  Trash2, 
  Archive, 
  RotateCcw, 
  X, 
  GripVertical, 
  Palette, 
  ChevronRight, 
  Check, 
  Layers
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAudio } from '@/hooks/useAudio';
import { NeuralNote, NoteBlock, NoteBlockType } from '@/types';

const NEON_PALETTE = [
  { name: 'Electric Cyan', hex: '#00E0FF', glow: 'rgba(0, 224, 255, 0.4)' },
  { name: 'Cyber Magenta', hex: '#FF006E', glow: 'rgba(255, 0, 110, 0.4)' },
  { name: 'Phosphor Emerald', hex: '#00F5D4', glow: 'rgba(0, 245, 212, 0.4)' },
  { name: 'Solar Amber', hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  { name: 'Deep Violet', hex: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
  { name: 'Neon Rose', hex: '#FF0055', glow: 'rgba(255, 0, 85, 0.4)' },
];

/**
 * Tactical Individual Note Block with Hierarchical Typography
 */
function NeuralNoteBlockItem({
  block,
  noteColor,
  onFocus,
  onChangeText,
  onChangeType,
  onIndent,
  onOutdent,
  onEnter,
  onDelete,
}: {
  block: NoteBlock;
  noteColor: string;
  isActive: boolean;
  onFocus: () => void;
  onChangeText: (text: string) => void;
  onChangeType: (type: NoteBlockType) => void;
  onIndent: () => void;
  onOutdent: () => void;
  onEnter: () => void;
  onDelete: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height without layout shifts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onOutdent();
      } else {
        onIndent();
      }
    } else if (e.key === 'Backspace' && block.text === '') {
      e.preventDefault();
      if (block.depth > 0) {
        onOutdent();
      } else {
        onDelete();
      }
    }
  };

  // Nesting indent based on depth
  const indentPx = block.depth * 20;

  // Typography scaling and dimming according to depth
  let textClass = 'text-white/80 text-sm font-sans';
  let bulletSymbol = '●';
  let bulletOpacity = 0.75;

  if (block.type === 'h1') {
    textClass = 'text-xl font-mono font-bold tracking-wider uppercase';
  } else if (block.type === 'h2') {
    textClass = 'text-lg font-mono font-semibold tracking-wide';
  } else if (block.type === 'bullet') {
    if (block.depth === 0) {
      textClass = 'text-base font-sans text-white/95 font-medium';
      bulletSymbol = '◆';
      bulletOpacity = 1;
    } else if (block.depth === 1) {
      textClass = 'text-sm font-sans text-white/85';
      bulletSymbol = '●';
      bulletOpacity = 0.75;
    } else if (block.depth === 2) {
      textClass = 'text-xs font-sans text-white/60';
      bulletSymbol = '○';
      bulletOpacity = 0.5;
    } else {
      textClass = 'text-[11px] font-sans text-white/40';
      bulletSymbol = '▪';
      bulletOpacity = 0.3;
    }
  } else {
    // Regular text
    if (block.depth === 0) textClass = 'text-sm font-sans text-white/90';
    else if (block.depth === 1) textClass = 'text-xs font-sans text-white/70';
    else textClass = 'text-[11px] font-sans text-white/45';
  }

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      whileDrag={{
        scale: 1.02,
        rotate: -1,
        boxShadow: `0 0 20px ${noteColor}60`,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="group/block relative flex items-start gap-2 py-1 select-none"
      style={{ paddingLeft: `${indentPx}px` }}
    >
      {/* Block Drag Handle */}
      <div 
        className="opacity-0 group-hover/block:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-zinc-600 hover:text-zinc-300 -ml-2"
        title="Drag block to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Bullet / Heading Indicator */}
      <div className="pt-1 flex items-center justify-center min-w-[18px]">
        {block.type === 'h1' ? (
          <span 
            className="text-[10px] font-mono font-bold px-1 rounded border leading-none py-0.5"
            style={{ 
              color: noteColor, 
              borderColor: `${noteColor}60`, 
              backgroundColor: `${noteColor}15`,
              textShadow: `0 0 8px ${noteColor}` 
            }}
          >
            H1
          </span>
        ) : block.type === 'h2' ? (
          <span 
            className="text-[9px] font-mono font-semibold px-1 rounded border leading-none py-0.5"
            style={{ 
              color: noteColor, 
              borderColor: `${noteColor}50`, 
              backgroundColor: `${noteColor}10`,
              opacity: 0.9,
              textShadow: `0 0 6px ${noteColor}` 
            }}
          >
            H2
          </span>
        ) : block.type === 'bullet' ? (
          <span 
            className="font-mono text-sm leading-none transition-all"
            style={{ 
              color: noteColor, 
              opacity: bulletOpacity,
              textShadow: bulletOpacity > 0.6 ? `0 0 8px ${noteColor}` : 'none' 
            }}
          >
            {bulletSymbol}
          </span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1" />
        )}
      </div>

      {/* Textarea Input */}
      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          value={block.text}
          onChange={(e) => onChangeText(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            block.type === 'h1' 
              ? 'HEADING 1 // CORE TOPIC' 
              : block.type === 'h2' 
                ? 'Heading 2 // Subsystem' 
                : 'Enter tactical parameters...'
          }
          className={`w-full bg-transparent resize-none focus:outline-none transition-colors leading-relaxed ${textClass} placeholder-zinc-700`}
          style={{
            color: block.type === 'h1' || block.type === 'h2' ? noteColor : undefined,
            textShadow: block.type === 'h1' ? `0 0 12px ${noteColor}, 0 0 24px ${noteColor}60` : block.type === 'h2' ? `0 0 8px ${noteColor}80` : undefined,
          }}
        />
      </div>

      {/* Inline Block Quick Actions (Visible on Hover) */}
      <div className="opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-1 self-start pt-1">
        <button
          type="button"
          onClick={() => onChangeType(block.type === 'h1' ? 'bullet' : block.type === 'bullet' ? 'h2' : 'h1')}
          className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[10px] font-mono"
          title="Cycle block type (H1 / H2 / Bullet)"
        >
          {block.type.toUpperCase()}
        </button>
        <button
          type="button"
          onClick={onIndent}
          className="p-1 rounded text-zinc-500 hover:text-cyan-400 hover:bg-white/5 transition-colors"
          title="Indent (Tab)"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-white/5 transition-colors"
          title="Delete block (Backspace on empty)"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </Reorder.Item>
  );
}

/**
 * Tactical Note Cluster Card
 * Uses hardware-accelerated transforms and layout={false} to eliminate drag lag
 */
function NeuralNoteCard({
  note,
  onUpdate,
  onDragStart,
  onDrag,
  onDragEnd,
  isBeingDragged,
}: {
  note: NeuralNote;
  onUpdate: (updated: NeuralNote) => void;
  onDragStart: (e: any, info: any) => void;
  onDrag: (e: any, info: any) => void;
  onDragEnd: (e: any, info: any) => void;
  isBeingDragged: boolean;
}) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const { playClack } = useAudio();

  const handleBlocksReorder = (newBlocks: NoteBlock[]) => {
    onUpdate({
      ...note,
      blocks: newBlocks,
      updated_at: new Date().toISOString(),
    });
  };

  const handleUpdateBlockText = (blockId: string, text: string) => {
    const updated = note.blocks.map(b => b.id === blockId ? { ...b, text } : b);
    onUpdate({
      ...note,
      blocks: updated,
      updated_at: new Date().toISOString(),
    });
  };

  const handleUpdateBlockType = (blockId: string, type: NoteBlockType) => {
    const updated = note.blocks.map(b => b.id === blockId ? { ...b, type } : b);
    onUpdate({
      ...note,
      blocks: updated,
      updated_at: new Date().toISOString(),
    });
  };

  const handleIndentBlock = (blockId: string) => {
    const updated = note.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, depth: Math.min(b.depth + 1, 3) };
      }
      return b;
    });
    onUpdate({
      ...note,
      blocks: updated,
      updated_at: new Date().toISOString(),
    });
  };

  const handleOutdentBlock = (blockId: string) => {
    const updated = note.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, depth: Math.max(b.depth - 1, 0) };
      }
      return b;
    });
    onUpdate({
      ...note,
      blocks: updated,
      updated_at: new Date().toISOString(),
    });
  };

  const handleAddBlockBelow = (currentBlockId: string) => {
    const index = note.blocks.findIndex(b => b.id === currentBlockId);
    const currentBlock = note.blocks[index];
    const newBlock: NoteBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: currentBlock?.type === 'h1' ? 'bullet' : currentBlock?.type || 'bullet',
      text: '',
      depth: currentBlock?.type === 'h1' ? 1 : currentBlock?.depth ?? 0,
    };

    const newBlocks = [...note.blocks];
    newBlocks.splice(index + 1, 0, newBlock);

    onUpdate({
      ...note,
      blocks: newBlocks,
      updated_at: new Date().toISOString(),
    });

    setActiveBlockId(newBlock.id);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (note.blocks.length <= 1) return;
    const updated = note.blocks.filter(b => b.id !== blockId);
    onUpdate({
      ...note,
      blocks: updated,
      updated_at: new Date().toISOString(),
    });
  };

  const handleAddTailBlock = (type: NoteBlockType) => {
    playClack();
    const newBlock: NoteBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      text: '',
      depth: type === 'h1' || type === 'h2' ? 0 : 1,
    };

    onUpdate({
      ...note,
      blocks: [...note.blocks, newBlock],
      updated_at: new Date().toISOString(),
    });

    setActiveBlockId(newBlock.id);
  };

  const handleColorChange = (color: string) => {
    playClack();
    onUpdate({
      ...note,
      color,
      updated_at: new Date().toISOString(),
    });
    setIsColorPickerOpen(false);
  };

  return (
    <motion.div
      layout={false}
      drag
      dragSnapToOrigin
      dragElastic={0}
      whileDrag={{
        scale: 1.02,
        boxShadow: `0 0 35px ${note.color}70, 0 15px 40px rgba(0,0,0,0.8)`,
        zIndex: 50,
      }}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={`relative rounded-2xl p-5 border transition-all duration-200 backdrop-blur-2xl flex flex-col ${
        isBeingDragged ? 'opacity-80 ring-2 ring-cyan-400' : 'bg-[#090b10]/90 hover:bg-[#0c0e16]/95'
      }`}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        borderColor: `${note.color}35`,
        boxShadow: `0 8px 30px rgba(0, 0, 0, 0.6), inset 0 0 20px ${note.color}0a`,
      }}
    >
      {/* Top Header & Tactical Grip Handle */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          {/* Neon status node */}
          <div 
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ 
              backgroundColor: note.color, 
              boxShadow: `0 0 10px ${note.color}` 
            }}
          />
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            CLUSTER // {note.id.slice(-4).toUpperCase()}
          </span>
        </div>

        {/* Action nodes: Color Picker & Grip */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Hovering Color Picker Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
              style={{ color: note.color }}
              title="Change cluster neon hue"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* Hovering Color Swatches Palette */}
            {isColorPickerOpen && (
              <div 
                className="absolute right-0 top-full mt-2 p-2 rounded-xl bg-black/95 border border-white/15 shadow-2xl backdrop-blur-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {NEON_PALETTE.map((pal) => (
                  <button
                    key={pal.hex}
                    type="button"
                    onClick={() => handleColorChange(pal.hex)}
                    className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 flex items-center justify-center"
                    style={{ 
                      backgroundColor: pal.hex,
                      boxShadow: note.color === pal.hex ? `0 0 10px ${pal.hex}` : 'none' 
                    }}
                    title={pal.name}
                  >
                    {note.color === pal.hex && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tactical Drag Indicator */}
          <div className="text-zinc-500 hover:text-zinc-300 p-1">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Note Blocks Reorder Group */}
      <Reorder.Group
        axis="y"
        values={note.blocks}
        onReorder={handleBlocksReorder}
        className="space-y-1 min-h-[120px] flex-1"
      >
        {note.blocks.map((block) => (
          <NeuralNoteBlockItem
            key={block.id}
            block={block}
            noteColor={note.color}
            isActive={activeBlockId === block.id}
            onFocus={() => setActiveBlockId(block.id)}
            onChangeText={(txt) => handleUpdateBlockText(block.id, txt)}
            onChangeType={(typ) => handleUpdateBlockType(block.id, typ)}
            onIndent={() => handleIndentBlock(block.id)}
            onOutdent={() => handleOutdentBlock(block.id)}
            onEnter={() => handleAddBlockBelow(block.id)}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        ))}
      </Reorder.Group>

      {/* Bottom Block Creation Dock */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-1 flex-wrap text-[11px] font-mono">
        <div className="flex items-center gap-1 text-zinc-500">
          <span>[+] APPEND:</span>
          <button
            type="button"
            onClick={() => handleAddTailBlock('h1')}
            className="px-1.5 py-0.5 rounded hover:bg-white/5 hover:text-zinc-200 transition-colors"
            style={{ color: `${note.color}dd` }}
          >
            H1
          </button>
          <span className="text-zinc-700">•</span>
          <button
            type="button"
            onClick={() => handleAddTailBlock('h2')}
            className="px-1.5 py-0.5 rounded hover:bg-white/5 hover:text-zinc-200 transition-colors"
            style={{ color: `${note.color}aa` }}
          >
            H2
          </button>
          <span className="text-zinc-700">•</span>
          <button
            type="button"
            onClick={() => handleAddTailBlock('bullet')}
            className="px-1.5 py-0.5 rounded hover:bg-white/5 hover:text-zinc-200 transition-colors text-zinc-400"
          >
            BULLET
          </button>
          <span className="text-zinc-700">•</span>
          <button
            type="button"
            onClick={() => handleAddTailBlock('text')}
            className="px-1.5 py-0.5 rounded hover:bg-white/5 hover:text-zinc-200 transition-colors text-zinc-400"
          >
            NOTE
          </button>
        </div>

        <span className="text-[10px] text-zinc-600 font-mono">
          TAB INDENT // ENTER SPLIT
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Main Neural Canvas Tactical Modal
 * - Full-screen container: fixed inset-0 z-[100] bg-[#000101]/85 backdrop-blur-2xl with blueprint graph overlay
 * - Fixed bottom drop zones that only fade in when dragged
 * - 60 FPS GPU-accelerated collision detection using requestAnimationFrame without React state re-renders
 */
export function NeuralCanvasModal() {
  const { 
    isNeuralCanvasOpen, 
    closeNeuralCanvas, 
    notes, 
    archivedNotes, 
    createNote, 
    updateNote, 
    archiveNote, 
    purgeNote, 
    restoreNote,
    showToast,
  } = useApp();

  const { playTick, playClack, playThud, playPlasmaBurst } = useAudio();
  const [activeTab, setActiveTab] = useState<'canvas' | 'archive'>('canvas');
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  // References to drop zones for direct DOM manipulation during rAF hit-testing
  const archiveZoneRef = useRef<HTMLDivElement>(null);
  const purgeZoneRef = useRef<HTMLDivElement>(null);
  const activeZoneCollisionRef = useRef<'archive' | 'purge' | null>(null);
  const rAFHandleRef = useRef<number | null>(null);

  // Keyboard Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNeuralCanvasOpen) {
        closeNeuralCanvas();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNeuralCanvasOpen, closeNeuralCanvas]);

  // Clean up any pending animation frame on unmount
  useEffect(() => {
    return () => {
      if (rAFHandleRef.current) {
        cancelAnimationFrame(rAFHandleRef.current);
      }
    };
  }, []);

  // Drag physics & zero-state collision detection
  const handleNoteDragStart = (noteId: string) => {
    playClack();
    activeZoneCollisionRef.current = null;
    setDraggedNoteId(noteId);
  };

  const handleNoteDrag = (e: any, info: any) => {
    if (rAFHandleRef.current) return;

    rAFHandleRef.current = requestAnimationFrame(() => {
      rAFHandleRef.current = null;
      const pointX = info.point.x;
      const pointY = info.point.y;

      let detectedZone: 'archive' | 'purge' | null = null;

      if (archiveZoneRef.current) {
        const rect = archiveZoneRef.current.getBoundingClientRect();
        if (
          pointX >= rect.left &&
          pointX <= rect.right &&
          pointY >= rect.top &&
          pointY <= rect.bottom
        ) {
          detectedZone = 'archive';
        }
      }

      if (!detectedZone && purgeZoneRef.current) {
        const rect = purgeZoneRef.current.getBoundingClientRect();
        if (
          pointX >= rect.left &&
          pointX <= rect.right &&
          pointY >= rect.top &&
          pointY <= rect.bottom
        ) {
          detectedZone = 'purge';
        }
      }

      if (activeZoneCollisionRef.current !== detectedZone) {
        activeZoneCollisionRef.current = detectedZone;

        if (detectedZone === 'archive') {
          playTick(0.2);
          archiveZoneRef.current?.setAttribute('data-active', 'true');
          purgeZoneRef.current?.removeAttribute('data-active');
        } else if (detectedZone === 'purge') {
          playTick(0.2);
          purgeZoneRef.current?.setAttribute('data-active', 'true');
          archiveZoneRef.current?.removeAttribute('data-active');
        } else {
          archiveZoneRef.current?.removeAttribute('data-active');
          purgeZoneRef.current?.removeAttribute('data-active');
        }
      }
    });
  };

  const handleNoteDragEnd = async () => {
    if (rAFHandleRef.current) {
      cancelAnimationFrame(rAFHandleRef.current);
      rAFHandleRef.current = null;
    }

    const targetZone = activeZoneCollisionRef.current;
    const noteId = draggedNoteId;

    // Direct DOM cleanup
    archiveZoneRef.current?.removeAttribute('data-active');
    purgeZoneRef.current?.removeAttribute('data-active');
    activeZoneCollisionRef.current = null;
    setDraggedNoteId(null);

    if (!noteId) return;

    if (targetZone === 'archive') {
      playTick();
      await archiveNote(noteId);
      showToast('[VAULT_SAVED] Thought cluster archived to neural records.', 'info');
    } else if (targetZone === 'purge') {
      playPlasmaBurst();
      await purgeNote(noteId);
      showToast('[DATA_PURGED] Thought cluster disintegrated.', 'error');
    } else {
      playThud();
    }
  };

  if (!isNeuralCanvasOpen) return null;

  return (
    <AnimatePresence>
      {/* 
        Wrap the entire Neural Canvas in a fixed, full-screen container:
        fixed inset-0 z-[100] bg-[#000101]/85 backdrop-blur-2xl with blueprint dotted grid
      */}
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#000101]/85 backdrop-blur-2xl bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden select-none">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Tactical HUD Header */}
        <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#000204]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-300 tracking-wider">
                  [ NEURAL CANVAS // TACTICAL QUICK-NOTE SYSTEM ]
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-[0_0_8px_rgba(0,224,255,0.2)]">
                  LIVE SYNC // 500MS
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                GPU-ACCELERATED HIERARCHICAL KINETIC NOTE MATRIX
              </p>
            </div>
          </div>

          {/* Navigation & Cluster Triggers */}
          <div className="flex items-center gap-3">
            {/* View switcher: Canvas vs Archive */}
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  playClack();
                  setActiveTab('canvas');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'canvas'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-[0_0_10px_rgba(0,224,255,0.2)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>CANVAS ({notes.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClack();
                  setActiveTab('archive');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'archive'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-[0_0_10px_rgba(0,245,212,0.2)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>VAULT ({archivedNotes.length})</span>
              </button>
            </div>

            {/* [+ NEW CLUSTER] Action Button */}
            {activeTab === 'canvas' && (
              <button
                type="button"
                onClick={() => {
                  playClack();
                  createNote();
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>[+] NEW CLUSTER</span>
              </button>
            )}

            {/* Tactical Close Button */}
            <button
              type="button"
              onClick={closeNeuralCanvas}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 font-mono text-xs flex items-center gap-1"
              title="Close Neural Canvas (ESC)"
            >
              <span className="text-[10px] text-zinc-500 hidden sm:inline">[ESC]</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Canvas Workspace */}
        <div className="relative flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'canvas' ? (
            notes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="font-mono text-lg font-bold text-zinc-200 mb-2">
                  NEURAL CANVAS IS CLEAR
                </h3>
                <p className="text-zinc-500 text-xs font-mono max-w-sm mb-6">
                  Initiate a new thought cluster to capture tactical specifications, hierarchical systems, and nested notes.
                </p>
                <button
                  type="button"
                  onClick={() => createNote()}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all"
                >
                  [+] INITIATE FIRST THOUGHT CLUSTER
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-40">
                {notes.map((note) => (
                  <NeuralNoteCard
                    key={note.id}
                    note={note}
                    onUpdate={updateNote}
                    onDragStart={() => handleNoteDragStart(note.id)}
                    onDrag={handleNoteDrag}
                    onDragEnd={handleNoteDragEnd}
                    isBeingDragged={draggedNoteId === note.id}
                  />
                ))}
              </div>
            )
          ) : (
            /* Archived Thoughts Vault View */
            <div className="max-w-4xl mx-auto pb-40">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-base font-bold text-emerald-400">
                    [ ARCHIVED THOUGHTS // SECURE VAULT ]
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Retained thought clusters. Restore to active canvas or execute permanent purge.
                  </p>
                </div>
              </div>

              {archivedNotes.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-500">
                  NO ARCHIVED THOUGHT CLUSTERS FOUND IN VAULT
                </div>
              ) : (
                <div className="space-y-4">
                  {archivedNotes.map((arch) => (
                    <div
                      key={arch.id}
                      className="p-5 rounded-2xl bg-[#090b10]/90 border border-emerald-500/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: arch.color, boxShadow: `0 0 8px ${arch.color}` }}
                          />
                          <span className="font-mono text-xs font-bold text-zinc-300">
                            {arch.blocks[0]?.text || 'UNTITLED CLUSTER'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            ({arch.blocks.length} BLOCKS)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2">
                          {arch.blocks.slice(1).map(b => b.text).filter(Boolean).join(' • ') || 'No sub-points'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playClack();
                            restoreNote(arch.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>RESTORE</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPlasmaBurst();
                            purgeNote(arch.id);
                          }}
                          className="p-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Purge permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FIXED BOTTOM DROP ZONES: [ ARCHIVE THOUGHT ] & [ PURGE DATA ]             */}
        {/* Positioned fixed at the bottom of the viewport, large targets             */}
        {/* Only appear (fade in) when a cluster is actively being dragged            */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {draggedNoteId && (
            <motion.div
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-8 inset-x-8 z-[120] grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-none"
            >
              {/* [ ARCHIVE THOUGHT ] Drop Zone */}
              <div
                ref={archiveZoneRef}
                className="pointer-events-auto relative flex items-center justify-center gap-4 py-5 px-8 rounded-2xl border-2 border-[#00F5D4]/60 bg-[#000101]/95 shadow-[0_0_25px_rgba(0,245,212,0.25)] backdrop-blur-xl transition-all duration-150 data-[active=true]:scale-105 data-[active=true]:border-[#00F5D4] data-[active=true]:bg-[#00F5D4]/20 data-[active=true]:shadow-[0_0_45px_#00F5D4]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/20 border border-[#00F5D4]/50 flex items-center justify-center text-[#00F5D4] shadow-[0_0_15px_#00F5D4]">
                  <Archive className="w-5 h-5 animate-bounce" />
                </div>
                <div className="text-left">
                  <h4 className="font-mono text-sm md:text-base font-bold text-[#00F5D4] tracking-wider uppercase">
                    [ ARCHIVE THOUGHT ]
                  </h4>
                  <p className="text-[10px] md:text-xs font-mono text-zinc-300">
                    DROP HERE TO SAVE TO SUPABASE VAULT
                  </p>
                </div>
              </div>

              {/* [ PURGE DATA ] Drop Zone */}
              <div
                ref={purgeZoneRef}
                className="pointer-events-auto relative flex items-center justify-center gap-4 py-5 px-8 rounded-2xl border-2 border-[#FF006E]/60 bg-[#000101]/95 shadow-[0_0_25px_rgba(255,0,110,0.25)] backdrop-blur-xl transition-all duration-150 data-[active=true]:scale-105 data-[active=true]:border-[#FF006E] data-[active=true]:bg-[#FF006E]/20 data-[active=true]:shadow-[0_0_45px_#FF006E]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF006E]/20 border border-[#FF006E]/50 flex items-center justify-center text-[#FF006E] shadow-[0_0_15px_#FF006E]">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="font-mono text-sm md:text-base font-bold text-[#FF006E] tracking-wider uppercase">
                    [ PURGE DATA ]
                  </h4>
                  <p className="text-[10px] md:text-xs font-mono text-zinc-300">
                    DROP HERE TO DISINTEGRATE & PERMANENTLY ERASE
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

export default NeuralCanvasModal;
