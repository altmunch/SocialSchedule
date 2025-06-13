import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamAnalyticsPage from '@/app/team-dashboard/analytics/page';

// Mock providers
const mockSetCurrentTab = jest.fn();
const mockRefreshClients = jest.fn();

jest.mock('@/providers/TeamModeProvider', () => ({
  useTeamMode: () => ({
    setCurrentTab: mockSetCurrentTab,
    totalClientCount: 1258,
    refreshClients: mockRefreshClients,
  }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
  }),
}));

// Mock components
jest.mock('@/components/team-dashboard/TeamSidebar', () => ({
  TeamSidebar: () => <div data-testid="team-sidebar">Team Sidebar</div>,
}));

jest.mock('@/components/team-dashboard/TeamHeader', () => ({
  TeamHeader: () => <div data-testid="team-header">Team Header</div>,
}));

jest.mock('@/components/team-dashboard/TeamAnalyticsOverview', () => ({
  TeamAnalyticsOverview: () => <div data-testid="analytics-overview">Analytics Overview</div>,
}));

jest.mock('@/components/team-dashboard/PerformanceMonitoringDashboard', () => ({
  PerformanceMonitoringDashboard: () => <div data-testid="performance-dashboard">Performance Dashboard</div>,
}));

describe('TeamAnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics page with all components', () => {
    render(<TeamAnalyticsPage />);
    
    expect(screen.getByTestId('team-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('team-header')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
    expect(screen.getByText('Performance analytics for 1,258 clients')).toBeInTheDocument();
  });

  it('sets current tab to analytics on mount', () => {
    render(<TeamAnalyticsPage />);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('analytics');
  });

  it('displays overview metrics correctly', () => {
    render(<TeamAnalyticsPage />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$2,847,500')).toBeInTheDocument();
    expect(screen.getByText('Avg Engagement')).toBeInTheDocument();
    expect(screen.getByText('8.7%')).toBeInTheDocument();
    expect(screen.getByText('Total Reach')).toBeInTheDocument();
    expect(screen.getByText('15.6M')).toBeInTheDocument();
    expect(screen.getByText('Active Clients')).toBeInTheDocument();
    expect(screen.getByText('1,258')).toBeInTheDocument();
  });

  it('displays platform performance metrics', () => {
    render(<TeamAnalyticsPage />);
    
    expect(screen.getByText('Platform Performance')).toBeInTheDocument();
    expect(screen.getAllByText('TikTok').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Instagram').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('542 clients')).toBeInTheDocument();
    expect(screen.getByText('456 clients')).toBeInTheDocument();
    expect(screen.getByText('260 clients')).toBeInTheDocument();
  });

  it('displays top performers section', () => {
    render(<TeamAnalyticsPage />);
    
    expect(screen.getByText('Top Performers')).toBeInTheDocument();
    expect(screen.getByText('Lisa Wang')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    expect(screen.getByText('$22,100')).toBeInTheDocument();
    expect(screen.getByText('$15,420')).toBeInTheDocument();
    expect(screen.getByText('$8,750')).toBeInTheDocument();
  });

  it('displays recent insights section', () => {
    render(<TeamAnalyticsPage />);
    
    expect(screen.getByText('Recent Insights')).toBeInTheDocument();
    expect(screen.getByText('TikTok Engagement Surge')).toBeInTheDocument();
    expect(screen.getByText('Instagram Reels Opportunity')).toBeInTheDocument();
    expect(screen.getByText('YouTube Revenue Dip')).toBeInTheDocument();
  });

  it('handles time range selection', () => {
    render(<TeamAnalyticsPage />);
    
    const timeRangeButtons = screen.getAllByRole('button');
    const sevenDayButton = timeRangeButtons.find(button => button.textContent === '7d');
    const thirtyDayButton = timeRangeButtons.find(button => button.textContent === '30d');
    
    expect(sevenDayButton).toBeInTheDocument();
    expect(thirtyDayButton).toBeInTheDocument();
    
    if (thirtyDayButton) {
      fireEvent.click(thirtyDayButton);
      // In a real implementation, this would trigger data refresh
    }
  });

  it('handles refresh button click', async () => {
    render(<TeamAnalyticsPage />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockRefreshClients).toHaveBeenCalled();
    });
  });

  it('displays export button', () => {
    render(<TeamAnalyticsPage />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('renders analytics overview and performance dashboard components', () => {
    render(<TeamAnalyticsPage />);
    
    expect(screen.getByTestId('analytics-overview')).toBeInTheDocument();
    expect(screen.getByTestId('performance-dashboard')).toBeInTheDocument();
  });

  it('displays growth indicators correctly', () => {
    render(<TeamAnalyticsPage />);
    
    // Check for positive growth indicators
    expect(screen.getByText('+15.8% this month')).toBeInTheDocument();
    expect(screen.getByText('+12.3% this month')).toBeInTheDocument();
    expect(screen.getByText('+8.9% this month')).toBeInTheDocument();
    expect(screen.getByText('+5.2% this month')).toBeInTheDocument();
  });

  it('formats currency and numbers correctly', () => {
    render(<TeamAnalyticsPage />);
    
    // Check currency formatting
    expect(screen.getByText('$2,847,500')).toBeInTheDocument();
    expect(screen.getByText('$1,245,000')).toBeInTheDocument();
    expect(screen.getByText('$987,500')).toBeInTheDocument();
    expect(screen.getByText('$615,000')).toBeInTheDocument();
    
    // Check that reach formatting is correct
    expect(screen.getByText('15.6M')).toBeInTheDocument();
    expect(screen.getByText('1,258')).toBeInTheDocument();
  });

  it('displays insight impact badges', () => {
    render(<TeamAnalyticsPage />);
    
    const highImpactBadge = screen.getByText('high');
    const mediumImpactBadges = screen.getAllByText('medium');
    
    expect(highImpactBadge).toBeInTheDocument();
    expect(mediumImpactBadges).toHaveLength(2);
  });
}); 