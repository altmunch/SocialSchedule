import './globals.css';

// Production metadata
export const metadata = {
  title: 'ClipsCommerce - AI-Powered Content That Sells',
  description: 'Transform your social media content into sales with AI-powered optimization. Generate viral content, automate posting, and boost conversions with ClipsCommerce.',
  keywords: 'AI content creation, social media automation, e-commerce marketing, viral content, TikTok marketing, Instagram marketing, content optimization',
  author: 'ClipsCommerce',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  canonical: 'https://clipscommerce.com',
  openGraph: {
    title: 'ClipsCommerce - AI-Powered Content That Sells',
    description: 'Transform your social media content into sales with AI-powered optimization.',
    type: 'website',
    url: 'https://clipscommerce.com',
    image: '/images/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClipsCommerce - AI-Powered Content That Sells',
    description: 'Transform your social media content into sales with AI-powered optimization.',
    image: '/images/twitter-card.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // Assuming React is globally available or correctly configured by Next.js
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://clipscommerce.com" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
