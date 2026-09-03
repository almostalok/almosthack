'use client';

import React from 'react';
import {
  UserCheck,
  Users,
  GitBranch,
  FileCheck,
  Scale,
  ShieldCheck,
  Trophy,
  Award,
  ArrowRight,
} from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const pipelineSteps = [
    { name: 'Registration', icon: UserCheck },
    { name: 'Teams', icon: Users },
    { name: 'GitHub', icon: GitBranch },
    { name: 'Submission', icon: FileCheck },
    { name: 'Judging', icon: Scale },
    { name: 'Integrity', icon: ShieldCheck },
    { name: 'Results', icon: Trophy },
    { name: 'Certificates', icon: Award },
  ];

  return (
    <section id="pipeline" className="relative py-20 lg:py-28 bg-[#0B0D0C] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Problem Copy */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="text-[11px] font-mono tracking-widest text-[#A8E63B] uppercase font-semibold">
              HACKATHONS ARE HARD ENOUGH
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Stop running hackathons across ten different tools.
            </h2>

            <div className="space-y-2 text-sm text-[#A7AEA7] leading-relaxed">
              <p>
                Registrations here. Teams somewhere else. Submissions in a spreadsheet. Judges in
                another tool. Results buried in a document.
              </p>
              <p className="text-[#F5F7F4] font-medium pt-1">
                AlmostHack brings the entire operation into one workspace.
              </p>
            </div>
          </div>

          {/* Right Column: Connected Hackathon Pipeline */}
          <div className="lg:col-span-8 w-full">
            <div className="p-5 sm:p-7 rounded-2xl bg-[#111412] border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Subtle background grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="relative z-10">
                <div className="text-xs font-mono text-[#737A73] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8E63B]" />
                  <span>UNIFIED OPERATIONAL PIPELINE</span>
                </div>

                {/* Horizontal Connected Flow */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-2 items-center">
                  {pipelineSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isLast = idx === pipelineSteps.length - 1;
                    return (
                      <div key={step.name} className="relative flex flex-col items-center group">
                        {/* Node Card */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#151917] border border-white/10 flex items-center justify-center text-[#A8E63B] shadow-md group-hover:border-[#A8E63B]/50 group-hover:bg-[#1c221f] group-hover:scale-105 transition-all duration-200">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        {/* Node Label */}
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#A7AEA7] group-hover:text-white mt-2 text-center truncate max-w-full">
                          {step.name}
                        </span>

                        {/* Connecting Arrow on Desktop */}
                        {!isLast && (
                          <div className="hidden sm:block absolute -right-2 top-5 transform -translate-y-1/2 z-20 text-[#737A73]">
                            <ArrowRight className="w-3 h-3 text-white/20" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
