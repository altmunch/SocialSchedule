import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTeamMode } from '@/providers/TeamModeProvider';
import TeamOperationsPage from '@/app/team-dashboard/operations/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/team-dashboard/operations'),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/providers/TeamModeProvider', () => ({
  useTeamMode: jest.fn(),
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

// Mock team dashboard components
jest.mock('@/components/team-dashboard/AdvancedClientFilters', () => ({
  AdvancedClientFilters: ({ onFiltersChange, clientCount, filteredCount }: any) => (
    <div data-testid="advanced-client-filters">
      <span>Showing {filteredCount} of {clientCount} clients</span>
    </div>
  ),
}));

jest.mock('@/components/team-dashboard/BulkOperationsPanel', () => ({
  BulkOperationsPanel: ({ selectedCount, onBulkAction, onClose }: any) => (
    <div data-testid="bulk-operations-panel">
      <span>{selectedCount} clients selected</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/team-dashboard/ClientDetailView', () => ({
  ClientDetailView: ({ client, onClose }: any) => (
    <div data-testid="client-detail-view">
      <h2>{client.name} Details</h2>
      <button onClick={onClose}>Close Details</button>
    </div>
  ),
}));

jest.mock('@/components/team-dashboard/TeamSidebar', () => ({
  TeamSidebar: () => (
    <div data-testid="team-sidebar">Team Sidebar</div>
  ),
}));

jest.mock('@/components/team-dashboard/TeamHeader', () => ({
  TeamHeader: () => (
    <div data-testid="team-header">Team Header</div>
  ),
}));

describe('Team Dashboard Operations Page', () => {
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

  describe('Page Layout', () => {
    it('renders the main layout components', () => {
      render(<TeamOperationsPage />);
      
      expect(screen.getByTestId('team-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('team-header')).toBeInTheDocument();
      expect(screen.getByText('Client Operations')).toBeInTheDocument();
    });

    it('displays the correct page title and description', () => {
      render(<TeamOperationsPage />);
      
      expect(screen.getByText('Client Operations')).toBeInTheDocument();
      expect(screen.getByText(/Manage 1,258 clients/)).toBeInTheDocument();
    });

    it('sets the current tab to operations on mount', () => {
      render(<TeamOperationsPage />);
      
      expect(mockTeamMode.setCurrentTab).toHaveBeenCalledWith('operations');
    });
  });

  describe('Action Buttons', () => {
    it('renders action buttons in the header', () => {
      render(<TeamOperationsPage />);
      
      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('calls refreshClients when refresh button is clicked', () => {
      render(<TeamOperationsPage />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      expect(mockTeamMode.refreshClients).toHaveBeenCalled();
    });
  });

  describe('Client List', () => {
    it('renders the client list with mock data', () => {
      render(<TeamOperationsPage />);
      
      expect(screen.getByText(/Clients \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Mike Chen')).toBeInTheDocument();
      expect(screen.getByText('Emma Davis')).toBeInTheDocument();
    });

    it('displays client information correctly', () => {
      render(<TeamOperationsPage />);
      
      expect(screen.getByText('sarah@example.com')).toBeInTheDocument();
      expect(screen.getByText('8.5% engagement')).toBeInTheDocument();
      expect(screen.getByText('125,000 followers')).toBeInTheDocument();
    });
  });

  describe('Client Filters', () => {
    it('renders the advanced client filters component', () => {
      render(<TeamOperationsPage />);
      
      expect(screen.getByTestId('advanced-client-filters')).toBeInTheDocument();
    });
  });
}); 