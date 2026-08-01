import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AlmostHack — The Modern Operating System for Hackathons',
  description:
    'End-to-end hackathon management platform for colleges, communities, and companies. Automate registrations, team formation, AI judging, and instant verifiable certificates.',
  keywords: [
    'Hackathon Platform',
    'Hackathon Management Software',
    'Hackathon Organizer Tool',
    'College Hackathon Platform',
    'AI Hackathon Management',
    'Developer Event Platform',
    'Innovation Challenge Platform',
  ],
  openGraph: {
    title: 'AlmostHack — The Modern Operating System for Hackathons',
    description:
      'Build better hackathons without the chaos. From registration to instant certificates—everything unified in one platform.',
    url: 'https://almosthack.com',
    siteName: 'AlmostHack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlmostHack — The Modern Operating System for Hackathons',
    description: 'Build better hackathons without the chaos. Powered by AI.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <body className="bg-background text-foreground antialiased selection:bg-cyan/30 selection:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

