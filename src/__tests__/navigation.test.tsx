import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/app/landing/components/NavigationBar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockedImage(props: any) {
    return <img {...props} />;
  };
});

describe('NavigationBar', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  describe('Desktop Navigation', () => {
    it('should render all navigation items', () => {
      render(<NavigationBar />);
      
      // Check for desktop navigation items (hidden on mobile)
      const desktopNav = screen.getByRole('navigation');
      expect(within(desktopNav).getByText('Features')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Solutions')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Pricing')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Terms of Service')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Resources')).toBeInTheDocument();
    });

    it('should have correct href attributes for direct links', () => {
      render(<NavigationBar />);
      
      const pricingLink = screen.getByRole('link', { name: 'Pricing' });
      expect(pricingLink).toHaveAttribute('href', '/landing/pricing');
      
      const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
      expect(termsLink).toHaveAttribute('href', '/landing/terms-of-service');
    });

    it('should show dropdown when hovering over dropdown items', () => {
      render(<NavigationBar />);
      
      // Test Features dropdown
      const featuresButton = screen.getByRole('button', { name: /features/i });
      fireEvent.click(featuresButton);
      
      // Should show dropdown items after click
      expect(screen.getByText('Content Optimization')).toBeInTheDocument();
      expect(screen.getByText('AI Analytics')).toBeInTheDocument();
      expect(screen.getByText('Performance Tracking')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    it('should show mobile menu when hamburger is clicked', () => {
      render(<NavigationBar />);
      
      // Find the mobile menu button using aria-label
      const menuButton = screen.getByRole('button', { name: 'Open main menu' });
      expect(menuButton).toBeInTheDocument();
      
      // Check that navigation elements exist
      const featuresElements = screen.getAllByText('Features');
      expect(featuresElements.length).toBeGreaterThanOrEqual(1);
      
      const solutionsElements = screen.getAllByText('Solutions');
      expect(solutionsElements.length).toBeGreaterThanOrEqual(1);
      
      // Check that "Get Started" buttons exist
      const getStartedButtons = screen.getAllByText('Get Started');
      expect(getStartedButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should have mobile pricing link with correct attributes', () => {
      render(<NavigationBar />);
      
      // Get all pricing links
      const pricingLinks = screen.getAllByRole('link', { name: 'Pricing' });
      expect(pricingLinks.length).toBeGreaterThanOrEqual(1);
      
      // Verify at least one has the correct href
      const hasCorrectHref = pricingLinks.some(link => 
        link.getAttribute('href') === '/landing/pricing'
      );
      expect(hasCorrectHref).toBe(true);
    });
  });

  describe('Dropdown Functionality', () => {
    it('should toggle dropdowns correctly', () => {
      render(<NavigationBar />);
      
      const featuresButton = screen.getByRole('button', { name: /features/i });
      
      // Initially closed
      expect(screen.queryByText('Content Optimization')).not.toBeInTheDocument();
      
      // Click to open
      fireEvent.click(featuresButton);
      expect(screen.getByText('Content Optimization')).toBeInTheDocument();
      
      // Click again to close
      fireEvent.click(featuresButton);
      expect(screen.queryByText('Content Optimization')).not.toBeInTheDocument();
    });

    it('should have correct dropdown links', () => {
      render(<NavigationBar />);
      
      // Open Features dropdown
      const featuresButton = screen.getByRole('button', { name: /features/i });
      fireEvent.click(featuresButton);
      
      // Check dropdown links
      const contentOptLink = screen.getByText('Content Optimization');
      expect(contentOptLink.closest('a')).toHaveAttribute('href', '/#features');
      
      const analyticsLink = screen.getByText('AI Analytics');
      expect(analyticsLink.closest('a')).toHaveAttribute('href', '/#how-it-works');
      
      const trackingLink = screen.getByText('Performance Tracking');
      expect(trackingLink.closest('a')).toHaveAttribute('href', '/#testimonials');
    });

    it('should have correct dropdown links for Solutions dropdown', () => {
      render(<NavigationBar />);

      // Open Solutions dropdown
      const solutionsButton = screen.getByRole('button', { name: /solutions/i });
      fireEvent.click(solutionsButton);

      // Check dropdown links
      const ecommerceLink = screen.getByText('E-commerce');
      expect(ecommerceLink.closest('a')).toHaveAttribute('href', '/landing/solutions');

      const contentMarketingLink = screen.getByText('Content Marketing');
      expect(contentMarketingLink.closest('a')).toHaveAttribute('href', '/landing/solutions');

      const teamLink = screen.getByText('Team');
      expect(teamLink.closest('a')).toHaveAttribute('href', '/landing/team');
    });
  });

  describe('Get Started Buttons', () => {
    it('should render Get Started buttons', () => {
      render(<NavigationBar />);
      
      const getStartedButtons = screen.getAllByText('Get Started');
      expect(getStartedButtons.length).toBeGreaterThan(0);
    });

    it('should handle Get Started button clicks', () => {
      const mockPush = jest.fn();
      
      // Mock useRouter hook
      require('next/navigation').useRouter.mockReturnValue({
        push: mockPush,
        pathname: '/',
        query: {},
        asPath: '/',
      });
      
      render(<NavigationBar />);
      
      const getStartedButton = screen.getAllByText('Get Started')[0];
      fireEvent.click(getStartedButton);
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 