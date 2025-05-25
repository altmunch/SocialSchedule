'use client';

import { motion } from 'framer-motion';
import { Quote, Star, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 bg-black overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
      </div>
      <div className="relative z-10">
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#7F00FF]/10 border border-[#7F00FF]/20 text-[#7F00FF] text-sm font-medium mb-4">
            Social Proof
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0F0F0] mb-4">Trusted by 1,203+ Creators</h2>
          <p className="text-[#B0B0B0] max-w-2xl mx-auto text-lg">
            Join thousands of creators who've grown their audience with our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="group bg-[#1F1F1F] rounded-xl p-6 border border-[#333333] hover:border-[#7F00FF]/30 transition-all h-full flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="border-2 border-[#7F00FF]/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#7F00FF] to-[#00FFCC] text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-[#F0F0F0]">{testimonial.name}</h4>
                    <p className="text-sm text-[#B0B0B0]">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-[#7F00FF]/20" />
                  <p className="text-[#B0B0B0] mb-4 pl-6">"{testimonial.content}"</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#333333]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#333333]'}`} 
                    />
                  ))}
                </div>
                <Zap className="w-4 h-4 text-[#7F00FF] opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <Button 
            variant="outline" 
            className="group border-2 border-[#333333] bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F0F0F0] hover:text-white py-6 px-8 text-lg rounded-xl transition-all"
          >
            <span>Read More Testimonials</span>
            <svg 
              className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </Button>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
