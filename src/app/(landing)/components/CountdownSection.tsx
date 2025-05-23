'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/custom/CountdownTimer';

interface CountdownSectionProps {
  onCTAClick?: () => void;
}

export function CountdownSection({ onCTAClick }: CountdownSectionProps) {
  const handleClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      const element = document.getElementById('pricing');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-graphite-dark to-graphite">
      <div className="max-w-4xl mx-auto text-center px-4">
        <motion.h3 
          className="text-2xl md:text-3xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Limited Time Offer: <span className="text-mint">50% OFF</span> Your First 3 Months
        </motion.h3>
        <motion.p 
          className="text-muted-foreground mb-6 text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Join now and get instant access to all Pro features. Offer ends in:
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CountdownTimer />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <Button 
            onClick={handleClick}
            className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-misty to-mint text-graphite hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-misty/30"
          >
            Claim Your Discount
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
