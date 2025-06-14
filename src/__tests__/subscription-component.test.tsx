import React from 'react';
import { render, screen } from '@testing-library/react';
import SubscriptionComponent from '@/components/dashboard/SubscriptionComponent';
import { useAuth } from '@/providers/AuthProvider';

// Mock the Auth Provider
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const mockUser = {
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SubscriptionComponent', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn(),
      session: null,
    });
  });

  it('renders subscription management without navigation', () => {
    render(<SubscriptionComponent />);
    
    // Should have the subscription title but not navigation
    expect(screen.getByText('Subscription')).toBeInTheDocument();
    expect(screen.getByText('Manage your subscription plan and billing')).toBeInTheDocument();
    
    // Should NOT have navigation elements that would be in the landing page
    expect(screen.queryByText('Get Started Free')).not.toBeInTheDocument();
    expect(screen.queryByText('AI-powered e-commerce content creation')).not.toBeInTheDocument();
  });

  it('renders the three pricing tiers', () => {
    render(<SubscriptionComponent />);
    
    expect(screen.getByText('Lite')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('shows the correct pricing for Pro tier', () => {
    render(<SubscriptionComponent />);
    
    // Should show $70/month for Pro tier (check for multiple instances)
    expect(screen.getAllByText('$70/month')).toHaveLength(2);
  });

  it('renders the tab navigation for Plans, Billing, and Invoices', () => {
    render(<SubscriptionComponent />);
    
    expect(screen.getByText('Plans')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('shows the yearly/monthly toggle', () => {
    render(<SubscriptionComponent />);
    
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
    expect(screen.getByText('Save 20%')).toBeInTheDocument();
  });

  it('shows the Team plan as popular', () => {
    render(<SubscriptionComponent />);
    
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('displays Pro as current plan by default', () => {
    render(<SubscriptionComponent />);
    
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });
}); 