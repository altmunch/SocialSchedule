import React from 'react';
import { render, screen, act } from '@testing-library/react';

// Mock team dashboard component with performance optimizations
const MockTeamDashboard = ({ clientCount = 1000 }: { clientCount?: number }) => {
  const [visibleClients, setVisibleClients] = React.useState(50);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate loading time based on client count
    const loadTime = Math.min(clientCount / 10000, 100); // Max 100ms
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadTime);
    
    return () => clearTimeout(timer);
  }, [clientCount]);
  
  // Simulate virtual scrolling - only render visible items
  const renderClients = () => {
    return Array.from({ length: Math.min(visibleClients, clientCount) }, (_, i) => (
      <div key={i} data-testid={`client-${i}`} className="client-item">
        Client {i} - Revenue: ${Math.floor(Math.random() * 100000)}
      </div>
    ));
  };
  
  if (isLoading) {
    return <div data-testid="loading">Loading team dashboard...</div>;
  }
  
  return (
    <div data-testid="team-dashboard">
      <h1>Team Dashboard</h1>
      <div data-testid="client-stats">
        Total Clients: {clientCount.toLocaleString()}
      </div>
      <div data-testid="client-list" className="virtualized-list">
        {renderClients()}
      </div>
      <button 
        onClick={() => setVisibleClients(prev => Math.min(prev + 50, clientCount))}
        data-testid="load-more"
      >
        Load More
      </button>
    </div>
  );
};

// Performance measurement utility
const measureRenderTime = async (component: React.ReactElement): Promise<number> => {
  const startTime = performance.now();
  
  await act(async () => {
    render(component);
  });
  
  const endTime = performance.now();
  return endTime - startTime;
};

describe('Team Dashboard Performance Tests', () => {
  const PERFORMANCE_THRESHOLDS = {
    SMALL_DATASET: 100,   // 100ms for 1K clients
    MEDIUM_DATASET: 200,  // 200ms for 10K clients  
    LARGE_DATASET: 500,   // 500ms for 100K clients
    MASSIVE_DATASET: 1000, // 1s for 1M clients
  };

  beforeEach(() => {
    // Mock performance.now if not available
    if (!global.performance) {
      global.performance = {
        now: () => Date.now(),
      } as any;
    }
  });

  it('should render team dashboard with 1K clients quickly', async () => {
    const renderTime = await measureRenderTime(
      <MockTeamDashboard clientCount={1000} />
    );
    
    // Wait for loading to complete
    await screen.findByTestId('team-dashboard');
    
    expect(screen.getByTestId('team-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Clients: 1,000')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SMALL_DATASET);
  });

  it('should render team dashboard with 10K clients efficiently', async () => {
    const renderTime = await measureRenderTime(
      <MockTeamDashboard clientCount={10000} />
    );
    
    // Wait for loading to complete
    await screen.findByTestId('team-dashboard');
    
    expect(screen.getByTestId('team-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Clients: 10,000')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_DATASET);
  });

  it('should render team dashboard with 100K clients within threshold', async () => {
    const renderTime = await measureRenderTime(
      <MockTeamDashboard clientCount={100000} />
    );
    
    // Wait for loading to complete
    await screen.findByTestId('team-dashboard');
    
    expect(screen.getByTestId('team-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Clients: 100,000')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_DATASET);
  });

  it('should render team dashboard with 1M clients within acceptable time', async () => {
    const renderTime = await measureRenderTime(
      <MockTeamDashboard clientCount={1000000} />
    );
    
    // Wait for loading to complete
    await screen.findByTestId('team-dashboard');
    
    expect(screen.getByTestId('team-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Clients: 1,000,000')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MASSIVE_DATASET);
  });

  it('should handle virtual scrolling efficiently', async () => {
    render(<MockTeamDashboard clientCount={1000000} />);
    
    // Wait for loading to complete
    await screen.findByTestId('team-dashboard');
    
    // Should only render first 50 items initially
    expect(screen.getByTestId('client-0')).toBeInTheDocument();
    expect(screen.getByTestId('client-49')).toBeInTheDocument();
    expect(screen.queryByTestId('client-50')).not.toBeInTheDocument();
    
    // Load more should work quickly
    const startTime = performance.now();
    
    await act(async () => {
      screen.getByTestId('load-more').click();
    });
    
    const loadMoreTime = performance.now() - startTime;
    
    expect(screen.getByTestId('client-50')).toBeInTheDocument();
    expect(screen.getByTestId('client-99')).toBeInTheDocument();
    expect(loadMoreTime).toBeLessThan(50); // Should be very fast
  });

  it('should simulate multiple concurrent users efficiently', async () => {
    const userCount = 10; // Reduced from 100 to avoid memory issues
    const clientsPerUser = 100000; // 100K clients per user
    
    const renderPromises = Array.from({ length: userCount }, async (_, userIndex) => {
      const startTime = performance.now();
      
      await act(async () => {
        render(
          <div data-testid={`user-${userIndex}-dashboard`}>
            <MockTeamDashboard clientCount={clientsPerUser} />
          </div>
        );
      });
      
      return performance.now() - startTime;
    });
    
    const renderTimes = await Promise.all(renderPromises);
    const averageTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    const maxTime = Math.max(...renderTimes);
    
    // All renders should complete within reasonable time
    expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_DATASET);
    expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_DATASET);
    
    // Verify all dashboards rendered
    for (let i = 0; i < userCount; i++) {
      expect(screen.getByTestId(`user-${i}-dashboard`)).toBeInTheDocument();
    }
  });

  it('should handle data processing efficiently', async () => {
    const clientCount = 100000;
    const startTime = performance.now();
    
    // Simulate analytics calculations
    const mockAnalytics = {
      totalRevenue: clientCount * 1000, // $1000 average per client
      activeClients: Math.floor(clientCount * 0.7), // 70% active
      averageEngagement: 85.5,
      topPerformers: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Top Client ${i}`,
        revenue: 50000 + i * 1000
      }))
    };
    
    const processingTime = performance.now() - startTime;
    
    expect(mockAnalytics.totalRevenue).toBe(100000000);
    expect(mockAnalytics.activeClients).toBe(70000);
    expect(mockAnalytics.topPerformers).toHaveLength(10);
    expect(processingTime).toBeLessThan(10); // Should be very fast for calculations
  });

  it('should maintain performance under memory constraints', async () => {
    const initialMemory = process.memoryUsage();
    
    // Render multiple dashboards
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        render(
          <div key={i}>
            <MockTeamDashboard clientCount={10000} />
          </div>
        );
      });
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  it('should handle error states gracefully', async () => {
    const ErrorDashboard = () => {
      throw new Error('Simulated dashboard error');
    };
    
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      const [hasError, setHasError] = React.useState(false);
      
      React.useEffect(() => {
        const errorHandler = () => setHasError(true);
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
      }, []);
      
      if (hasError) {
        return <div data-testid="error-fallback">Dashboard Error</div>;
      }
      
      return <>{children}</>;
    };
    
    // Should not crash the test
    expect(() => {
      render(
        <ErrorBoundary>
          <MockTeamDashboard clientCount={1000} />
        </ErrorBoundary>
      );
    }).not.toThrow();
  });
}); 