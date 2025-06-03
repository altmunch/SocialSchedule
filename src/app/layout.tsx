import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1A1F2C' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export const metadata: Metadata = {
  title: 'ClipsCommerce - AI-Powered E-commerce Content Platform',
  description: 'Create, optimize, and scale your e-commerce content with AI-powered tools for maximum engagement and sales.',
  keywords: ['e-commerce', 'AI content', 'product marketing', 'social commerce', 'AI video', 'content optimization'],
  authors: [{ name: 'ClipsCommerce Team' }],
  creator: 'ClipsCommerce',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clipscommerce.com',
    title: 'ClipsCommerce - AI-Powered E-commerce Content Platform',
    description: 'Create, optimize, and scale your e-commerce content with AI-powered tools for maximum engagement and sales.',
    siteName: 'ClipsCommerce',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClipsCommerce - AI-Powered E-commerce Content Platform',
    description: 'Create, optimize, and scale your e-commerce content with AI-powered tools for maximum engagement and sales.',
    creator: '@clipscommerce',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground min-h-screen">
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
