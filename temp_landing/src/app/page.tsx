'use client';

import React, { useState } from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { VercelHero } from '@/components/sections/VercelHero';
import { TrustedByMarquee } from '@/components/sections/TrustedByMarquee';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { FeatureShowcase } from '@/components/sections/FeatureShowcase';
import { InteractiveRoleDashboard } from '@/components/sections/InteractiveRoleDashboard';
import { WhyAlmostHack } from '@/components/sections/WhyAlmostHack';
import { AIEngineSection } from '@/components/sections/AIEngineSection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { CertificateGeneratorPreview } from '@/components/sections/CertificateGeneratorPreview';
import { JudgeScoringSimulator } from '@/components/sections/JudgeScoringSimulator';
import { MetricsSection } from '@/components/sections/MetricsSection';
import { IntegrationsSection } from '@/components/sections/IntegrationsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { CommandMenu } from '@/components/sections/CommandMenu';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/layout/Footer';
import { DemoModal } from '@/components/ui/DemoModal';

export default function Home() {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan/30 selection:text-white font-sans relative">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Vercel Sticky Navigation Bar */}
      <Navbar
        onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
      />

      {/* 1. Vercel Tech Brutalism Hero with 3D Dashboard Mockup */}
      <VercelHero
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
      />

      {/* 2. Partner Logo Marquee */}
      <TrustedByMarquee />

      {/* 3. The Problem & Paradigm Shift */}
      <ProblemSolution />

      {/* 4. Deep Feature Showcase (15 Modules Sticky Scroll) */}
      <FeatureShowcase />

      {/* 5. Interactive Role-Based Dashboard Switcher */}
      <InteractiveRoleDashboard />

      {/* 6. Why AlmostHack Bento Grid */}
      <WhyAlmostHack />

      {/* 7. AI Engine & Prompt Sandbox with 3D Holographic AI Core */}
      <AIEngineSection />

      {/* 8. Event Lifecycle Timeline */}
      <TimelineSection />

      {/* 9. Interactive Cryptographic Certificate Builder with 3D Trophy */}
      <CertificateGeneratorPreview />

      {/* 10. Judge Scoring Simulator */}
      <JudgeScoringSimulator />

      {/* 11. Stat Metrics Counters */}
      <MetricsSection />

      {/* 12. Integrations Ecosystem Grid */}
      <IntegrationsSection />

      {/* 13. Testimonials & Social Proof */}
      <TestimonialsSection />

      {/* 14. Transparent Pricing & Comparison */}
      <PricingSection />

      {/* 15. FAQ Accordion */}
      <FaqSection />

      {/* 16. Final Conversion CTA */}
      <FinalCTA onOpenDemoModal={() => setIsDemoModalOpen(true)} />

      {/* Footer */}
      <Footer />

      {/* Cmd+K Spotlight Command Menu */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
      />

      {/* Booking / Demo Video Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </main>
  );
}
