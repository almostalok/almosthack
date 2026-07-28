'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, MessageSquare, Video, ShieldCheck, Mail, CreditCard, Cpu, ArrowUpRight } from 'lucide-react';

export function IntegrationsSection() {
  const integrations = [
    { name: 'GitHub Sync', desc: 'Auto-verify commits, pull requests, and repo creation timestamps.', icon: Github },
    { name: 'Discord Bot', desc: 'Instant role assignment, team channels, and automated broadcasts.', icon: MessageSquare },
    { name: 'Slack Connect', desc: 'Real-time alert notifications and organizer chat integration.', icon: MessageSquare },
    { name: 'Zoom & Google Meet', desc: 'Automated video room creation for mentor sessions & judging pitch calls.', icon: Video },
    { name: 'WhatsApp Bot', desc: 'Send emergency venue updates & schedule push alerts.', icon: MessageSquare },
    { name: 'OpenAI API', desc: 'Powering automated rubric summaries and fraud detection.', icon: Cpu },
    { name: 'Stripe Payments', desc: 'Ticket sales, sponsor invoice billing, and prize disbursements.', icon: CreditCard },
    { name: 'Google Workspace', desc: 'Import guest lists, sync Google Calendar schedules automatically.', icon: Mail },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono text-accent tracking-widest uppercase px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            CONNECTIVITY & APIS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Fits right into your stack.
          </h2>
          <p className="text-muted text-base sm:text-lg">
            Native integrations with the tools your team, judges, and hackers already use every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-6 rounded-2xl bg-surface border border-white/10 glass-card-hover glass-card space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Native
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
