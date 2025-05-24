import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SocialSchedule - AI-Powered Social Media Management',
  description: 'Schedule, analyze, and grow your social media presence with our powerful AI tools.',
  keywords: ['social media', 'scheduling', 'analytics', 'AI', 'marketing', 'content creation'],
  authors: [{ name: 'SocialSchedule Team' }],
  creator: 'SocialSchedule',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1A1F2C' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
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
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
