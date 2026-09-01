import React from 'react';
import { LandingShell } from '../components/landing/LandingShell';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/sections/01-HeroSection';
import { HackerExperienceSection } from '../components/landing/sections/08-HackerExperience';

export const metadata = {
  title: 'almosthack — The Operating System for Hackathons',
  description:
    'Run hackathons without mental breakdowns. Automated registrations, calibrated judging, real-time repository auditing, and transparent consensus calculation.',
};

export default function LandingPage() {
  return (
    <LandingShell>
      {/* Sticky B2B Navigation */}
      <LandingHeader />

      {/* Main Content Sections */}
      <main id="main-content">
        {/* 01: Hero */}
        <HeroSection />

        {/* 08: Hacker Experience */}
        <HackerExperienceSection />
      </main>
    </LandingShell>
  );
}
