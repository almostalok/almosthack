'use client';

import React, { useState } from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { ClickyHeroSection } from '@/components/sections/ClickyHeroSection';
import { TrustedByMarquee } from '@/components/sections/TrustedByMarquee';
import { NotesManifestoSection } from '@/components/sections/NotesManifestoSection';
import { FeatureShowcase } from '@/components/sections/FeatureShowcase';
import { InteractiveRoleDashboard } from '@/components/sections/InteractiveRoleDashboard';
import { AIEngineSection } from '@/components/sections/AIEngineSection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { CertificateGeneratorPreview } from '@/components/sections/CertificateGeneratorPreview';
import { JudgeScoringSimulator } from '@/components/sections/JudgeScoringSimulator';
import { MacSocialProofWall } from '@/components/sections/MacSocialProofWall';
import { MacPricingSection } from '@/components/sections/MacPricingSection';
import { MacFaqSection } from '@/components/sections/MacFaqSection';
import { CommandMenu } from '@/components/sections/CommandMenu';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/layout/Footer';
import { DemoModal } from '@/components/ui/DemoModal';
import { ParticlesBackground } from '@/components/reactbits/ParticlesBackground';

export default function Home() {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-cyan/30 font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* ReactBits Dynamic Ambient Particle Starfield Background */}
      <ParticlesBackground />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* macOS HeyClicky Dark Status Navbar */}
      <Navbar
        onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
      />

      {/* 1. HeyClicky Dark Desktop Window Hero */}
      <ClickyHeroSection
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
      />

      {/* 2. Partner Logo Marquee */}
      <TrustedByMarquee />

      {/* 3. The Dream Manifesto */}
      <NotesManifestoSection />

      {/* 4. Interactive Role-Based Dashboard Switcher */}
      <InteractiveRoleDashboard />

      {/* 5. Deep Feature Showcase */}
      <FeatureShowcase />

      {/* 6. AI Engine Autopilot Core */}
      <AIEngineSection />

      {/* 7. Event Lifecycle Timeline */}
      <TimelineSection />

      {/* 8. Cryptographic Certificate Generator */}
      <CertificateGeneratorPreview />

      {/* 9. Judge Rubric Simulator */}
      <JudgeScoringSimulator />

      {/* 10. Social Proof Wall */}
      <MacSocialProofWall />

      {/* 11. Pricing */}
      <MacPricingSection onOpenDemoModal={() => setIsDemoModalOpen(true)} />

      {/* 12. FAQ */}
      <MacFaqSection />

      {/* 13. Final Conversion Callout */}
      <FinalCTA onOpenDemoModal={() => setIsDemoModalOpen(true)} />

      {/* Footer */}
      <Footer />

      {/* Interactive Command Palette Modal (Cmd + K) */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
      />

      {/* Interactive Demo Request Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </main>
  );
}
