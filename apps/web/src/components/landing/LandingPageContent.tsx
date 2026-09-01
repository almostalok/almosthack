'use client';

import React, { useState } from 'react';
import { LandingShell } from './LandingShell';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { DemoModal } from './DemoModal';

// 12 Product Story Sections
import { HeroSection } from './sections/01-HeroSection';
import { ProblemSection } from './sections/02-ProblemSection';
import { OrganizerExperienceSection } from './sections/03-OrganizerExperience';
import { OrganizerFeaturesSection } from './sections/04-OrganizerFeatures';
import { DashboardDemoSection } from './sections/05-DashboardDemo';
import { TransparentHackathonSection } from './sections/06-TransparentHackathon';
import { JudgeExperienceSection } from './sections/07-JudgeExperience';
import { HackerExperienceSection } from './sections/08-HackerExperience';
import { LiveOperationsSection } from './sections/09-LiveOperations';
import { HowItWorksSection } from './sections/10-HowItWorks';
import { SocialProofSection } from './sections/11-SocialProof';
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
      {/* Global Sticky Navbar */}
      <LandingHeader onBookDemo={handleOpenDemoModal} />

      {/* Main Narrative Flow */}
      <main id="main-content">
        {/* 01: Hero with Live Dashboard Demo */}
        <HeroSection onBookDemo={handleOpenDemoModal} />

        {/* 02: The Problem with Traditional Stack */}
        <ProblemSection />

        {/* 03: Organizer Command Center Experience */}
        <OrganizerExperienceSection />

        {/* 04: Complete Organizer Features Matrix */}
        <OrganizerFeaturesSection />

        {/* 05: Organizer Dashboard Deep Dive */}
        <DashboardDemoSection />

        {/* 06: The Transparent Hackathon (Core Pillar) */}
        <TransparentHackathonSection />

        {/* 07: Judge Experience & Double-Blind Rubrics */}
        <JudgeExperienceSection />

        {/* 08: Hacker Experience & Submission Pipeline */}
        <HackerExperienceSection />

        {/* 09: Real-Time Live Operations Telemetry */}
        <LiveOperationsSection />

        {/* 10: 4-Stage Lifecycle & Journey */}
        <HowItWorksSection />

        {/* 11: Community & Telemetry Social Proof */}
        <SocialProofSection />

        {/* 12: Primary Business Lead Capture */}
        <LeadCaptureSection onSuccessDemo={handleOpenDemoModal} />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Accessible Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemoModal} />
    </LandingShell>
  );
};
