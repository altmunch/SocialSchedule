import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';

// Initialize Inter font with optimized settings
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Base URL for the application
const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SocialSchedule - AI-Powered Social Media Scheduler',
    template: '%s | SocialSchedule'
  },
  description: "Schedule smarter, grow faster, and dominate social media with AI-powered scheduling",
  keywords: ["social media scheduler", "AI scheduling", "content calendar", "social media management", "automation"],
  authors: [{ name: "SocialSchedule Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "SocialSchedule - AI-Powered Social Media Scheduler",
    description: "Schedule smarter, grow faster, and dominate social media with AI-powered scheduling",
    siteName: "SocialSchedule",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SocialSchedule - AI-Powered Social Media Scheduler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialSchedule - AI-Powered Social Media Scheduler',
    description: 'Schedule smarter, grow faster, and dominate social media with AI-powered scheduling',
    images: ['/og-image.jpg'],
    creator: '@socialschedule',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
      {children}
    </div>
  );
}
