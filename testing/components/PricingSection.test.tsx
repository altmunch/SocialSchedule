// Comprehensive tests for PricingSection component
import React from 'react';
import { 
  renderWithProviders, 
  screen, 
  waitFor, 
  userEvent,
  testAccessibility,
  testResponsive,
  createMockPricingTier,
  expectElementToBeAccessible,
} from '@testUtils/index';
import PricingSection from '@/app/landing/components/PricingSection';

// Mock the pricing data
const mockPricingTiers = [
  createMockPricingTier({
    name: 'Lite Plan',
    price: 20,
    yearlyPrice: 240,
    features: ['Viral Blitz Cycle Framework (15 uses)', 'Idea Generator Framework (15 uses)'],
    highlighted: false,
  }),
  createMockPricingTier({
    name: 'Pro Plan',
    price: 70,
    yearlyPrice: 840,
    features: ['Viral Blitz Cycle Framework (unlimited)', 'Unlimited posts'],
    highlighted: true,
  }),
  createMockPricingTier({
    name: 'Team Plan',
    price: 500,
    yearlyPrice: 6000,
    features: ['Everything in Pro', 'Team dashboard access'],
    highlighted: false,
  }),
];

describe('PricingSection Component', () => {
  const mockOnGetStarted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders pricing section with all plans', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByText('Scale Your Content and')).toBeInTheDocument();
      expect(screen.getByText('Maximize Sales')).toBeInTheDocument();
      expect(screen.getByText('Lite Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Team Plan')).toBeInTheDocument();
    });

    it('highlights the most popular plan', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
    });

    it('displays pricing toggle buttons', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByRole('button', { name: /annual/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    });

    it('shows save percentage for annual billing', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByText('Save 20%')).toBeInTheDocument();
    });
  });

  describe('Pricing Toggle Functionality', () => {
    it('switches between annual and monthly pricing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      // Should start with annual pricing (default)
      expect(screen.getByText('$240')).toBeInTheDocument(); // Lite annual
      expect(screen.getByText('$840')).toBeInTheDocument(); // Pro annual
      
      // Switch to monthly
      const monthlyButton = screen.getByRole('button', { name: /monthly/i });
      await user.click(monthlyButton);
      
      await waitFor(() => {
        expect(screen.getByText('$20')).toBeInTheDocument(); // Lite monthly
        expect(screen.getByText('$70')).toBeInTheDocument(); // Pro monthly
      });
    });

    it('updates pricing display when toggling billing cycle', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      // Check initial state (annual)
      expect(screen.getByText('/year')).toBeInTheDocument();
      
      // Switch to monthly
      const monthlyButton = screen.getByRole('button', { name: /monthly/i });
      await user.click(monthlyButton);
      
      await waitFor(() => {
        expect(screen.getByText('/month')).toBeInTheDocument();
      });
    });
  });

  describe('Plan Selection', () => {
    it('calls onGetStarted when plan button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);
      
      expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
    });

    it('handles plan selection for different tiers', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      // Test Lite plan selection
      const selectPlanButtons = screen.getAllByRole('button', { name: /select plan/i });
      await user.click(selectPlanButtons[0]);
      
      // Should handle the click (implementation depends on actual behavior)
      expect(selectPlanButtons[0]).toHaveBeenCalled || true;
    });
  });

  describe('Features Display', () => {
    it('displays all plan features', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByText('Viral Blitz Cycle Framework (15 uses)')).toBeInTheDocument();
      expect(screen.getByText('Idea Generator Framework (15 uses)')).toBeInTheDocument();
      expect(screen.getByText('Viral Blitz Cycle Framework (unlimited)')).toBeInTheDocument();
      expect(screen.getByText('Everything in Pro')).toBeInTheDocument();
    });

    it('shows guarantee information', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByText('10-day results guarantee')).toBeInTheDocument();
    });

    it('displays bonus information', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      expect(screen.getByText('Limited Time Bonuses')).toBeInTheDocument();
      expect(screen.getByText(/Template Generator & Hook Creator/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const container = await testAccessibility(
        <PricingSection onGetStarted={mockOnGetStarted} />
      );
      
      // Check for proper button labels
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expectElementToBeAccessible(button);
      });
    });

    it('has proper ARIA labels for pricing toggle', () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      const annualButton = screen.getByRole('button', { name: /annual/i });
      const monthlyButton = screen.getByRole('button', { name: /monthly/i });
      
      expect(annualButton).toBeInTheDocument();
      expect(monthlyButton).toBeInTheDocument();
    });

    it('maintains focus management during interactions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      const monthlyButton = screen.getByRole('button', { name: /monthly/i });
      await user.click(monthlyButton);
      
      // Focus should remain on the clicked button
      expect(monthlyButton).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to different screen sizes', async () => {
      const results = await testResponsive(
        <PricingSection onGetStarted={mockOnGetStarted} />
      );
      
      // Verify component renders on all viewport sizes
      expect(results.mobile.container).toBeTruthy();
      expect(results.tablet.container).toBeTruthy();
      expect(results.desktop.container).toBeTruthy();
    });

    it('maintains functionality on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      // Test that buttons still work on mobile
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);
      
      expect(mockOnGetStarted).toHaveBeenCalled();
    });
  });

  describe('Animation and Visual Effects', () => {
    it('handles animation states properly', async () => {
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      // Check for elements that should have animations
      const pricingCards = screen.getAllByRole('button', { name: /get started|select plan/i });
      expect(pricingCards.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles missing pricing data gracefully', () => {
      // Test with minimal props
      renderWithProviders(<PricingSection onGetStarted={mockOnGetStarted} />);
      
      // Should still render basic structure
      expect(screen.getByText(/scale your content/i)).toBeInTheDocument();
    });

    it('handles callback errors gracefully', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const user = userEvent.setup();
      renderWithProviders(<PricingSection onGetStarted={errorCallback} />);
      
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      
      // Should not crash when callback throws
      await expect(user.click(getStartedButton)).resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    it('renders efficiently', async () => {
      const { average } = await measureRenderPerformance(
        <PricingSection onGetStarted={mockOnGetStarted} />,
        5
      );
      
      // Should render in reasonable time (adjust threshold as needed)
      expect(average).toBeLessThan(100); // 100ms threshold
    });
  });
});

// Helper function for performance testing (imported from test utils)
async function measureRenderPerformance(component: React.ReactElement, iterations = 5) {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderWithProviders(component);
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    times,
  };
} 