import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import TeamDashboardPage from '@/app/team-dashboard/page';
import { TeamAnalyticsOverview } from '@/components/team-dashboard/TeamAnalyticsOverview';
import { PerformanceMonitoringDashboard } from '@/components/team-dashboard/PerformanceMonitoringDashboard';
import { AdvancedClientFilters } from '@/components/team-dashboard/AdvancedClientFilters';
import { BulkOperationsPanel } from '@/components/team-dashboard/BulkOperationsPanel';
import { ClientDetailView } from '@/components/team-dashboard/ClientDetailView';
import { ClientImportWizard } from '@/components/team-dashboard/ClientImportWizard';
import { WorkflowTemplateManager } from '@/components/team-dashboard/WorkflowTemplateManager';
import { TeamModeErrorBoundary } from '@/components/team-dashboard/TeamModeErrorBoundary';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/team-dashboard'),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/providers/TeamModeProvider', () => ({
  useTeamMode: jest.fn(),
}));

jest.mock('@/hooks/useUsageLimits', () => ({
  useUsageLimits: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 className={className} {...props}>{children}</h3>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <p className={className} {...props}>{children}</p>
  ),
  CardFooter: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>{children}</span>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className, ...props }: any) => (
    <div className={className} {...props} data-value={value}>
      <div style={{ width: `${value}%` }} />
    </div>
  ),
}));

