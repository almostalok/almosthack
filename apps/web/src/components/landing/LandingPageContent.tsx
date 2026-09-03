'use client';

import React, { useState } from 'react';
import { LandingShell } from './LandingShell';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { DemoModal } from './DemoModal';

// Product Story Sections matching the exact visual specification reference
import { HeroSection } from './sections/01-HeroSection';
import { ProblemSection } from './sections/02-ProblemSection';
import { OrganizerFeaturesSection } from './sections/04-OrganizerFeatures';
import { OrganizerExperienceSection } from './sections/03-OrganizerExperience';
import { TransparentHackathonSection } from './sections/06-TransparentHackathon';
import { HowItWorksSection } from './sections/10-HowItWorks';
import { SocialProofSection } from './sections/11-SocialProof';
import { FAQSection } from './sections/FAQSection';
import { LeadCaptureSection } from './sections/12-LeadCapture';

export const LandingPageContent: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleOpenDemoModal = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseDemoModal = () => {
    setIsDemoModalOpen(false);
  };

  return (
    <LandingShell>
      {/* Floating Dark Navbar */}
      <LandingHeader onBookDemo={handleOpenDemoModal} />

      {/* Main Narrative Flow */}
      <main id="main-content">
        {/* 01: Hero with Visual Landscape Background, Live Dashboard & Integration Strip */}
        <HeroSection onBookDemo={handleOpenDemoModal} />

        {/* 02: The Problem & Unified Hackathon Pipeline */}
        <ProblemSection />

        {/* 03: Platform Features Matrix (6 distinct cards) */}
        <OrganizerFeaturesSection />

        {/* 04: Three User Experiences (Organizer, Judge, Hacker) */}
        <OrganizerExperienceSection />

        {/* 05: Transparent Judging & Scorecard Transparency */}
        <TransparentHackathonSection />

        {/* 06: How It Works (5-Step Horizontal Timeline) */}
        <HowItWorksSection />

        {/* 07: 2x2 Grid: Results Day, Certificates, Stats, Command Center */}
        <SocialProofSection />

        {/* 08: FAQ (2-Column Accordion) */}
        <FAQSection />

        {/* 09: Final Landscape CTA Banner */}
        <LeadCaptureSection onSuccessDemo={handleOpenDemoModal} />
      </main>

      {/* Dark Minimal Footer */}
      <LandingFooter />

      {/* Accessible Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemoModal} />
    </LandingShell>
  );
};
