import React from 'react';
import './globals.css';
import { AuthProvider, QueryProvider } from '../providers';
import { Baloo_2, DM_Sans, IBM_Plex_Mono } from 'next/font/google';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata = {
  title: 'AlmostHack — The Hackathon Operating System',
  description: 'One platform to create, manage, judge and run your entire hackathon — without the chaos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${baloo.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-[#0B0D0C] text-[#F5F7F4] min-h-screen antialiased selection:bg-[#A8E63B]/20 selection:text-[#A8E63B] font-body">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
