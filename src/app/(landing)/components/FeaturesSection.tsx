'use client';

import { motion } from 'framer-motion';
import { Calendar, Zap, BarChart, Clock, MessageSquare, Users, Settings, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Smart Scheduling',
    description: 'Schedule your posts in advance and let our AI optimize the best times to post for maximum engagement.'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'AI-Powered Content',
    description: 'Generate engaging captions and hashtags with our AI assistant to boost your social media presence.'
  },
  {
    icon: <BarChart className="w-8 h-8" />,
    title: 'Analytics Dashboard',
    description: 'Track your performance with detailed analytics and insights to improve your social strategy.'
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Time-Saving Automation',
    description: 'Automate your social media workflow and save hours every week with our powerful tools.'
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Engagement Tools',
    description: 'Manage comments and messages from all your social accounts in one place.'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Team Collaboration',
    description: 'Collaborate with your team members and manage permissions with ease.'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Powerful Features for Your Social Success</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to grow your audience and save time on social media management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50 hover:border-misty/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-mint/10 text-mint w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint/10 text-mint text-sm font-medium mb-4">
            <Bell className="w-4 h-4" />
            <span>And many more features to discover!</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators who are already growing their audience with our platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
