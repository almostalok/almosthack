'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command, Zap, Layers, Award, FileBadge, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // If parent is handling, we toggle open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const searchItems = [
    { label: 'Platform Features Overview', section: '#features', icon: Layers, category: 'Navigation' },
    { label: 'Interactive Role Switcher (Organizer/Judge)', section: '#interactive-demo', icon: Zap, category: 'Demo' },
    { label: 'AI Matchmaking & Fraud Shield', section: '#ai-engine', icon: Sparkles, category: 'AI Suite' },
    { label: 'Interactive Certificate Generator', section: '#certificates', icon: FileBadge, category: 'Tool' },
    { label: 'Judge Rubric Simulator', section: '#interactive-demo', icon: Award, category: 'Tool' },
    { label: 'Pricing Plans & FAQ', section: '#pricing', icon: BookOpen, category: 'Billing' },
  ];

  const filteredItems = searchItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl rounded-2xl bg-surface border border-white/15 glass-card overflow-hidden shadow-2xl space-y-0"
        >
          {/* Top Search Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-surface-50 gap-3">
            <Search className="w-4 h-4 text-accent" />
            <input
              type="text"
              placeholder="Search AlmostHack features, AI tools, certificates... (Type or Esc)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-white/50">
                No matching feature found. Try "AI", "Certificate", or "Judge".
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.section}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-white transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-accent transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">{item.category}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                  </a>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px]">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px]">esc</kbd> close
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
