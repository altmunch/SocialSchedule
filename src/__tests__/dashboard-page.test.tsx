import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock the useAuth hook
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('DashboardPage', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders the greeting with the user\'s email', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Hello, test/i)).toBeInTheDocument();
  });

  it('renders the "Sell Better" and "How to Sell" workflow cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Sell Better')).toBeInTheDocument();
    expect(screen.getByText('How to Sell')).toBeInTheDocument();
  });

  it('renders the "Sales" and "Conversion" performance charts', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();
  });

  it('renders the onboarding progress bar', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Onboarding Progress')).toBeInTheDocument();
  });
}); 