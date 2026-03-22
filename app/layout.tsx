import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { LanguageProvider } from '@/lib/language-context';

export const metadata: Metadata = {
  title: 'SentinelAI — AI-Powered Scam Call Defense',
  description: 'Advanced cybersecurity platform using AI voice analysis, fraud detection, and threat intelligence to protect against scam calls.',
  keywords: ['cybersecurity', 'scam detection', 'AI', 'voice analysis', 'fraud prevention'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-sentinel-bg antialiased">
        <div className="ambient-glow" />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
