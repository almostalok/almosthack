import React from 'react';
import './globals.css';

export const metadata = {
  title: 'almosthack — The Transparent Hackathon Operating System',
  description: 'Verifiable, auditable, and explainable hackathon operating system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-zinc-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black font-body">
        {children}
      </body>
    </html>
  );
}
