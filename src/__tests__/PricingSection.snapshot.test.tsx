import { render } from '@testing-library/react';
import PricingSection from '@/app/landing/components/PricingSection';

describe('PricingSection', () => {
  it('matches snapshot', () => {
    const { container } = render(<PricingSection onGetStarted={() => {}} />);
    expect(container).toMatchSnapshot();
  });
}); 