'use client';

import * as React from 'react';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering children after mount
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
