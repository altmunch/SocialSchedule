declare module './HeroSection' {
  import { FC } from 'react';
  interface HeroSectionProps {
    onCTAClick: () => void;
    timeRemaining: { hours: number; minutes: number; seconds: number };
    remainingSpots: number;
  }
  const HeroSection: FC<HeroSectionProps>;
  export default HeroSection;
}

declare module './ViralBlitzCycle' {
  import { FC } from 'react';
  const ViralBlitzCycle: FC;
  export default ViralBlitzCycle;
}

declare module './SocialProof' {
  import { FC } from 'react';
  const SocialProof: FC;
  export default SocialProof;
}

declare module './DashboardPreview' {
  import { FC } from 'react';
  const DashboardPreview: FC;
  export default DashboardPreview;
}

declare module './GrandSlamOffer' {
  import { FC } from 'react';
  const GrandSlamOffer: FC;
  export default GrandSlamOffer;
}

declare module './CTAWithGuarantee' {
  import { FC } from 'react';
  interface CTAWithGuaranteeProps {
    onCTAClick: () => void;
    remainingSpots: number;
  }
  const CTAWithGuarantee: FC<CTAWithGuaranteeProps>;
  export default CTAWithGuarantee;
}

declare module './Footer' {
  import { FC } from 'react';
  const Footer: FC;
  export default Footer;
}
