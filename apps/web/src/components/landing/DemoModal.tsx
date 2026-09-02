'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [participants, setParticipants] = useState('100-500');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; org?: string }>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => initialFocusRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const validate = () => {
    const newErrors: { name?: string; email?: string; org?: string } = {};
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Please enter a valid work email';
    if (!org.trim()) newErrors.org = 'Please enter your organization name';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleResetAndClose = () => {
    setName('');
    setEmail('');
    setOrg('');
    setMessage('');
    setIsSubmitted(false);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-[#0B0C0B]/85 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-[20px] bg-[#141614] border border-[#282C28] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden z-10 text-left font-body"
          >
            {/* Top Bar */}
            <div className="h-14 bg-[#111311] border-b border-[#242824] px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#028051]" />
                <span className="text-xs font-mono text-[#A3A3A3] font-bold uppercase tracking-wider">
                  Book an Organizer Demo
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="p-1.5 rounded-[8px] text-[#737373] hover:text-white hover:bg-[#1A1D1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028051]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {isSubmitted ? (
                <div className="py-10 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#028051]/20 border border-[#028051] flex items-center justify-center mx-auto text-[#03A066]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                    Demo Scheduled!
                  </h3>
                  <p className="text-sm text-[#A3A3A3] font-mono max-w-md mx-auto leading-relaxed">
                    Thanks <strong className="text-white">{name}</strong>. We&apos;ve reserved a custom walkthrough for <strong className="text-white">{org}</strong>. Our team will reach out at <strong className="text-white">{email}</strong> within 2 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="mt-6 px-8 py-3 rounded-[12px] bg-[#028051] hover:bg-[#03A066] text-white font-mono text-sm font-bold transition-colors"
                  >
                    Return to Homepage
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 id="demo-modal-title" className="text-2xl font-heading font-extrabold text-white">
                      See AlmostHack in action.
                    </h3>
                    <p className="text-sm text-[#8C908C] font-mono mt-1">
                      Custom 20-minute walkthrough tailored to your upcoming hackathon.
                    </p>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#EDEDED] font-medium block">
                      Your Name *
                    </label>
                    <input
                      ref={initialFocusRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className={cn(
                        'w-full px-4 py-2.5 rounded-[10px] bg-[#1A1D1A] border text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all',
                        errors.name ? 'border-red-500/80' : 'border-[#282C28]'
                      )}
                    />
                    {errors.name && <span className="text-xs font-mono text-red-400">{errors.name}</span>}
                  </div>

                  {/* Work Email Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#EDEDED] font-medium block">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@organization.com"
                      className={cn(
                        'w-full px-4 py-2.5 rounded-[10px] bg-[#1A1D1A] border text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all',
                        errors.email ? 'border-red-500/80' : 'border-[#282C28]'
                      )}
                    />
                    {errors.email && <span className="text-xs font-mono text-red-400">{errors.email}</span>}
                  </div>

                  {/* Organization & Participants */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#EDEDED] font-medium block">
                        Organization *
                      </label>
                      <input
                        type="text"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        placeholder="e.g. Stanford ACM"
                        className={cn(
                          'w-full px-4 py-2.5 rounded-[10px] bg-[#1A1D1A] border text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all',
                          errors.org ? 'border-red-500/80' : 'border-[#282C28]'
                        )}
                      />
                      {errors.org && <span className="text-xs font-mono text-red-400">{errors.org}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#EDEDED] font-medium block">
                        Expected Builders
                      </label>
                      <select
                        value={participants}
                        onChange={(e) => setParticipants(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-[10px] bg-[#1A1D1A] border border-[#282C28] text-sm font-mono text-white focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all"
                      >
                        <option value="50-100">50 – 100 builders</option>
                        <option value="100-500">100 – 500 builders</option>
                        <option value="500-1500">500 – 1,500 builders</option>
                        <option value="1500+">1,500+ builders (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#EDEDED] font-medium block">
                      Notes / Scope (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hosting our annual hackathon in April..."
                      className="w-full px-4 py-2.5 rounded-[10px] bg-[#1A1D1A] border border-[#282C28] text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3.5 rounded-[12px] bg-[#028051] hover:bg-[#03A066] active:bg-[#015033] text-white font-mono text-sm font-bold tracking-wide shadow-sm transition-all border border-[#03A066]/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reserving Demo...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Book Demo</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Microcopy Badges */}
                  <div className="pt-3 border-t border-[#242824] flex items-center justify-between text-xs font-mono text-[#737373]">
                    <span>✓ No spam</span>
                    <span>✓ Quick 2h response</span>
                    <span>✓ Custom sandbox</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
