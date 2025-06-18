'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Skeleton components for better loading UX
function GenericSkeleton({ title = 'Loading...', rows = 3 }: { title?: string; rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 mb-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}

// Generic lazy loading wrapper for better performance
function withLazyLoading<C extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: C }>,
  fallback?: React.ReactNode,
  displayName?: string
) {
  type ComponentProps = React.ComponentProps<C>;

  function LazyWrapper(props: ComponentProps) {
    const LazyComponent = lazy(importFn);
    
    return (
      <Suspense fallback={fallback || <GenericSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  LazyWrapper.displayName = displayName || 'LazyWrapper';
  return LazyWrapper;
}

// Loading component for better UX
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin mr-2" />
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);

// Dashboard Components - Heavy components that should be lazy loaded
export const LazyDashboardComponents = {
  AccelerateComponent: lazy(() => 
    import('@/app/dashboard/v2/accelerate/page').then(module => ({
      default: module.default
    }))
  ),
  BlitzComponent: lazy(() => 
    import('@/app/dashboard/v2/blitz/page').then(module => ({
      default: module.default
    }))
  ),
  CycleComponent: lazy(() => 
    import('@/app/dashboard/v2/cycle/page').then(module => ({
      default: module.default
    }))
  ),
  IdeatorComponent: lazy(() => 
    import('@/app/dashboard/v2/ideator/page').then(module => ({
      default: module.default
    }))
  ),
  ProfileComponent: lazy(() => 
    import('@/app/dashboard/v2/profile/page').then(module => ({
      default: module.default
    }))
  ),
  SettingsComponent: lazy(() => 
    import('@/app/dashboard/v2/settings/page').then(module => ({
      default: module.default
    }))
  ),
  SubscriptionComponent: lazy(() => 
    import('@/app/dashboard/v2/subscription/page').then(module => ({
      default: module.default
    }))
  ),
};

// Team Dashboard Components
export const LazyTeamDashboardComponents = {
  TeamDashboard: lazy(() => 
    import('@/components/team-dashboard/TeamDashboard').then(module => ({
      default: module.default
    }))
  ),
  BulkOperationsPanel: lazy(() => 
    import('@/components/team-dashboard/BulkOperationsPanel').then(module => ({
      default: module.default
    }))
  ),
  ClientDetailView: lazy(() => 
    import('@/components/team-dashboard/ClientDetailView').then(module => ({
      default: module.default
    }))
  ),
};

// Enhanced Recharts Components with better error handling
export const LazyRechartsComponents = {
  ResponsiveContainer: lazy(() => 
    import('recharts').then(module => ({
      default: module.ResponsiveContainer
    }))
  ),
  LineChart: lazy(() => 
    import('recharts').then(module => ({
      default: module.LineChart
    }))
  ),
  BarChart: lazy(() => 
    import('recharts').then(module => ({
      default: module.BarChart
    }))
  ),
  PieChart: lazy(() => 
    import('recharts').then(module => ({
      default: module.PieChart
    }))
  ),
  AreaChart: lazy(() => 
    import('recharts').then(module => ({
      default: module.AreaChart
    }))
  ),
  Line: lazy(() => 
    import('recharts').then(module => ({
      default: module.Line
    }))
  ),
  Bar: lazy(() => 
    import('recharts').then(module => ({
      default: module.Bar
    }))
  ),
  Area: lazy(() => 
    import('recharts').then(module => ({
      default: module.Area
    }))
  ),
  XAxis: lazy(() => 
    import('recharts').then(module => ({
      default: module.XAxis
    }))
  ),
  YAxis: lazy(() => 
    import('recharts').then(module => ({
      default: module.YAxis
    }))
  ),
  CartesianGrid: lazy(() => 
    import('recharts').then(module => ({
      default: module.CartesianGrid
    }))
  ),
  Tooltip: lazy(() => 
    import('recharts').then(module => ({
      default: module.Tooltip
    }))
  ),
  Legend: lazy(() => 
    import('recharts').then(module => ({
      default: module.Legend
    }))
  ),
  Cell: lazy(() => 
    import('recharts').then(module => ({
      default: module.Cell
    }))
  ),
};

// Framer Motion Components
export const LazyFramerComponents = {
  Motion: lazy(() => 
    import('framer-motion').then(module => ({
      default: module.motion
    }))
  ),
  AnimatePresence: lazy(() => 
    import('framer-motion').then(module => ({
      default: module.AnimatePresence
    }))
  ),
  LazyMotion: lazy(() => 
    import('framer-motion').then(module => ({
      default: module.LazyMotion
    }))
  ),
  domAnimation: lazy(() => 
    import('framer-motion').then(module => ({
      default: module.domAnimation
    }))
  ),
};

// Team Dashboard component lazy loaders using withLazyLoading
export const LazyTeamDashboard = withLazyLoading(
  () => import('../team-dashboard/TeamDashboard').then(m => ({ default: m.TeamDashboard })),
  <DashboardSkeleton />,
  'LazyTeamDashboard'
);

export const LazyPerformanceMonitoringDashboard = withLazyLoading(
  () => import('../team-dashboard/PerformanceMonitoringDashboard').then(m => ({ default: m.PerformanceMonitoringDashboard })),
  <ChartSkeleton />,
  'LazyPerformanceMonitoringDashboard'
);

export const LazyTeamAnalyticsOverview = withLazyLoading(
  () => import('../team-dashboard/TeamAnalyticsOverview').then(m => ({ default: m.TeamAnalyticsOverview })),
  <DashboardSkeleton />,
  'LazyTeamAnalyticsOverview'
);

export const LazyBulkOperationsPanel = withLazyLoading(
  () => import('../team-dashboard/BulkOperationsPanel').then(m => ({ default: m.BulkOperationsPanel })),
  <GenericSkeleton title="Loading Bulk Operations..." rows={6} />,
  'LazyBulkOperationsPanel'
);

export const LazyAdvancedClientFilters = withLazyLoading(
  () => import('../team-dashboard/AdvancedClientFilters').then(m => ({ default: m.AdvancedClientFilters })),
  <GenericSkeleton title="Loading Filters..." rows={3} />,
  'LazyAdvancedClientFilters'
);

export const LazyClientDetailView = withLazyLoading(
  () => import('../team-dashboard/ClientDetailView').then(m => ({ default: m.ClientDetailView })),
  <GenericSkeleton title="Loading Client Details..." rows={8} />,
  'LazyClientDetailView'
);

export const LazyWorkflowScheduler = withLazyLoading(
  () => import('../team-dashboard/WorkflowScheduler').then(m => ({ default: m.WorkflowScheduler })),
  <GenericSkeleton title="Loading Scheduler..." rows={5} />,
  'LazyWorkflowScheduler'
);

// Motion components (framer-motion is heavy)
export const LazyMotionComponents = {
  motion: withLazyLoading(
    () => import('framer-motion').then(m => ({
      default: m.motion
    })),
    <div>Loading animation...</div>,
    'LazyMotion'
  ),
  AnimatePresence: withLazyLoading(
    () => import('framer-motion').then(m => ({
      default: m.AnimatePresence
    })),
    <div>Loading animation...</div>,
    'LazyAnimatePresence'
  ),
};

// Wrapper component for consistent loading UI
export function LazyWrapper({ 
  children, 
  fallback, 
  loadingText = 'Loading component...' 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  loadingText?: string;
}) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner text={loadingText} />}>
      {children}
    </Suspense>
  );
}

export default {
  LazyDashboardComponents,
  LazyTeamDashboardComponents,
  LazyRechartsComponents,
  LazyFramerComponents,
  LazyWrapper,
}; 