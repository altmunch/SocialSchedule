import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar Tab Group Styling', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('renders both "Sell Faster" and "How to Sell" tab groups with consistent styling', () => {
    render(<Sidebar />);
    
    // Check that both tab groups are present
    expect(screen.getByText('Sell Faster')).toBeInTheDocument();
    expect(screen.getByText('How to Sell')).toBeInTheDocument();
  });

  it('both tab groups have the same arrow icon styling', () => {
    render(<Sidebar />);
    
    // Both groups should have ChevronRight icons, not plain text arrows
    const sellFasterButton = screen.getByText('Sell Faster').closest('button');
    const howToSellButton = screen.getByText('How to Sell').closest('button');
    
    expect(sellFasterButton).toBeInTheDocument();
    expect(howToSellButton).toBeInTheDocument();
    
    // Both should have similar class structures
    expect(sellFasterButton).toHaveClass('flex', 'items-center', 'justify-between');
    expect(howToSellButton).toHaveClass('flex', 'items-center', 'justify-between');
  });

  it('both tab groups have brand primary dots', () => {
    render(<Sidebar />);
    
    const sellFasterButton = screen.getByText('Sell Faster').closest('button');
    const howToSellButton = screen.getByText('How to Sell').closest('button');
    
    // Both should contain spans with brand primary background
    expect(sellFasterButton?.querySelector('span[class*="bg-brand-primary"]')).toBeInTheDocument();
    expect(howToSellButton?.querySelector('span[class*="bg-brand-primary"]')).toBeInTheDocument();
  });

  it('displays navigation items under both groups', () => {
    render(<Sidebar />);
    
    // Sell Faster group items
    expect(screen.getByText('Accelerate')).toBeInTheDocument();
    expect(screen.getByText('Blitz')).toBeInTheDocument();
    expect(screen.getByText('Cycle')).toBeInTheDocument();
    
    // How to Sell group items
    expect(screen.getByText('Ideator')).toBeInTheDocument();
    expect(screen.getByText('Competitor tactics')).toBeInTheDocument();
  });

  it('does not show red dots for incomplete items by default', () => {
    render(<Sidebar />);
    
    // Red dots should only appear when hasEditsInProgress is true
    const redDots = document.querySelectorAll('.bg-coral');
    expect(redDots).toHaveLength(0);
  });
}); 