describe('Team Dashboard Components', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  };

  const mockAuth = {
    user: {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin User',
    },
    signOut: jest.fn(),
  };

  const mockTeamMode = {
    totalClientCount: 1258,
    selectedClients: [],
    clients: [],
    setCurrentTab: jest.fn(),
    currentTab: 'operations',
    searchQuery: '',
    setSearchQuery: jest.fn(),
    refreshClients: jest.fn(),
    clearSelection: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (useTeamMode as jest.Mock).mockReturnValue(mockTeamMode);
    (useUsageLimits as jest.Mock).mockReturnValue({
      hasFeatureAccess: (feature: string) => feature === 'teamDashboard',
      tier: { name: 'Team' },
    });
    jest.clearAllMocks();
  });

  describe('TeamDashboardPage', () => {
    it('renders welcome header with client count', () => {
      render(<TeamDashboardPage />);
      
      expect(screen.getByText('Welcome to Team Mode')).toBeInTheDocument();
      expect(screen.getByText(/Manage 1,258 clients/)).toBeInTheDocument();
    });

    it('redirects to operations page on mount', () => {
      render(<TeamDashboardPage />);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/team-dashboard/operations');
    });

    it('displays key metrics overview', () => {
      render(<TeamDashboardPage />);
      
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
      expect(screen.getByText('Avg Engagement')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('shows quick action cards', () => {
      render(<TeamDashboardPage />);
      
      expect(screen.getByText('Client Operations')).toBeInTheDocument();
      expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
      expect(screen.getByText('Workflow Automation')).toBeInTheDocument();
    });

    it('navigates to correct pages when quick actions are clicked', () => {
      render(<TeamDashboardPage />);
      
      const operationsCard = screen.getByText('Client Operations').closest('div');
      fireEvent.click(operationsCard!);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/team-dashboard/operations');
    });
  });

  describe('AdvancedClientFilters', () => {
    const mockOnFiltersChange = jest.fn();

    it('renders search input and filter controls', () => {
      render(
        <AdvancedClientFilters
          onFiltersChange={mockOnFiltersChange}
          clientCount={1258}
          filteredCount={1258}
        />
      );

      expect(screen.getByPlaceholderText(/Search clients/)).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('shows client count summary', () => {
      render(
        <AdvancedClientFilters
          onFiltersChange={mockOnFiltersChange}
          clientCount={1258}
          filteredCount={892}
        />
      );

      expect(screen.getByText('Showing 892 of 1,258 clients')).toBeInTheDocument();
    });

    it('calls onFiltersChange when search query changes', () => {
      render(
        <AdvancedClientFilters
          onFiltersChange={mockOnFiltersChange}
          clientCount={1258}
          filteredCount={1258}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search clients/);
      fireEvent.change(searchInput, { target: { value: 'tech' } });

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });

  describe('BulkOperationsPanel', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
      (useTeamMode as jest.Mock).mockReturnValue({
        ...mockTeamMode,
        selectedClients: ['client-1', 'client-2'],
      });
    });

    it('renders when clients are selected', () => {
      render(
        <BulkOperationsPanel
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('2 clients selected')).toBeInTheDocument();
    });

    it('shows bulk operation options', () => {
      render(
        <BulkOperationsPanel
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Run Accelerate Workflow')).toBeInTheDocument();
      expect(screen.getByText('Schedule Bulk Posts')).toBeInTheDocument();
      expect(screen.getByText('Generate Analytics Reports')).toBeInTheDocument();
    });

    it('does not render when no clients selected', () => {
      (useTeamMode as jest.Mock).mockReturnValue({
        ...mockTeamMode,
        selectedClients: [],
      });

      const { container } = render(
        <BulkOperationsPanel
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('ClientDetailView', () => {
    const mockOnBack = jest.fn();

    it('renders client details when client exists', () => {
      render(
        <ClientDetailView
          clientId="client-1"
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('TechStart Pro')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('shows not found message for invalid client ID', () => {
      render(
        <ClientDetailView
          clientId="invalid-client"
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Client not found')).toBeInTheDocument();
    });

    it('calls onBack when back button is clicked', () => {
      render(
        <ClientDetailView
          clientId="invalid-client"
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByText('Back to Clients');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('TeamAnalyticsOverview', () => {
    it('renders analytics header and metrics', () => {
      render(<TeamAnalyticsOverview />);

      expect(screen.getByText('Team Analytics')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive insights across/)).toBeInTheDocument();
    });

    it('shows key performance indicators', () => {
      render(<TeamAnalyticsOverview />);

      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
    });

    it('displays platform analysis tabs', () => {
      render(<TeamAnalyticsOverview />);

      expect(screen.getByText('Platform Analysis')).toBeInTheDocument();
      expect(screen.getByText('Industry Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Performance Trends')).toBeInTheDocument();
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
    });
  });

  describe('PerformanceMonitoringDashboard', () => {
    it('renders performance monitoring header', () => {
      render(<PerformanceMonitoringDashboard />);

      expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
      expect(screen.getByText(/Real-time insights across/)).toBeInTheDocument();
    });

    it('shows performance metrics cards', () => {
      render(<PerformanceMonitoringDashboard />);

      expect(screen.getByText('Total Engagement')).toBeInTheDocument();
      expect(screen.getByText('Average Reach')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  describe('ClientImportWizard', () => {
    it('renders import wizard steps', () => {
      render(<ClientImportWizard />);

      expect(screen.getByText('Source Selection')).toBeInTheDocument();
      expect(screen.getByText('Choose your data source')).toBeInTheDocument();
    });

    it('shows import source options', () => {
      render(<ClientImportWizard />);

      expect(screen.getByText('Spreadsheet Upload')).toBeInTheDocument();
      expect(screen.getByText('Text Document')).toBeInTheDocument();
      expect(screen.getByText('API Integration')).toBeInTheDocument();
      expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    });
  });

  describe('WorkflowTemplateManager', () => {
    it('renders template manager header', () => {
      render(<WorkflowTemplateManager />);

      expect(screen.getByText('Workflow Templates')).toBeInTheDocument();
      expect(screen.getByText('Create New Template')).toBeInTheDocument();
    });

    it('shows drag and drop area for importing', () => {
      render(<WorkflowTemplateManager />);

      expect(screen.getByText('Drag & Drop Workflow JSON Here')).toBeInTheDocument();
    });

    it('displays existing templates', () => {
      render(<WorkflowTemplateManager />);

      expect(screen.getByText('Standard Accelerate Workflow')).toBeInTheDocument();
      expect(screen.getByText('Blitz Scheduling Campaign')).toBeInTheDocument();
      expect(screen.getByText('Monthly Performance Cycle')).toBeInTheDocument();
    });
  });

  describe('TeamModeErrorBoundary', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('renders children when no error occurs', () => {
      render(
        <TeamModeErrorBoundary>
          <ThrowError shouldThrow={false} />
        </TeamModeErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders error UI when error occurs', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <TeamModeErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TeamModeErrorBoundary>
      );

      expect(screen.getByText('Team Mode Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('shows custom fallback when provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const customFallback = <div>Custom error message</div>;

      render(
        <TeamModeErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </TeamModeErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('handles team mode provider state changes', async () => {
      const { rerender } = render(<TeamDashboardPage />);

      // Update team mode state
      (useTeamMode as jest.Mock).mockReturnValue({
        ...mockTeamMode,
        totalClientCount: 2000,
        selectedClients: ['client-1'],
      });

      rerender(<TeamDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Manage 2,000 clients/)).toBeInTheDocument();
      });
    });

    it('handles authentication state changes', () => {
      const { rerender } = render(<TeamDashboardPage />);

      // Update auth state
      (useAuth as jest.Mock).mockReturnValue({
        ...mockAuth,
        user: {
          ...mockAuth.user,
          name: 'New Admin',
        },
      });

      rerender(<TeamDashboardPage />);

      // Component should still render correctly with new auth state
      expect(screen.getByText('Welcome to Team Mode')).toBeInTheDocument();
    });

    it('handles router navigation correctly', () => {
      render(<TeamDashboardPage />);

      // Verify initial navigation call
      expect(mockRouter.push).toHaveBeenCalledWith('/team-dashboard/operations');
    });
  });

  describe('Performance Tests', () => {
    it('renders efficiently with large client counts', () => {
      const largeTeamMode = {
        ...mockTeamMode,
        totalClientCount: 1000000,
      };

      (useTeamMode as jest.Mock).mockReturnValue(largeTeamMode);

      const startTime = performance.now();
      render(<TeamDashboardPage />);
      const endTime = performance.now();

      // Should render in reasonable time even with large numbers
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByText(/Manage 1,000,000 clients/)).toBeInTheDocument();
    });

    it('handles rapid state updates without performance issues', async () => {
      const { rerender } = render(<TeamDashboardPage />);

      // Simulate rapid state updates
      for (let i = 0; i < 10; i++) {
        (useTeamMode as jest.Mock).mockReturnValue({
          ...mockTeamMode,
          totalClientCount: 1000 + i,
        });

        rerender(<TeamDashboardPage />);
      }

      await waitFor(() => {
        expect(screen.getByText(/Manage 1,009 clients/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<TeamDashboardPage />);

      // Check for proper heading structure
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome to Team Mode');

      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', () => {
      render(<TeamDashboardPage />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);
    });
  });
}); 