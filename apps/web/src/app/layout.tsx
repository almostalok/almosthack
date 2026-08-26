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
  title: 'almosthack — The Transparent Hackathon Operating System',
  description: 'Verifiable, auditable, and explainable hackathon operating system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-[#F7F4EA] text-[#171914] min-h-screen antialiased selection:bg-[#E2EBDD] selection:text-[#274535] font-body">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
