import React from 'react';
import type { Metadata } from 'next';
import { LandingPageContent } from '../components/landing';

export const metadata: Metadata = {
  title: 'almosthack — The Operating System for Hackathons',
  description:
    'Run hackathons without mental breakdowns. Automated registrations, calibrated judging, real-time repository auditing, and transparent consensus calculation.',
  keywords: [
    'hackathon management software',
    'hackathon platform',
    'transparent judging',
    'organizer dashboard',
    'git commit verification',
    'almosthack',
  ],
  openGraph: {
    title: 'almosthack — The Operating System for Hackathons',
    description:
      'We handle the boring stuff. You enjoy the chaos. One resilient platform for registrations, teams, live Git integrity auditing, and calibrated scoring.',
    type: 'website',
    url: 'https://almosthack.io',
    siteName: 'almosthack',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'almosthack — The Operating System for Hackathons',
    description: 'Run hackathons without mental breakdowns. Zero spreadsheet archaeology.',
  },
};

export default function LandingPage() {
  return <LandingPageContent />;
}
