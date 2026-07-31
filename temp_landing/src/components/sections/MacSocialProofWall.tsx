'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { IconVerifiedCheck, IconSparkle } from '@/components/ui/CustomIcons';

export function MacSocialProofWall() {
  const testimonials = [
    {
      name: 'Greg Brockman',
      handle: '@gdb',
      avatar: 'G',
      text: 'AlmostHack + GPT Realtime 2 unlocks some real magic for automated hackathon judging.',
      time: '5/30/26, 10:22 PM',
      reposts: '144',
      likes: '2.7k',
      accent: 'from-emerald-500/20 to-teal-500/20',
      borderAccent: 'border-emerald-500/30',
    },
    {
      name: 'Lenny Rachitsky',
      handle: '@lennysan',
      avatar: 'L',
      text: 'My new favorite hackathon platform experience. So unique, engaging, and dead simple for organizers.',
      time: '4/27/26, 1:51 PM',
      reposts: '19',
      likes: '526',
      accent: 'from-amber-500/20 to-orange-500/20',
      borderAccent: 'border-amber-500/30',
    },
    {
      name: 'William Wang',
      handle: '@iamwilliamwang',
      avatar: 'W',
      text: 'Cool idea, been manually checking github PRs and demo videos, this AI copilot is the 10x version haha!',
      time: '4/6/26, 6:12 PM',
      reposts: '8',
      likes: '151',
      accent: 'from-blue-500/20 to-cyan-500/20',
      borderAccent: 'border-cyan-500/30',
    },
    {
      name: 'Josh Pigford',
      handle: '@Shpigford',
      avatar: 'J',
      text: 'dear lord baby jesus please hide AlmostHack from all the grifters so they don\'t ruin how good it is.',
      time: '4/27/26, 3:21 AM',
      reposts: '4',
      likes: '154',
      accent: 'from-cyan-500/20 to-blue-500/20',
      borderAccent: 'border-cyan-500/30',
    },
    {
      name: 'Aaron Epstein',
      handle: '@aaron_epstein',
      avatar: 'A',
      text: 'Wild new @almosthack demo just dropped 👀 Auto repo evaluation + crypto certificates is 🔥',
      time: '6/16/26, 2:12 PM',
      reposts: '4',
      likes: '102',
      accent: 'from-rose-500/20 to-pink-500/20',
      borderAccent: 'border-pink-500/30',
    },
    {
      name: 'Sharif Shameem',
      handle: '@sharifshameem',
      avatar: 'S',
      text: 'AI code review + live leaderboard during our hackathon was black magic. Saved us 20 hours.',
      time: '4/25/26, 11:39 PM',
      reposts: '12',
      likes: '310',
      accent: 'from-purple-500/20 to-indigo-500/20',
      borderAccent: 'border-purple-500/30',
    },
  ];

  return (
    <section id="feedback" className="py-24 bg-modern-dark text-white relative overflow-hidden select-none">
      
      {/* Top Marquee Banner */}
      <div className="w-full overflow-hidden py-4 bg-zinc-950/90 border-y border-white/10 mb-16">
        <div className="animate-marquee flex gap-12 font-mono text-sm uppercase tracking-widest text-zinc-400">
          {Array(8).fill(0).map((_, i) => (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <span>organizers love it everyday</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-xs font-mono text-cyan uppercase tracking-wider mb-4">
            feedback
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            they use it{' '}
            <span className="font-serif italic text-cyan text-4xl sm:text-5xl font-normal">
              everyday
            </span>
          </h2>
          <p className="mt-3 text-zinc-400 font-sans text-base">
            trusted by lead community builders, startup founders, and global dev hackathons.
          </p>
        </div>

        {/* 3-Column ReactBits Spotlight Cards Wall */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <SpotlightCard
                spotlightColor="rgba(0, 240, 255, 0.15)"
                className={`mac-window flex flex-col justify-between overflow-hidden border ${t.borderAccent}`}
              >
                {/* Window Header Bar */}
                <div className={`mac-window-bar bg-gradient-to-r ${t.accent} border-b border-white/10`}>
                  <div className="mac-dots">
                    <span className="mac-dot mac-dot-close" />
                    <span className="mac-dot mac-dot-min" />
                    <span className="mac-dot mac-dot-zoom" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">tweet.app</span>
                </div>

                {/* Card Body */}
                <div className="p-5 bg-zinc-950/90 flex flex-col justify-between flex-1 gap-4 font-sans">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/15 flex items-center justify-center font-bold text-white font-mono text-sm shadow-md">
                          {t.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-sm text-white flex items-center gap-1">
                            {t.name}
                            <IconVerifiedCheck size={14} className="text-cyan fill-cyan" />
                          </span>
                          <span className="font-mono text-xs text-zinc-500">{t.handle}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer transition-colors">
                        Follow
                      </span>
                    </div>

                    <p className="text-sm text-zinc-200 leading-normal font-normal">
                      {t.text}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs text-zinc-500">
                    <span>{t.time}</span>
                    <div className="flex items-center gap-3">
                      <span className="hover:text-cyan transition-colors">🔁 {t.reposts}</span>
                      <span className="hover:text-pink-400 transition-colors">❤️ {t.likes}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 max-w-3xl mx-auto mac-window p-4 bg-zinc-900/90 border border-white/15 text-center font-mono text-sm text-zinc-300 flex items-center justify-center gap-3 shadow-xl">
          <IconSparkle size={16} className="text-cyan" />
          <span><strong className="text-white font-bold">25,000+</strong> happy hackers &amp; 400+ hackathons served.</span>
        </div>

      </div>
    </section>
  );
}
