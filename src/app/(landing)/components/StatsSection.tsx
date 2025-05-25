'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Zap, BarChart2, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-graphite/50 border-graphite-light/20 hover:border-misty/30 transition-all hover:shadow-lg hover:shadow-misty/5 h-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-misty/20 to-mint/20 border border-misty/10 text-misty">
              {icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {value.toLocaleString()}+
    </motion.span>
  );
}

export default function StatsSection() {
  const stats = {
    postsScheduled: 1250000,
    activeUsers: 25000,
    timeSaved: 95000,
    satisfactionRate: 98.7,
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-graphite/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trusted by Creators Worldwide</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Join thousands of content creators who save time and grow their audience with our platform</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Calendar className="w-5 h-5" />} 
            value={<AnimatedCounter value={stats.postsScheduled} />} 
            label="Posts Scheduled" 
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />} 
            value={<AnimatedCounter value={stats.activeUsers} />} 
            label="Active Users" 
          />
          <StatCard 
            icon={<Clock className="w-5 h-5" />} 
            value={<AnimatedCounter value={stats.timeSaved} />} 
            label="Hours Saved" 
          />
          <StatCard 
            icon={<CheckCircle className="w-5 h-5" />} 
            value={`${stats.satisfactionRate}%`} 
            label="Satisfaction Rate" 
          />
        </div>
      </div>
    </section>
  );
}
