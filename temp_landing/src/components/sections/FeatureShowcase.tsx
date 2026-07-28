'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Users,
  Award,
  FileCode,
  Trophy,
  Calendar,
  QrCode,
  FileBadge,
  Eye,
  BarChart3,
  Bot,
  Bell,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'registration',
      title: 'Registration Management',
      icon: UserPlus,
      desc: 'Customizable registration forms, instant eligibility screening, role assignment, and automated RSVP workflows.',
      badge: 'Zero Friction',
      preview: {
        title: 'Custom Registration Portal',
        stat1: '1,420 Registered',
        stat2: '99.4% Completion',
        detail: 'Instant RSVP verification & automated Discord role assignment upon registration.',
      },
    },
    {
      id: 'team-formation',
      title: 'AI Team Formation',
      icon: Users,
      desc: 'Algorithmic matchmaking connects solo hackers based on tech stack, experience level, timezones, and project ideas.',
      badge: 'AI Engine',
      preview: {
        title: 'Smart Matching Hub',
        stat1: '320 Teams Formed',
        stat2: '94% Compatibility',
        detail: 'Matching React & Python devs with UI designers automatically before hacking begins.',
      },
    },
    {
      id: 'judge-portal',
      title: 'Bias-Proof Judge Portal',
      icon: Award,
      desc: 'Standardized scoring rubrics, code repo verification, duplicate entry shields, and weighted score calculations.',
      badge: 'Fair Scoring',
      preview: {
        title: 'Judge Evaluation Interface',
        stat1: '24 Judges Active',
        stat2: '148 Projects Scored',
        detail: '1-click rubric scoring with automated AI code originality verification.',
      },
    },
    {
      id: 'leaderboard',
      title: 'Live Interactive Leaderboard',
      icon: Trophy,
      desc: 'Real-time score updates, track winner reveals, audience choice voting, and automated winner announcements.',
      badge: 'Real-Time',
      preview: {
        title: 'Grand Finale Leaderboard',
        stat1: '$50,000 Prize Pool',
        stat2: '12 Tracks',
        detail: 'Dynamic animated leaderboard revealed live on stage with sound effects & confetti.',
      },
    },
    {
      id: 'certificates',
      title: 'Automated Verifiable Certificates',
      icon: FileBadge,
      desc: 'Generate holographic digital certificates for thousands of hackers, mentors, and judges with cryptographic verification links.',
      badge: '1-Click Export',
      preview: {
        title: 'Instant Certificate Vault',
        stat1: '1,420 Issued',
        stat2: '100% Cryptographic',
        detail: 'Direct LinkedIn badge integration & high-res PDF downloads with custom design templates.',
      },
    },
    {
      id: 'sponsor-dashboard',
      title: 'Sponsor Visibility & ROI',
      icon: Eye,
      desc: 'Dedicated sponsor portal for API key distribution, track management, resume booklet downloads, and talent scouting.',
      badge: 'High ROI',
      preview: {
        title: 'Sponsor Talent Portal',
        stat1: '12 Global Sponsors',
        stat2: '450 Hires Scouted',
        detail: 'Filter participants by GitHub contributions, tech stack expertise, and location.',
      },
    },
    {
      id: 'qr-attendance',
      title: 'QR Code Attendance & Swag',
      icon: QrCode,
      desc: 'Lightning-fast mobile check-in at venue gates, meal tracking, swag distribution, and workshop attendance logs.',
      badge: 'Instant Scan',
      preview: {
        title: 'Venue Gate Scanner',
        stat1: '0.8s Check-in Speed',
        stat2: '3,200 Scans Today',
        detail: 'Scan participant QR badges for venue entry, lunch boxes, and exclusive swag packs.',
      },
    },
    {
      id: 'analytics',
      title: 'Comprehensive Post-Event Analytics',
      icon: BarChart3,
      desc: 'Deep metrics on registration conversion, track breakdown, participant demographics, and project success metrics.',
      badge: 'Deep Insights',
      preview: {
        title: 'Executive Report Suite',
        stat1: '95% Satisfaction',
        stat2: '28 Page Report',
        detail: 'Export investor-ready PDF summaries & CSV metrics in 1 click.',
      },
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            THE PLATFORM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Every feature a hackathon needs. <br />
            <span className="text-gradient-accent">Nothing it doesn’t.</span>
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Purpose-built components designed to operate together seamlessly.
          </p>
        </div>

        {/* Feature Grid & Sticky Interactive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Feature Buttons */}
          <div className="lg:col-span-5 space-y-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isSelected = activeFeature === idx;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-sm flex items-start gap-4 group ${
                    isSelected
                      ? 'bg-surface-50 border-accent/50 shadow-lg shadow-accent/10'
                      : 'bg-surface/50 border-white/10 hover:border-white/20 hover:bg-surface'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white/5 text-white/60 border-white/10 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {feature.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Sticky Preview Display Card */}
          <div className="lg:col-span-7 sticky top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={features[activeFeature].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-3xl bg-surface border border-white/15 glass-card shadow-2xl space-y-6 relative overflow-hidden"
              >
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/20 border border-accent/30 text-accent">
                      {React.createElement(features[activeFeature].icon, { className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {features[activeFeature].preview.title}
                      </h3>
                      <span className="text-xs text-white/50 font-mono">
                        Modulo: {features[activeFeature].id}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active & Synced
                  </span>
                </div>

                {/* Key Metrics Pill Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="text-white/50 text-xs">Primary Metric</div>
                    <div className="text-2xl font-bold text-white font-mono mt-1">
                      {features[activeFeature].preview.stat1}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="text-white/50 text-xs">Performance Rating</div>
                    <div className="text-2xl font-bold text-accent font-mono mt-1">
                      {features[activeFeature].preview.stat2}
                    </div>
                  </div>
                </div>

                {/* Interactive Detail Box */}
                <div className="p-5 rounded-2xl bg-surface-50 border border-white/10 space-y-3">
                  <div className="text-xs font-semibold text-white/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Live Operational Highlights
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    {features[activeFeature].preview.detail}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-accent font-semibold">
                    <span>Explore module options</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
