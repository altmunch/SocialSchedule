'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="relative min-h-screen w-full">
        <main className="relative flex-1">
          {children}
        </main>
      </div>
    </NextThemesProvider>
  );
}
