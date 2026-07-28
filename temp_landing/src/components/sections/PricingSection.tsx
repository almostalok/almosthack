'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      badge: 'Community & Student Events',
      priceMonthly: '$0',
      priceAnnual: '$0',
      desc: 'Everything you need to organize your first community or college hackathon.',
      features: [
        'Up to 300 Participants',
        'Custom Registration Form',
        'AI Team Matcher (Basic)',
        'Standard Judge Scoring Rubrics',
        'GitHub Project Submission Sync',
        'Digital PDF Certificates',
        'Community Discord Support',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Professional',
      badge: 'Most Popular for Growing Events',
      priceMonthly: '$149',
      priceAnnual: '$119',
      desc: 'Full-featured power OS for major university, regional, and community hackathons.',
      features: [
        'Up to 2,500 Participants',
        'QR Code Venue Attendance Scanning',
        'AI Fraud Shield & Duplicate Code Check',
        'Holographic LinkedIn Verifiable Certificates',
        'Sponsor Portal & Resume Booklet Export',
        'SMS & Discord Bot Push Broadcasts',
        'Priority 24/7 Organizer Support',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      badge: 'Universities & Corporations',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      desc: 'White-labeled custom domain, dedicated SLA, custom AI models, and SSO security.',
      features: [
        'Unlimited Participants & Tracks',
        'Custom Domain (hack.yourorg.edu)',
        'White-Labeled Branding & SSL',
        'Custom AI Judging Models',
        'Dedicated On-Site Event Architect',
        'SAML / SSO & SOC2 Security Report',
        'Custom API Integrations & SLA',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple plans for hackathons of any scale.
          </h2>
          <p className="text-muted text-base sm:text-lg">
            No hidden fees. Start free for community hackathons, upgrade as you grow.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!annual ? 'text-white' : 'text-white/50'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full bg-surface-50 border border-white/20 p-1 relative transition-colors"
            >
              <motion.div
                layout
                className={`w-4 h-4 rounded-full bg-accent ${annual ? 'ml-6' : 'ml-0'}`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${annual ? 'text-white' : 'text-white/50'}`}>
              Annual Billing
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-3xl border flex flex-col justify-between relative glass-card ${
                plan.popular
                  ? 'bg-surface border-accent/50 shadow-2xl shadow-accent/15 ring-1 ring-accent/30'
                  : 'bg-surface/50 border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white font-mono text-[11px] font-bold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> MOST POPULAR
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">{plan.badge}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                    {annual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  {plan.priceMonthly !== 'Custom' && (
                    <span className="text-xs text-white/50 font-mono">/ per event</span>
                  )}
                </div>

                <p className="text-xs text-muted leading-relaxed font-sans">{plan.desc}</p>

                <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-white/80">
                      <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <a
                  href="#final-cta"
                  className={`w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 group ${
                    plan.popular
                      ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25'
                      : 'bg-surface-50 border border-white/15 text-white hover:bg-white/10'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
