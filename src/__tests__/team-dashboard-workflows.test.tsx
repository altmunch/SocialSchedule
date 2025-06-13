import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamWorkflowsPage from '@/app/team-dashboard/workflows/page';

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

jest.mock('@/components/team-dashboard/WorkflowTemplateManager', () => ({
  WorkflowTemplateManager: () => <div data-testid="workflow-template-manager">Workflow Template Manager</div>,
}));

jest.mock('@/components/team-dashboard/WorkflowScheduler', () => ({
  WorkflowScheduler: () => <div data-testid="workflow-scheduler">Workflow Scheduler</div>,
}));

describe('TeamWorkflowsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workflows page with all components', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByTestId('team-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('team-header')).toBeInTheDocument();
    expect(screen.getByText('Workflow Automation')).toBeInTheDocument();
    expect(screen.getByText('Manage automated workflows for 1,258 clients')).toBeInTheDocument();
  });

  it('sets current tab to workflows on mount', () => {
    render(<TeamWorkflowsPage />);
    expect(mockSetCurrentTab).toHaveBeenCalledWith('workflows');
  });

  it('displays workflow statistics correctly', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    expect(screen.getAllByText('Completed')).toHaveLength(2); // Stats and filter option
    expect(screen.getAllByText('Failed')).toHaveLength(2); // Stats and filter option
    expect(screen.getAllByText('Clients Affected')).toHaveLength(5); // Stats card and workflow details
    
    // Check for workflow management text
    expect(screen.getByText('Manage automated workflows for 1,258 clients')).toBeInTheDocument();
  });

  it('displays workflow list with mock data', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByText('Daily Content Posting')).toBeInTheDocument();
    expect(screen.getByText('Engagement Analytics Report')).toBeInTheDocument();
    expect(screen.getByText('Influencer Outreach Campaign')).toBeInTheDocument();
    expect(screen.getByText('Comment Response Automation')).toBeInTheDocument();
  });

  it('displays workflow descriptions', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByText('Automated content posting across all platforms')).toBeInTheDocument();
    expect(screen.getByText('Weekly engagement metrics compilation')).toBeInTheDocument();
    expect(screen.getByText('Automated outreach to potential brand partners')).toBeInTheDocument();
    expect(screen.getByText('AI-powered comment responses and engagement')).toBeInTheDocument();
  });

  it('displays workflow status badges', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getAllByText('Completed')).toHaveLength(2); // Badge and filter option
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getAllByText('Failed')).toHaveLength(2); // Badge and filter option
  });

  it('displays priority badges', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getAllByText('high priority')).toHaveLength(2);
    expect(screen.getByText('medium priority')).toBeInTheDocument();
    expect(screen.getByText('low priority')).toBeInTheDocument();
  });

  it('handles search functionality', () => {
    render(<TeamWorkflowsPage />);
    
    const searchInput = screen.getByPlaceholderText('Search workflows...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Content' } });
    
    // Should still show Daily Content Posting
    expect(screen.getByText('Daily Content Posting')).toBeInTheDocument();
  });

  it('handles status filter', () => {
    render(<TeamWorkflowsPage />);
    
    const statusFilter = screen.getByDisplayValue('All Status');
    expect(statusFilter).toBeInTheDocument();
    
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    // Should filter to show only active workflows
    expect(screen.getByText('Daily Content Posting')).toBeInTheDocument();
  });

  it('handles type filter', () => {
    render(<TeamWorkflowsPage />);
    
    const typeFilter = screen.getByDisplayValue('All Types');
    expect(typeFilter).toBeInTheDocument();
    
    fireEvent.change(typeFilter, { target: { value: 'content' } });
    
    // Should filter to show only content workflows
    expect(screen.getByText('Daily Content Posting')).toBeInTheDocument();
  });

  it('displays workflow action buttons', () => {
    render(<TeamWorkflowsPage />);
    
    // Should have pause button for active workflow
    const pauseButtons = screen.getAllByRole('button');
    const pauseButton = pauseButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.classList.contains('lucide-pause');
    });
    expect(pauseButton).toBeInTheDocument();
    
    // Should have play button for paused workflow
    const playButton = pauseButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.classList.contains('lucide-play');
    });
    expect(playButton).toBeInTheDocument();
  });

  it('handles workflow action clicks', () => {
    render(<TeamWorkflowsPage />);
    
    // Find and click pause button for active workflow
    const pauseButtons = screen.getAllByRole('button');
    const pauseButton = pauseButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.classList.contains('lucide-pause');
    });
    
    if (pauseButton) {
      fireEvent.click(pauseButton);
      // The workflow status should change (this would be tested with state changes)
    }
  });

  it('displays new workflow and templates buttons', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByRole('button', { name: /new workflow/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
  });

  it('displays workflow progress bars', () => {
    render(<TeamWorkflowsPage />);
    
    // Check for progress text
    expect(screen.getByText('75%')).toBeInTheDocument(); // Daily Content Posting
    expect(screen.getByText('100%')).toBeInTheDocument(); // Engagement Analytics Report
    expect(screen.getByText('45%')).toBeInTheDocument(); // Influencer Outreach Campaign
    expect(screen.getByText('25%')).toBeInTheDocument(); // Comment Response Automation
  });

  it('displays clients affected numbers', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByText('156')).toBeInTheDocument(); // Daily Content Posting
    expect(screen.getByText('1,258')).toBeInTheDocument(); // Engagement Analytics Report
    expect(screen.getByText('89')).toBeInTheDocument(); // Influencer Outreach Campaign
    expect(screen.getByText('234')).toBeInTheDocument(); // Comment Response Automation
  });

  it('displays workflow templates', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByText('Content Automation')).toBeInTheDocument();
    expect(screen.getByText('Analytics Report')).toBeInTheDocument();
    expect(screen.getByText('Outreach Campaign')).toBeInTheDocument();
    expect(screen.getByText('Engagement Automation')).toBeInTheDocument();
  });

  it('renders workflow template manager and scheduler components', () => {
    render(<TeamWorkflowsPage />);
    
    expect(screen.getByTestId('workflow-template-manager')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-scheduler')).toBeInTheDocument();
  });

  it('displays time information correctly', () => {
    render(<TeamWorkflowsPage />);
    
    // Should show "Last run" and "Next run" text
    expect(screen.getAllByText(/Last run:/)).toHaveLength(4);
    expect(screen.getAllByText(/Next run:/)).toHaveLength(1); // Only active workflow has next run
  });
}); 