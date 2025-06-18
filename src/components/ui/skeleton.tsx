import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Enhanced skeleton components for specific dashboard content types
function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

function ChartSkeleton({ 
  type = "area", 
  height = 300, 
  className 
}: { 
  type?: "area" | "line" | "bar" | "pie" | "gauge";
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="space-y-4">
        {/* Chart header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        {/* Chart area */}
        <div className="relative" style={{ height }}>
          {type === "area" && (
            <div className="absolute inset-0 space-y-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex items-end h-full space-x-1">
                  {Array.from({ length: 12 }, (_, j) => (
                    <Skeleton 
                      key={j} 
                      className="w-6 rounded-t-sm" 
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          
          {type === "line" && (
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full rounded-lg" />
              <div className="absolute inset-4 flex justify-between items-end">
                {Array.from({ length: 12 }, (_, i) => (
                  <Skeleton key={i} className="w-2 h-2 rounded-full" />
                ))}
              </div>
            </div>
          )}
          
          {type === "bar" && (
            <div className="absolute inset-0 flex items-end justify-between p-4 space-x-2">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-8 rounded-t-sm" 
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
            </div>
          )}
          
          {type === "pie" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          )}
          
          {type === "gauge" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full" />
              </div>
            </div>
          )}
        </div>
        
        {/* Chart legend */}
        <div className="flex justify-center space-x-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton({ 
  items = 4, 
  className 
}: { 
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskListSkeleton({ 
  items = 3, 
  className 
}: { 
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function QuickActionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  );
}

// Comprehensive dashboard skeleton matching V3 layout
function DashboardPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <QuickActionSkeleton key={i} />
        ))}
      </div>
      
      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Summary */}
        <div className="lg:col-span-2">
          <ChartSkeleton type="area" height={300} />
        </div>
        
        {/* Activity Feed */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <ActivityFeedSkeleton items={4} />
        </div>
      </div>
      
      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <TaskListSkeleton items={3} />
        </div>
        
        {/* Additional Chart */}
        <ChartSkeleton type="bar" height={200} />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  MetricCardSkeleton,
  ChartSkeleton,
  ActivityFeedSkeleton,
  TaskListSkeleton,
  QuickActionSkeleton,
  DashboardPageSkeleton
};
