'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Zap,
  Bot,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export function WhyAlmostHack() {
  const cards = [
    {
      title: 'Everything In One Place',
      desc: 'Replace 7 fragmented tools. Registrations, team matching, judging, communications, live schedules, and certificates unified in a single OS.',
      colSpan: 'lg:col-span-8',
      icon: Layers,
      highlight: 'Unified Ecosystem',
    },
    {
      title: 'Real-Time Updates',
      desc: 'Subsecond websocket updates across mobile and desktop. Instant schedule changes and live broadcast notifications.',
      colSpan: 'lg:col-span-4',
      icon: Zap,
      highlight: '<10ms Latency',
    },
    {
      title: 'AI-Powered Judging & Fraud Shield',
      desc: 'Automated code similarity checks, duplicate repo detection, and unbiased weighted scoring algorithms.',
      colSpan: 'lg:col-span-4',
      icon: Bot,
      highlight: 'Zero Bias',
    },
    {
      title: 'Zero Manual Work & Instant Certificates',
      desc: 'Generate thousands of verifiable certificates with custom templates, automated LinkedIn badges, and 1-click PDF exports.',
      colSpan: 'lg:col-span-8',
      icon: Sparkles,
      highlight: 'Automated Lifecycle',
    },
    {
      title: 'Mobile Ready & QR Gate Control',
      desc: 'Optimized touch interface for organizers, mentors, and hackers on venue floors with instant QR scanner integration.',
      colSpan: 'lg:col-span-6',
      icon: Smartphone,
      highlight: 'Native Experience',
    },
    {
      title: 'Enterprise Security & Custom Domains',
      desc: 'SOC2 compliant, custom white-labeled domains (hack.yourdomain.com), SSO support, and dedicated SLA support.',
      colSpan: 'lg:col-span-6',
      icon: ShieldCheck,
      highlight: 'Bank-Grade Security',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            WHY ALMOSTHACK
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for perfection. <br />
            <span className="text-gradient-accent">Built for scale.</span>
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Discover why top hackathon organizers switch from spreadsheets to AlmostHack.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-8 rounded-3xl bg-surface border border-white/10 glass-card-hover glass-card space-y-4 relative overflow-hidden group ${card.colSpan}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-accent px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                    {card.highlight}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed font-normal">
                  {card.desc}
                </p>

                <div className="pt-4 flex items-center gap-1 text-xs text-white/50 group-hover:text-white transition-colors font-mono">
                  <span>Learn technical details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
