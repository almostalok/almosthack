'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scribble } from '@almosthack/ui';
import { MascotRobot } from '../MascotRobot';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@almosthack/utils';

export interface LeadCaptureSectionProps {
  onSuccessDemo?: () => void;
}

export const LeadCaptureSection: React.FC<LeadCaptureSectionProps> = ({
  onSuccessDemo,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [participants, setParticipants] = useState('100-500');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; org?: string }>({});

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
      if (onSuccessDemo) onSuccessDemo();
    }, 800);
  };

  return (
    <section
      id="book-demo"
      className="relative py-32 md:py-44 lg:py-56 bg-[#131413] border-t border-[#222622] text-left overflow-hidden"
      aria-label="Lead Capture - Book a Demo"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#028051]/8 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          
          {/* LEFT: Copy, Massive Headline, Mascot */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[8px] bg-[#1A1D1A] border border-[#282C28] text-xs font-mono text-[#03A066] uppercase tracking-wider font-semibold"
            >
              <Sparkles className="w-4 h-4 text-[#03A066]" />
              <span>GET STARTED TODAY</span>
            </motion.div>

            <motion.h2
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight text-white leading-[1.08]"
            >
              Ready to host your next award-winning hackathon?
            </motion.h2>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl sm:text-2xl text-[#A3A3A3] font-body leading-relaxed max-w-xl font-normal"
            >
              Let us handle the boring parts — so you can focus on building something people actually remember.
            </motion.p>

            {/* Mascot Robot Integration */}
            <div className="pt-6">
              <MascotRobot
                variant="celebrating"
                speechText={"Your spreadsheets\ncan finally rest."}
              />
            </div>
          </div>

          {/* RIGHT: High-Conversion Lead Capture Form */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 p-8 sm:p-12 rounded-[24px] bg-[#161816] border border-[#282C28] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-left font-body"
          >
            {isSubmitted ? (
              <div className="py-12 text-center space-y-5 font-mono">
                <div className="w-16 h-16 rounded-full bg-[#028051]/20 border border-[#028051] flex items-center justify-center mx-auto text-[#03A066]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-heading font-extrabold text-white">
                  Demo Request Received!
                </h3>
                <p className="text-sm text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
                  Thank you <strong className="text-white">{name}</strong>. We&apos;ve queued your workspace setup for <strong className="text-white">{org}</strong>. Our team will email your demo invite to <strong className="text-white">{email}</strong> within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-6 py-3 rounded-[12px] bg-[#1A1D1A] hover:bg-[#222622] text-[#EDEDED] text-sm font-bold border border-[#282C28]"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-heading font-extrabold text-white">
                    Book a live organizer demo
                  </h3>
                  <p className="text-sm font-mono text-[#8C908C] mt-1.5">
                    Get custom sandbox access and a 20-minute tailored platform tour.
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-mono text-[#EDEDED] font-medium block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className={cn(
                      'w-full px-4 py-3 rounded-[10px] bg-[#1A1D1A] border text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all',
                      errors.name ? 'border-red-500/80' : 'border-[#282C28]'
                    )}
                  />
                  {errors.name && <span className="text-xs font-mono text-red-400">{errors.name}</span>}
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-mono text-[#EDEDED] font-medium block">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@hackathon.org"
                    className={cn(
                      'w-full px-4 py-3 rounded-[10px] bg-[#1A1D1A] border text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all',
                      errors.email ? 'border-red-500/80' : 'border-[#282C28]'
                    )}
                  />
                  {errors.email && <span className="text-xs font-mono text-red-400">{errors.email}</span>}
                </div>

                {/* Organization & Participants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-mono text-[#EDEDED] font-medium block">
                      Organization *
                    </label>
                    <input
                      type="text"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder="e.g. MIT Hackathon Club"
                      className={cn(
                        'w-full px-4 py-3 rounded-[10px] bg-[#1A1D1A] border text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all',
                        errors.org ? 'border-red-500/80' : 'border-[#282C28]'
                      )}
                    />
                    {errors.org && <span className="text-xs font-mono text-red-400">{errors.org}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-mono text-[#EDEDED] font-medium block">
                      Expected Builders
                    </label>
                    <select
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] bg-[#1A1D1A] border border-[#282C28] text-sm font-mono text-white focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all"
                    >
                      <option value="50-100">50 – 100 builders</option>
                      <option value="100-500">100 – 500 builders</option>
                      <option value="500-1500">500 – 1,500 builders</option>
                      <option value="1500+">1,500+ builders (Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-mono text-[#EDEDED] font-medium block">
                    Notes / Event Scope (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="We're organizing a 36-hour hackathon across 3 tracks..."
                    className="w-full px-4 py-3 rounded-[10px] bg-[#1A1D1A] border border-[#282C28] text-sm font-mono text-white placeholder-[#5A5E5A] focus:outline-none focus:border-[#028051] focus:ring-1 focus:ring-[#028051] transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-4 rounded-[12px] bg-[#028051] hover:bg-[#03A066] active:bg-[#015033] text-white font-semibold text-base shadow-[0_4px_20px_rgba(2,128,81,0.3)] transition-all border border-[#03A066]/60 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Book a Demo</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Microcopy Badges */}
                <div className="pt-4 border-t border-[#242824] flex items-center justify-between text-xs font-mono text-[#737373]">
                  <span>✓ No spam</span>
                  <span>✓ Quick response</span>
                  <span>✓ Custom walkthrough</span>
                </div>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
