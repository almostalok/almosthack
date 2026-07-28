'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'AlmostHack saved our team over 30 hours of manual spreadsheet work. The AI team matcher alone helped 400+ solo hackers find teams within minutes.',
      author: 'Dr. Aris Thorne',
      role: 'Lead Director, HackMIT',
      tag: 'University Organizer',
      avatar: 'AT',
    },
    {
      quote: 'Judging 150 hackathon submissions used to be absolute chaos with inconsistent Google sheets. The AI rubric simulator and plagiarism shield made scoring transparent and fast.',
      author: 'Sophia Vance',
      role: 'Partner, Sequoia Ventures',
      tag: 'Grand Judge',
      avatar: 'SV',
    },
    {
      quote: 'We ran a 2,000-person global corporate hackathon. AlmostHack handle QR gate check-ins, custom track sponsors, and automated certificate generation flawlessly.',
      author: 'Marcus Sterling',
      role: 'Head of Developer Relations, Google Cloud',
      tag: 'Enterprise Host',
      avatar: 'MS',
    },
    {
      quote: 'As a student builder, finding teammates and submitting projects through GitHub sync was so clean. Receiving a cryptographically verified LinkedIn badge instantly felt incredible.',
      author: 'Elena Rostova',
      role: 'Winner, ETHGlobal 2026',
      tag: 'Participant Champion',
      avatar: 'ER',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#07080F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            COMMUNITY PROOF
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Loved by organizers. <br />
            <span className="text-gradient-accent">Adored by builders.</span>
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Hear from university leads, venture partners, and hackathon winners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-surface border border-white/10 glass-card-hover glass-card space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-accent px-2.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                    {t.tag}
                  </span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed italic font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-xs text-accent">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{t.author}</div>
                  <div className="text-xs text-white/50">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
