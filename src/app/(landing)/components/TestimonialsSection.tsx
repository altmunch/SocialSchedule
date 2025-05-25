'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Content Creator',
    image: '/avatars/alex.png',
    content: 'This platform has completely transformed how I manage my social media. The scheduling feature alone saves me hours every week!',
    rating: 5
  },
  {
    id: 2,
    name: 'Taylor Smith',
    role: 'Marketing Manager',
    image: '/avatars/taylor.png',
    content: 'The analytics dashboard is incredibly insightful. I can now track my performance and adjust my strategy in real-time.',
    rating: 5
  },
  {
    id: 3,
    name: 'Jordan Lee',
    role: 'Small Business Owner',
    image: '/avatars/jordan.png',
    content: 'As a small business owner, I needed an affordable solution that could handle all my social media needs. This platform delivers!',
    rating: 4
  },
  {
    id: 4,
    name: 'Casey Kim',
    role: 'Social Media Influencer',
    image: '/avatars/casey.png',
    content: 'The AI content suggestions are game-changing. My engagement rates have never been higher!',
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trusted by Creators Worldwide</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what our users have to say.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-misty/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback className="bg-mint/10 text-mint">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-mint/20" />
                <p className="text-muted-foreground mb-3 pl-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
              </div>
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
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-mint/10 text-mint text-sm font-medium hover:bg-mint/20 transition-colors cursor-pointer">
            <span>Read more testimonials</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
