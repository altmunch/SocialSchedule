'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah K.',
    handle: '@sarahcreates',
    role: 'Lifestyle Creator',
    content: 'I went from 2K to 80K followers in just 3 months using SocialSchedule. The AI optimization is next level!',
    rating: 5,
    image: '/testimonials/sarah.jpg'
  },
  {
    id: 2,
    name: 'Mike T.',
    handle: '@mikestech',
    role: 'Tech Reviewer',
    content: 'The Viral Blitz Cycle is a game-changer. My engagement is up 300% and I spend 10 hours less per week on content.',
    rating: 5,
    image: '/testimonials/mike.jpg'
  },
  {
    id: 3,
    name: 'Priya M.',
    handle: '@healthwithpriya',
    role: 'Health Coach',
    content: 'I was skeptical about AI tools, but SocialSchedule proved me wrong. My content reaches 5x more people now!',
    rating: 5,
    image: '/testimonials/priya.jpg'
  }
];

const stats = [
  { value: '12,834+', label: 'Creators Growing' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '98%', label: 'Success Rate' },
  { value: '5M+', label: 'Posts Scheduled' },
];

export default function SocialProof() {
  return (
    <section className="py-20 bg-stormGray/10 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="text-center p-6 bg-stormGray/20 backdrop-blur-sm rounded-xl border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl font-bold text-blitzBlue mb-2">{stat.value}</div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Trusted by <span className="text-blitzBlue">Content Creators</span> Worldwide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className="bg-stormGray/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blitzBlue/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blitzBlue to-surgePurple flex-shrink-0 overflow-hidden">
                    {/* Placeholder for image */}
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.handle}</div>
                  </div>
                  <div className="ml-auto flex items-center bg-blitzBlue/10 text-blitzBlue px-3 py-1 rounded-full text-sm">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {testimonial.rating}.0
                  </div>
                </div>
                <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Logos */}
        <motion.div 
          className="mt-20 pt-12 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-gray-400 mb-8">Trusted by innovative creators at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {['Forbes', 'Fast Company', 'The Verge', 'TechCrunch', 'Wired'].map((logo, index) => (
              <div key={index} className="text-2xl font-bold text-gray-300">
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
