'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, FileCode, ThumbsUp } from 'lucide-react';

export function MetricsSection() {
  const metrics = [
    { label: 'Hackathons Powered', value: '500+', icon: Trophy, desc: 'Across 45 countries worldwide' },
    { label: 'Global Hackers', value: '50,000+', icon: Users, desc: 'Registered builders & students' },
    { label: 'Projects Submitted', value: '20,000+', icon: FileCode, desc: 'Verified GitHub repositories' },
    { label: 'Organizer Satisfaction', value: '95%', icon: ThumbsUp, desc: 'NPS rating from event leads' },
  ];

  return (
    <section className="py-20 border-y border-white/10 bg-[#090C14] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center space-y-2 group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight group-hover:text-accent transition-colors">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-white/90">{metric.label}</div>
                <div className="text-xs text-white/50">{metric.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
