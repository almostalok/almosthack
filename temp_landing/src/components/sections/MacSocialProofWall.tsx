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
    },
    {
      name: 'Lenny Rachitsky',
      handle: '@lennysan',
      avatar: 'L',
      text: 'My new favorite hackathon platform experience. So unique, engaging, and dead simple for organizers.',
      time: '4/27/26, 1:51 PM',
      reposts: '19',
      likes: '526',
    },
    {
      name: 'William Wang',
      handle: '@iamwilliamwang',
      avatar: 'W',
      text: 'Cool idea, been manually checking github PRs and demo videos, this AI copilot is the 10x version haha!',
      time: '4/6/26, 6:12 PM',
      reposts: '8',
      likes: '151',
    },
    {
      name: 'Josh Pigford',
      handle: '@Shpigford',
      avatar: 'J',
      text: 'dear lord baby jesus please hide AlmostHack from all the grifters so they don\'t ruin how good it is.',
      time: '4/27/26, 3:21 AM',
      reposts: '4',
      likes: '154',
    },
    {
      name: 'Aaron Epstein',
      handle: '@aaron_epstein',
      avatar: 'A',
      text: 'Wild new @almosthack demo just dropped 👀 Auto repo evaluation + crypto certificates is 🔥',
      time: '6/16/26, 2:12 PM',
      reposts: '4',
      likes: '102',
    },
    {
      name: 'Sharif Shameem',
      handle: '@sharifshameem',
      avatar: 'S',
      text: 'AI code review + live leaderboard during our hackathon was black magic. Saved us 20 hours.',
      time: '4/25/26, 11:39 PM',
      reposts: '12',
      likes: '310',
    },
  ];

  return (
    <section id="feedback" className="py-28 bg-[#051C14] text-white relative overflow-hidden select-none transition-colors duration-300">
      
      {/* Top Ticker Marquee */}
      <div className="w-full overflow-hidden py-4 bg-[#F5F8F0] text-[#072419] border-y-2 border-[#0D3A29] mb-16 font-mono text-xs uppercase tracking-widest font-extrabold">
        <div className="animate-marquee flex gap-12">
          {Array(8).fill(0).map((_, i) => (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <span>Organizers Love AlmostHack Every Day</span>
              <span className="w-2 h-2 rounded-full bg-[#0D3A29]" />
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="optimizely-pill-pink shadow-md mb-3">
            [ SOCIAL PROOF ]
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white">
            They Use It{' '}
            <span className="serif-accent text-[#ABFF44] font-normal">
              Every Single Event
            </span>
          </h2>
          <p className="mt-3 text-slate-300 font-sans text-base leading-relaxed">
            Trusted by lead community builders, startup founders, and global developer hackathons.
          </p>
        </div>

        {/* 3-Column Wall */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <SpotlightCard
                spotlightColor="rgba(171, 255, 68, 0.15)"
                className="optimizely-card rounded-3xl flex flex-col justify-between overflow-hidden p-6 hover:shadow-[-7px_7px_0_0_#0D3A29] transition-all"
              >
                <div className="flex flex-col justify-between flex-1 gap-4 font-sans">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ABFF44] border-2 border-[#0D3A29] flex items-center justify-center font-bold text-[#072419] font-mono text-sm shadow-sm">
                          {t.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-sm text-[#072419] flex items-center gap-1">
                            {t.name}
                            <IconVerifiedCheck size={14} className="text-[#0D3A29] fill-[#0D3A29]" />
                          </span>
                          <span className="font-mono text-xs text-[#557365] font-semibold">{t.handle}</span>
                        </div>
                      </div>
                      <span className="optimizely-pill-pink text-[9px] px-2 py-0.5">
                        Follow
                      </span>
                    </div>

                    <p className="text-sm text-[#072419] leading-relaxed font-sans font-medium">
                      {t.text}
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-[#0D3A29] flex items-center justify-between font-mono text-xs text-[#557365] font-bold">
                    <span>{t.time}</span>
                    <div className="flex items-center gap-3">
                      <span className="hover:text-[#072419] transition-colors">🔁 {t.reposts}</span>
                      <span className="hover:text-pink-600 transition-colors">❤️ {t.likes}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 max-w-3xl mx-auto optimizely-card p-5 bg-[#F5F8F0] border-2 border-[#0D3A29] text-center font-mono text-xs sm:text-sm text-[#072419] flex items-center justify-center gap-3 shadow-[-4px_4px_0_0_#0D3A29]">
          <IconSparkle size={16} className="text-[#0D3A29]" />
          <span><strong className="text-[#072419] font-black">50,000+</strong> hackers &amp; 400+ hackathons served worldwide.</span>
        </div>

      </div>
    </section>
  );
}
