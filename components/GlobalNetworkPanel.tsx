'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Radio, 
  Search, 
  UserPlus, 
  Share2, 
  Check, 
  Layers, 
  ShieldCheck, 
  Wifi, 
  Terminal,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MagneticButton } from '@/components/DynamicEntityModal';

export function GlobalNetworkPanel() {
  const { 
    isGlobalRadarOpen, 
    setIsGlobalRadarOpen, 
    operatives, 
    workspaceMembers, 
    currentWorkspace, 
    workspaces,
    user,
    addOperativeToWorkspace, 
    shareSystemWithOperative,
    customTemplates,
    openEntityModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<Record<string, boolean>>({});
  const [sharedTemplates, setSharedTemplates] = useState<Record<string, boolean>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const targetWorkspace = currentWorkspace || workspaces[0] || null;

  // Filter operatives based on search query
  const filteredOperatives = useMemo(() => {
    return operatives.filter(op => {
      // Exclude current user from receiving invites to their own workspace
      if (user && op.id === user.id) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        op.name.toLowerCase().includes(q) ||
        op.email.toLowerCase().includes(q) ||
        (op.role && op.role.toLowerCase().includes(q))
      );
    });
  }, [operatives, searchQuery, user]);

  // Check if an operative is already in the active workspace
  const isMemberOfActiveWorkspace = (operativeId: string) => {
    if (!targetWorkspace) return false;
    return (
      workspaceMembers.some(
        m => m.workspace_id === targetWorkspace.id && m.user_id === operativeId
      ) || Boolean(invitedMembers[operativeId])
    );
  };

  const handleAddMember = async (operativeId: string) => {
    if (!targetWorkspace) return;
    const success = await addOperativeToWorkspace(operativeId, targetWorkspace.id);
    if (success) {
      setInvitedMembers(prev => ({ ...prev, [operativeId]: true }));
    }
  };

  const handleShareSystem = async (operativeId: string) => {
    const success = await shareSystemWithOperative(operativeId, selectedTemplateId || undefined);
    if (success) {
      setSharedTemplates(prev => ({ ...prev, [operativeId]: true }));
      setTimeout(() => {
        setSharedTemplates(prev => ({ ...prev, [operativeId]: false }));
      }, 4000);
    }
  };

  return (
    <AnimatePresence>
      {isGlobalRadarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsGlobalRadarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Tactical Slide-Out Side Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-lg h-full bg-[#000101]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_80px_rgba(0,224,255,0.15)] flex flex-col overflow-hidden"
          >
            {/* Top Kinetic Neon Rim */}
            <div className="h-[2px] w-full bg-gradient-to-r from-[#00E0FF] via-[#00F5D4] to-[#FF0055] shadow-[0_0_16px_rgba(0,245,212,0.8)]" />

            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] bg-[#050508]/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-[#00E0FF]/50 shadow-[0_0_14px_rgba(0,224,255,0.4)]">
                    <Radio className="w-4 h-4 text-[#00E0FF] animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] absolute -top-0.5 -right-0.5 shadow-[0_0_6px_#00F5D4]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-mono tracking-widest text-zinc-100 flex items-center gap-1.5">
                      <span>[GLOBAL_NETWORK_LINK]</span>
                    </h2>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      ACTIVE OPERATIVES DIRECTORY & REALTIME MESH
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MagneticButton
                    distance={4}
                    onClick={() => openEntityModal('assignee')}
                    className="px-2.5 py-1 rounded-lg bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/30 hover:border-[#00F5D4]/60 font-mono text-[10px] flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,245,212,0.2)] transition-all"
                    style={{ borderColor: 'rgba(0,245,212,0.3)' }}
                    title="Dynamic Entity Protocol: Register Operative"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>[+] OPERATIVE</span>
                  </MagneticButton>

                  <button
                    type="button"
                    onClick={() => setIsGlobalRadarOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-100 border border-white/5 transition-all"
                    aria-label="Close Global Radar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Workspace Target Badge */}
              {targetWorkspace && (
                <div className="mt-3 px-3 py-2 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-zinc-500">TARGET WORKSPACE:</span>
                    <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: targetWorkspace.color, boxShadow: `0 0 8px ${targetWorkspace.color}` }} 
                      />
                      {targetWorkspace.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-[#00E0FF] border border-[#00E0FF]/30">
                    {targetWorkspace.type}
                  </span>
                </div>
              )}
            </div>

            {/* Controls: Search and System Blueprint Selector */}
            <div className="p-4 border-b border-white/[0.04] bg-[#020204] space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter operatives by callsign, email, or role..."
                  className="w-full bg-[#09090c] border border-white/10 focus:border-[#00E0FF] focus:shadow-[0_0_15px_rgba(0,224,255,0.25)] rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>

              {/* Template to Share Selector */}
              {customTemplates.length > 0 && (
                <div className="flex items-center justify-between text-[11px] font-mono px-1">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#00F5D4]" />
                    <span>SYSTEM TO SHARE:</span>
                  </span>
                  <select
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="bg-[#09090c] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#00E0FF] focus:outline-none"
                  >
                    <option value="">{customTemplates[0]?.name} (Primary)</option>
                    {customTemplates.slice(1).map(tmpl => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Operatives Directory List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-[#00F5D4]" />
                  <span>REGISTERED OPERATIVES ({filteredOperatives.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#00F5D4] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              {filteredOperatives.length === 0 ? (
                <div className="py-16 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-black/30">
                  <Terminal className="w-6 h-6 text-zinc-600 mx-auto" />
                  <p className="text-xs font-mono text-zinc-400">NO OPERATIVES MATCHING FREQUENCY</p>
                  <p className="text-[10px] font-mono text-zinc-600">Try adjusting your query filter</p>
                </div>
              ) : (
                filteredOperatives.map(operative => {
                  const isMember = isMemberOfActiveWorkspace(operative.id);
                  const isShared = Boolean(sharedTemplates[operative.id]);

                  return (
                    <motion.div
                      key={operative.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isMember
                          ? 'bg-[#05070a] border-cyan-500/20 shadow-[0_0_15px_rgba(0,224,255,0.04)]'
                          : 'bg-black/50 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Operative Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#0d0e12] border border-[#00E0FF]/40 flex-shrink-0 flex items-center justify-center font-bold text-xs text-[#00E0FF] shadow-[0_0_10px_rgba(0,224,255,0.2)]">
                            {operative.avatar_url ? (
                              <img src={operative.avatar_url} alt={operative.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{operative.name ? operative.name[0] : 'O'}</span>
                            )}
                            <span className="w-2 h-2 rounded-full bg-[#00F5D4] absolute -bottom-0.5 -right-0.5 border border-black shadow-[0_0_6px_#00F5D4]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold font-mono text-zinc-100 truncate">
                                {operative.name}
                              </h3>
                              {isMember && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/70 text-[#00E0FF] border border-[#00E0FF]/30">
                                  MEMBER
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-zinc-500 truncate">
                              {operative.email}
                            </p>
                            <p className="text-[10px] font-mono text-[#00F5D4]/80 tracking-wider mt-0.5">
                              {operative.role || 'Operative'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                          {/* [+] ADD TO WORKSPACE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleAddMember(operative.id)}
                            disabled={isMember}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all ${
                              isMember
                                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 cursor-default opacity-80'
                                : 'bg-[#00E0FF]/10 hover:bg-[#00E0FF]/20 text-[#00E0FF] border border-[#00E0FF]/40 shadow-[0_0_12px_rgba(0,224,255,0.2)] active:scale-95'
                            }`}
                            title={isMember ? 'Already linked to this workspace' : 'Add operative to active workspace'}
                          >
                            {isMember ? (
                              <>
                                <Check className="w-3 h-3 text-[#00F5D4]" />
                                <span>[✓ LINKED]</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>[+] ADD</span>
                              </>
                            )}
                          </button>

                          {/* [>] SHARE SYSTEM BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleShareSystem(operative.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all ${
                              isShared
                                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)] active:scale-95'
                            }`}
                            title="Transmit a copy of your custom template system"
                          >
                            {isShared ? (
                              <>
                                <Check className="w-3 h-3 text-[#00F5D4]" />
                                <span>[✓ SENT]</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3 h-3" />
                                <span>[&gt;] SHARE</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] bg-[#050508] text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
                <span>SECURE CIPHER ENCRYPTED DIRECTORY // RLS PROTECTED</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
