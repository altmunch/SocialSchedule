import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface PreloadOptions {
  delay?: number; // Delay before prefetching (ms)
  priority?: 'low' | 'high';
}

export function useNavPreload() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const preloadRoute = useCallback((
    route: string, 
    options: PreloadOptions = {}
  ) => {
    const { delay = 100, priority = 'low' } = options;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for delayed prefetch
    timeoutRef.current = setTimeout(() => {
      try {
        // Prefetch the route
        router.prefetch(route);
        
        // For high priority routes, also prefetch related resources
        if (priority === 'high') {
          // Pre-warm critical data for the route
          // This would typically integrate with your data fetching library
          // For example, with React Query:
          // queryClient.prefetchQuery(['dashboard-data', route]);
        }
      } catch (error) {
        console.warn('Route prefetch failed:', route, error);
      }
    }, delay);
  }, [router]);

  const cancelPreload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Enhanced preload function with mouse position tracking
  const smartPreload = useCallback((
    route: string, 
    event: React.MouseEvent,
    options: PreloadOptions = {}
  ) => {
    // Only preload if mouse is moving towards the element
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Simple heuristic: if mouse is in the element and moving slowly, likely to click
    const isLikelyToClick = mouseX > 0 && mouseX < rect.width && 
                           mouseY > 0 && mouseY < rect.height;
    
    if (isLikelyToClick) {
      preloadRoute(route, { ...options, priority: 'high' });
    }
  }, [preloadRoute]);

  return {
    preloadRoute,
    cancelPreload,
    smartPreload,
    
    // Convenience functions for different interaction patterns
    onHover: (route: string, options?: PreloadOptions) => ({
      onMouseEnter: () => preloadRoute(route, options),
      onMouseLeave: cancelPreload
    }),

    onFocus: (route: string, options?: PreloadOptions) => ({
      onFocus: () => preloadRoute(route, { ...options, priority: 'high' }),
      onBlur: cancelPreload
    }),

    onSmartHover: (route: string, options?: PreloadOptions) => ({
      onMouseMove: (e: React.MouseEvent) => smartPreload(route, e, options),
      onMouseLeave: cancelPreload
    })
  };
}

// Hook for preloading dashboard data
export function useDashboardPreload() {
  const { preloadRoute } = useNavPreload();

  const preloadDashboardRoute = useCallback((route: string) => {
    // Preload the route
    preloadRoute(route, { priority: 'high' });
    
    // Here you would also preload the data specific to that dashboard page
    // For example:
    // - For /dashboard/accelerate: preload video optimization data
    // - For /dashboard/blitz: preload autoposting calendar data
    // - For /dashboard/cycle: preload analytics data
    // - For /dashboard/ideator: preload content ideas
    
    switch (route) {
      case '/dashboard/accelerate':
        // queryClient.prefetchQuery(['optimization-data']);
        break;
      case '/dashboard/blitz':
        // queryClient.prefetchQuery(['calendar-data']);
        break;
      case '/dashboard/cycle':
        // queryClient.prefetchQuery(['analytics-data']);
        break;
      case '/dashboard/ideator':
        // queryClient.prefetchQuery(['content-ideas']);
        break;
      default:
        // queryClient.prefetchQuery(['dashboard-overview']);
    }
  }, [preloadRoute]);

  return { preloadDashboardRoute };
} 