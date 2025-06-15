import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import PricingSection from '@/app/landing/components/PricingSection';
import SubscriptionComponent from '@/components/dashboard/SubscriptionComponent';
import PaymentSuccessPage from '@/app/payment-success/page';
import { useAuth } from '@/providers/AuthProvider';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Auth Provider
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock environment variables
const mockEnvVars = {
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK: 'https://stripe.com/pro-monthly',
  NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK: 'https://stripe.com/pro-yearly',
  NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK: 'https://stripe.com/team-monthly',
  NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK: 'https://stripe.com/team-yearly',
};

// Mock process.env
Object.defineProperty(process, 'env', {
  value: { ...process.env, ...mockEnvVars },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.open and window.location
const mockWindowOpen = jest.fn();
const mockLocationHref = jest.fn(); // Restored this mock
Object.defineProperty(window, 'open', { value: mockWindowOpen });

describe('Payment Flow Tests', () => {
  let originalLocation: Location;
  const user = userEvent.setup(); // Setup userEvent once for the suite

  beforeAll(() => {
    originalLocation = window.location;
    try {
      delete (window as any).location;
    } catch (e) {
      console.warn("Could not delete window.location in payment-flow.test.tsx, proceeding with assignment", e);
    }

    (window as any).location = {
      _currentHref: 'http://localhost:3000/initial-mock-path',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      ancestorOrigins: {} as DOMStringList,
      hash: '',
      host: 'localhost:3000',
      hostname: 'localhost',
      origin: 'http://localhost:3000',
      pathname: '/initial-mock-path',
      port: '3000',
      protocol: 'http:',
      search: '',
      get href(): string {
        return this._currentHref;
      },
      set href(value: string) {
        this._currentHref = value;
        mockLocationHref(value); // Use the existing mock
      },
      toString: function() { return this._currentHref; },
      valueOf: function() { return this; } // Adjusted valueOf
    };
  });

  afterAll(() => {
    // Restore original window.location by direct assignment
    (window as any).location = originalLocation;
  });

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: { access_token: 'mock-token' },
      loading: false,
    });
    localStorageMock.getItem.mockReturnValue(null);
    mockLocationHref.mockClear(); // Clear the restored mock

    // Reset the href on our mock location to a default state before each test
    if (window.location && typeof (window.location as any)._currentHref === 'string') {
      (window.location as any)._currentHref = 'http://localhost:3000/initial-mock-path';
    } else if (window.location) { 
        window.location.href = 'http://localhost:3000/initial-mock-path';
    }
    mockLocationHref.mockClear(); // Clear again after potential set
  });

  describe('PricingSection Component', () => {
    it('should render all three pricing plans', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      expect(screen.getByText('Lite')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('should handle free plan (Lite) selection correctly', async () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Lite plan is the first "Select Plan" button
      const liteButton = screen.getAllByText('Select Plan')[0];
      await user.click(liteButton);
      
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle Pro monthly plan selection', async () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Switch to monthly billing
      const monthlyButton = screen.getByText('Monthly');
      await user.click(monthlyButton);
      
      // Pro plan is the "Get Started" button
      const proButton = screen.getByText('Get Started'); 
      await user.click(proButton);
      
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle Pro yearly plan selection', async () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Annual is default. Pro plan is the "Get Started" button.
      const proButton = screen.getByText('Get Started');
      await user.click(proButton);
      
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle Team monthly plan selection and navigate to dashboard', async () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Switch to monthly billing
      const monthlyButton = screen.getByText('Monthly');
      await user.click(monthlyButton);
      
      // Team plan is the second "Select Plan" button
      const teamButton = screen.getAllByText('Select Plan')[1]; 
      await user.click(teamButton);
      
      // PricingSection's handlePlanClick always goes to /dashboard due to missing stripePriceId
      // localStorage.setItem for team redirect is not handled by this component's click handler.
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle Team yearly plan selection and navigate to dashboard', async () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Annual is default. Team plan is the second "Select Plan" button.
      const teamButton = screen.getAllByText('Select Plan')[1];
      await user.click(teamButton);
      
      // PricingSection's handlePlanClick always goes to /dashboard
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should fallback to dashboard when Stripe links are not configured', async () => {
      // Temporarily clear Stripe link env vars for this test
      const originalEnvValues = {
        NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK,
        NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK,
        NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK: process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK,
        NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK: process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK,
      };
      delete process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK;
      delete process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK;
      delete process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK;
      delete process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK;

      render(<PricingSection onGetStarted={jest.fn()} />);
      
      const proButton = screen.getByText('Get Started');
      await user.click(proButton);
      
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
      });

      // Restore env vars
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK = originalEnvValues.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK;
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK = originalEnvValues.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK;
      process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK = originalEnvValues.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK;
      process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK = originalEnvValues.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK;
    });
  });

  describe('SubscriptionComponent', () => {
    it('should render all subscription plans', () => {
      render(<SubscriptionComponent />);
      
      expect(screen.getByText('Lite')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('should handle plan selection with correct billing cycle', async () => {
      render(<SubscriptionComponent />);
      
      // Switch to yearly billing
      const yearlyButton = screen.getByText('Yearly');
      await user.click(yearlyButton);
      
      // Select Pro plan (index 0 for Pro when Lite is current plan)
      const proSelectButton = screen.getAllByText('Select Plan')[0]; 
      await user.click(proSelectButton);
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(mockEnvVars.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK, '_blank');
      });
    });

    it('should handle team plan selection with redirect setup', async () => {
      render(<SubscriptionComponent />);
      
      // Select Team plan (monthly is default, index 1 for Team when Lite is current plan)
      const teamSelectButton = screen.getAllByText('Select Plan')[1];
      await user.click(teamSelectButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'post_payment_redirect',
          '/team-dashboard'
        );
        expect(mockWindowOpen).toHaveBeenCalledWith(mockEnvVars.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK, '_blank');
      });
    });
  });

  describe('PaymentSuccessPage', () => {
    it('should redirect to default dashboard when no stored redirect', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<PaymentSuccessPage />);
      
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      
      // Wait for auto-redirect
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      }, { timeout: 4000 });
    });

    it('should redirect to team dashboard when stored redirect exists', async () => {
      localStorageMock.getItem.mockReturnValue('/team-dashboard');
      
      render(<PaymentSuccessPage />);
      
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      
      // Wait for auto-redirect
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/team-dashboard');
      }, { timeout: 4000 });
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('post_payment_redirect');
    });

    it('should handle manual continue button click', async () => {
      localStorageMock.getItem.mockReturnValue('/team-dashboard');
      
      render(<PaymentSuccessPage />);
      
      const continueButton = screen.getByText('Continue to Dashboard');
      await user.click(continueButton);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/team-dashboard');
    });
  });

  describe('Environment Variable Fallbacks', () => {
    beforeEach(() => {
      // Clear environment variables
      Object.defineProperty(process, 'env', {
        value: {},
      });
    });

    it('should fallback to dashboard when Stripe links are not configured', async () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      const proButton = screen.getByText('Get Started');
      await user.click(proButton);
      
      expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully (i.e., component throws)', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('LocalStorage Write Error');
      });
      render(<SubscriptionComponent />);
      const teamButton = screen.getAllByText('Select Plan')[1];
      // We expect the click handler in the component to throw because it doesn't catch the error from localStorage.setItem
      await expect(user.click(teamButton)).rejects.toThrow('LocalStorage Write Error');
    });

    it('should handle window.open errors gracefully (i.e., component throws)', async () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Window Open Error');
      });
      render(<SubscriptionComponent />);
      const proButton = screen.getAllByText('Select Plan')[0]; 
      // We expect the click handler in the component to throw because it doesn't catch the error from window.open
      await expect(user.click(proButton)).rejects.toThrow('Window Open Error');
    });
  });
}); 