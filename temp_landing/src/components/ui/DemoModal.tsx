'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, Play, Sparkles } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [eventSize, setEventSize] = useState('100 - 500 Participants');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl bg-surface border border-accent/40 glass-card overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Demo Reserved!</h3>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Thank you {name || 'there'}! A calendar invite and personalized platform walkthrough video link have been dispatched to <span className="text-accent font-semibold">{email}</span>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all"
              >
                Return to Landing Page
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-[11px]">
                  <Sparkles className="w-3 h-3" /> VIP PLATFORM DEMO
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">Book a 1-on-1 Walkthrough</h3>
                <p className="text-xs text-white/60">
                  See how AlmostHack can automate registrations, AI judging, and instant certificates for your upcoming event.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 mb-1 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-medium">Work / Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-medium">Expected Event Size</label>
                  <select
                    value={eventSize}
                    onChange={(e) => setEventSize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="50 - 100 Participants">50 - 100 Participants</option>
                    <option value="100 - 500 Participants">100 - 500 Participants</option>
                    <option value="500 - 2,000 Participants">500 - 2,000 Participants</option>
                    <option value="2,000+ Participants">2,000+ Participants (Enterprise)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Confirm Demo Reservation
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
