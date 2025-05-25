import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1A1F2C' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export const metadata: Metadata = {
  title: 'SocialSchedule - AI-Powered Social Media Management',
  description: 'Schedule, analyze, and grow your social media presence with our powerful AI tools.',
  keywords: ['social media', 'scheduling', 'analytics', 'AI', 'marketing', 'content creation'],
  authors: [{ name: 'SocialSchedule Team' }],
  creator: 'SocialSchedule',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://socialschedule.app',
    title: 'SocialSchedule - AI-Powered Social Media Management',
    description: 'Schedule, analyze, and grow your social media presence with our powerful AI tools.',
    siteName: 'SocialSchedule',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialSchedule - AI-Powered Social Media Management',
    description: 'Schedule, analyze, and grow your social media presence with our powerful AI tools.',
    creator: '@socialschedule',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div id="root">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
