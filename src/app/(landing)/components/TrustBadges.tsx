'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

type TrustBadge = {
  id: number;
  text: string;
};

const trustBadges: TrustBadge[] = [
  { id: 1, text: 'No credit card required' },
  { id: 2, text: 'Cancel anytime' },
  { id: 3, text: '14-day free trial' },
  { id: 4, text: 'Secure & private' },
  { id: 5, text: '24/7 Support' },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-8">
      {trustBadges.map((badge) => (
        <motion.div
          key={badge.id}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 * badge.id, duration: 0.5 }}
        >
          <div className="p-1 rounded-full bg-mint/20 text-mint">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{badge.text}</span>
        </motion.div>
      ))}
    </div>
  );
}
