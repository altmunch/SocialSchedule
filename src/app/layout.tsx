import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { PerformanceMonitor, reportWebVitals } from '@/lib/performance';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ClipsCommerce - AI-Powered Content Creation',
    template: '%s | ClipsCommerce'
  },
  description: 'Transform your content strategy with AI-powered video creation, competitor analysis, and automated workflows.',
  keywords: ['AI content', 'video creation', 'social media', 'automation', 'competitor analysis'],
  authors: [{ name: 'ClipsCommerce Team' }],
  creator: 'ClipsCommerce',
  publisher: 'ClipsCommerce',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://clipscommerce.com'),
  alternates: {
    canonical: '/',
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ClipsCommerce - AI-Powered Content Creation',
    description: 'Transform your content strategy with AI-powered video creation, competitor analysis, and automated workflows.',
    siteName: 'ClipsCommerce',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClipsCommerce - AI-Powered Content Creation',
    description: 'Transform your content strategy with AI-powered video creation, competitor analysis, and automated workflows.',
    creator: '@clipscommerce',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance monitoring
              if (typeof window !== 'undefined') {
                // Web Vitals tracking
                function vitalsHandler(metric) {
                  const body = JSON.stringify(metric);
                  const url = '/api/analytics/web-vitals';
                  
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon(url, body);
                  } else {
                    fetch(url, { body, method: 'POST', keepalive: true });
                  }
                }
                
                // Load Web Vitals library dynamically
                import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                  getCLS(vitalsHandler);
                  getFID(vitalsHandler);
                  getFCP(vitalsHandler);
                  getLCP(vitalsHandler);
                  getTTFB(vitalsHandler);
                });
                
                // Start performance monitoring
                window.addEventListener('load', () => {
                  if (window.PerformanceMonitor) {
                    window.PerformanceMonitor.getInstance().startMonitoring();
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
