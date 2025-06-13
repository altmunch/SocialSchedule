'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Bell, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import NavigationBar from '@/app/landing/components/NavigationBar';
import Footer from '@/app/landing/components/Footer';

export default function ApiDocsComingSoonPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    setIsLoading(false);
    setEmail('');
  };

  const features = [
    {
      title: 'RESTful API',
      description: 'Simple, intuitive REST API endpoints for all platform features',
      icon: Server
    },
    {
      title: 'Webhooks',
      description: 'Real-time notifications for content updates and analytics',
      icon: Bell
    },
    {
      title: 'SDK Libraries',
      description: 'Pre-built libraries for JavaScript, Python, and more',
      icon: Code
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationBar />
      
      <div className="pt-24 pb-16 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8D5AFF]/10 to-[#5afcc0]/10"></div>
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(141,90,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(141,90,255,0.05)_1px,transparent_1px)] [background-size:60px_60px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Content */}
            <div className="mb-12">
              <motion.div
                className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-[#8D5AFF]/20 to-[#5afcc0]/20 mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Code className="h-12 w-12 text-[#5afcc0]" />
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                API Documentation
              </motion.h1>
              
              <motion.div
                className="inline-flex items-center bg-[#8D5AFF]/10 border border-[#8D5AFF]/30 rounded-full px-6 py-3 mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="text-[#8D5AFF] font-bold text-lg">Coming Soon</span>
              </motion.div>
              
              <motion.p 
                className="text-xl text-white/80 mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                We're building powerful API endpoints that will let you integrate ClipsCommerce 
                directly into your applications. Get ready for seamless automation, 
                real-time analytics, and unlimited scalability.
              </motion.p>
            </div>

            {/* Features Preview */}
            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                >
                  <feature.icon className="h-8 w-8 text-[#5afcc0] mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div
              className="bg-gradient-to-r from-[#8D5AFF]/10 to-[#5afcc0]/10 border border-white/10 rounded-2xl p-8 mb-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {!subscribed ? (
                <>
                  <h2 className="text-3xl font-bold mb-4 text-white">Be the First to Know</h2>
                  <p className="text-white/80 mb-6">
                    Get notified when our API documentation goes live. Plus, receive early access to beta features.
                  </p>
                  
                  <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#8D5AFF]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      ) : (
                        <>
                          Notify Me
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="h-16 w-16 text-[#5afcc0] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">You're All Set!</h3>
                  <p className="text-white/80">We'll notify you as soon as the API documentation is ready.</p>
                </motion.div>
              )}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <p className="text-white/70 mb-6">
                In the meantime, explore what ClipsCommerce can do for your business today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <motion.button
                    className="bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
                
                <Link href="/landing/solutions">
                  <motion.button
                    className="border-2 border-[#8D5AFF] text-[#8D5AFF] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#8D5AFF]/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Solutions
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
