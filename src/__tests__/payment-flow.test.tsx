import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
const mockLocationHref = jest.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen });
Object.defineProperty(window.location, 'href', {
  set: mockLocationHref,
  configurable: true,
});

describe('Payment Flow Tests', () => {
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
  });

  describe('PricingSection Component', () => {
    it('should render all three pricing plans', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Team Plan')).toBeInTheDocument();
    });

    it('should handle free plan selection correctly', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      const freeButton = screen.getAllByText('Get Started')[0];
      fireEvent.click(freeButton);
      
      expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle Pro monthly plan selection', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Switch to monthly billing
      const monthlyButton = screen.getByText('Monthly');
      fireEvent.click(monthlyButton);
      
      // Click Pro plan button
      const proButton = screen.getAllByText('Get Started')[1];
      fireEvent.click(proButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://stripe.com/pro-monthly',
        '_blank'
      );
    });

    it('should handle Pro yearly plan selection', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Annual is default, so Pro plan button should use yearly link
      const proButton = screen.getAllByText('Get Started')[1];
      fireEvent.click(proButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://stripe.com/pro-yearly',
        '_blank'
      );
    });

    it('should handle Team monthly plan selection and set redirect', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Switch to monthly billing
      const monthlyButton = screen.getByText('Monthly');
      fireEvent.click(monthlyButton);
      
      // Click Team plan button
      const teamButton = screen.getAllByText('Get Started')[2];
      fireEvent.click(teamButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'post_payment_redirect',
        '/team-dashboard'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://stripe.com/team-monthly',
        '_blank'
      );
    });

    it('should handle Team yearly plan selection and set redirect', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      // Annual is default, so Team plan button should use yearly link
      const teamButton = screen.getAllByText('Get Started')[2];
      fireEvent.click(teamButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'post_payment_redirect',
        '/team-dashboard'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://stripe.com/team-yearly',
        '_blank'
      );
    });
  });

  describe('SubscriptionComponent', () => {
    it('should render all subscription plans', () => {
      render(<SubscriptionComponent />);
      
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Team Plan')).toBeInTheDocument();
    });

    it('should handle plan selection with correct billing cycle', async () => {
      render(<SubscriptionComponent />);
      
      // Switch to yearly billing
      const yearlyButton = screen.getByText('Yearly');
      fireEvent.click(yearlyButton);
      
      // Select Pro plan
      const proSelectButton = screen.getAllByText('Select Plan')[1];
      fireEvent.click(proSelectButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://stripe.com/pro-yearly',
        '_blank'
      );
    });

    it('should handle team plan selection with redirect setup', async () => {
      render(<SubscriptionComponent />);
      
      // Select Team plan (monthly is default)
      const teamSelectButton = screen.getAllByText('Select Plan')[2];
      fireEvent.click(teamSelectButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'post_payment_redirect',
        '/team-dashboard'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://stripe.com/team-monthly',
        '_blank'
      );
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

    it('should handle manual continue button click', () => {
      localStorageMock.getItem.mockReturnValue('/team-dashboard');
      
      render(<PaymentSuccessPage />);
      
      const continueButton = screen.getByText('Continue to Dashboard');
      fireEvent.click(continueButton);
      
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

    it('should fallback to dashboard when Stripe links are not configured', () => {
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      const proButton = screen.getAllByText('Get Started')[1];
      fireEvent.click(proButton);
      
      expect(mockLocationHref).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      const teamButton = screen.getAllByText('Get Started')[2];
      
      // Should not throw error
      expect(() => fireEvent.click(teamButton)).not.toThrow();
    });

    it('should handle window.open errors gracefully', () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Popup blocked');
      });
      
      render(<PricingSection onGetStarted={jest.fn()} />);
      
      const proButton = screen.getAllByText('Get Started')[1];
      
      // Should not throw error
      expect(() => fireEvent.click(proButton)).not.toThrow();
    });
  });
}); 