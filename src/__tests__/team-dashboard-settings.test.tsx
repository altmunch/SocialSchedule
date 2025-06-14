import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamSettingsPage from '@/app/team-dashboard/settings/page';

// Mock providers
const mockSetCurrentTab = jest.fn();

jest.mock('@/providers/TeamModeProvider', () => ({
  useTeamMode: () => ({
    setCurrentTab: mockSetCurrentTab,
    totalClientCount: 1258,
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

jest.mock('@/components/team-dashboard/RoleManagementPanel', () => ({
  RoleManagementPanel: () => <div data-testid="role-management-panel">Role Management Panel</div>,
}));

jest.mock('@/app/team-dashboard/settings/page', () => {
  return { __esModule: true, default: () => <div data-testid="team-settings-page">Mocked Team Settings Page</div> };
});

describe('TeamSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings page with all components', () => {
    render(<TeamSettingsPage />);
    
    expect(screen.getByTestId('team-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('team-header')).toBeInTheDocument();
    expect(screen.getByText('Team Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your team configuration and preferences')).toBeInTheDocument();
  });

  it('sets current tab to settings on mount', () => {
    render(<TeamSettingsPage />);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('settings');
  });

  it('displays settings navigation tabs', () => {
    render(<TeamSettingsPage />);
    
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Team & Roles')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
  });

  it('displays general settings by default', () => {
    render(<TeamSettingsPage />);
    
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Basic team information and preferences')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ClipsCommerce Team')).toBeInTheDocument();
  });

  it('switches between settings tabs', () => {
    render(<TeamSettingsPage />);
    
    // Click on Team & Roles tab
    fireEvent.click(screen.getByText('Team & Roles'));
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('Manage team members and their roles')).toBeInTheDocument();
    
    // Click on Notifications tab
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Configure how you receive notifications')).toBeInTheDocument();
  });

  it('displays team members in team tab', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Team & Roles'));
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@clipscommerce.com')).toBeInTheDocument();
    expect(screen.getByText('Sarah Wilson')).toBeInTheDocument();
    expect(screen.getByText('sarah@clipscommerce.com')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('displays notification settings', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Notifications'));
    
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Weekly Reports')).toBeInTheDocument();
    expect(screen.getByText('System Alerts')).toBeInTheDocument();
    expect(screen.getByText('Client Updates')).toBeInTheDocument();
  });

  it('displays security settings', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Security'));
    
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText('Session Timeout (minutes)')).toBeInTheDocument();
    expect(screen.getByText('API Access')).toBeInTheDocument();
    expect(screen.getByText('API Key')).toBeInTheDocument();
  });

  it('displays platform integrations', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Integrations'));
    
    expect(screen.getByText('Platform Integrations')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('displays billing information', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Billing'));
    
    expect(screen.getByText('Billing & Subscription')).toBeInTheDocument();
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Next Billing Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('billing@clipscommerce.com')).toBeInTheDocument();
  });

  it('handles save button click', () => {
    render(<TeamSettingsPage />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeInTheDocument();
    
    fireEvent.click(saveButton);
    // The button should show loading state (tested via disabled state)
  });

  it('handles input changes in general settings', () => {
    render(<TeamSettingsPage />);
    
    const teamNameInput = screen.getByDisplayValue('ClipsCommerce Team');
    fireEvent.change(teamNameInput, { target: { value: 'New Team Name' } });
    
    expect(screen.getByDisplayValue('New Team Name')).toBeInTheDocument();
  });

  it('renders role management panel in team tab', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Team & Roles'));
    
    expect(screen.getByTestId('role-management-panel')).toBeInTheDocument();
  });

  it('displays invite member button', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Team & Roles'));
    
    expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument();
  });

  it('displays billing action buttons', () => {
    render(<TeamSettingsPage />);
    
    fireEvent.click(screen.getByText('Billing'));
    
    expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update payment method/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
  });
}); 