import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTeamMode } from '@/providers/TeamModeProvider';
import TeamDashboardPage from '@/app/team-dashboard/page';

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

// Mock UI components with minimal implementation
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

describe('Team Dashboard - Optimized Tests', () => {
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
    jest.clearAllMocks();
  });

  describe('TeamDashboardPage Core Functionality', () => {
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
      if (operationsCard) {
        fireEvent.click(operationsCard);
        expect(mockRouter.push).toHaveBeenCalledWith('/team-dashboard/operations');
      }
    });
  });

  describe('System Status', () => {
    it('displays system health metrics', () => {
      render(<TeamDashboardPage />);
      
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('API Response Time')).toBeInTheDocument();
      expect(screen.getByText('System Uptime')).toBeInTheDocument();
      expect(screen.getByText('Active Connections')).toBeInTheDocument();
    });
  });

  describe('Recent Activity', () => {
    it('shows recent activity section', () => {
      render(<TeamDashboardPage />);
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });
}); 