'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Testimonials', href: '#testimonials' },
        { name: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'E-commerce Guide', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Case Studies', href: '#' },
        { name: 'Support', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-b from-storm-darkest to-storm-darker border-t border-storm-light/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12">
          {/* Logo and company info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center">
                <div className="relative w-10 h-10 mr-3">
                  <Image
                    src="/logo.png"
                    alt="SocialSchedule Logo"
                    width={40}
                    height={40}
                    className="rounded"
                  />
                </div>
                <span className="text-xl font-bold text-[#8D5AFF]">
                  SocialSchedule
                </span>
              </div>
            </Link>
            <p className="text-lightning-dim/80 mb-8 max-w-md leading-relaxed">
              Helping e-commerce sellers turn social media content into direct sales through automated scheduling, optimization, and revenue tracking.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-2.5 rounded-full border border-storm-light/10 bg-storm-light/5 backdrop-blur-sm text-lightning-dim/70 hover:text-blitz-blue hover:border-blitz-blue/30 transition-all"
                  aria-label={social.label}
                  whileHover={{ y: -3, boxShadow: '0 5px 15px -5px rgba(0, 119, 255, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          {footerLinks.map((column, columnIndex) => (
            <div key={columnIndex} className="relative">
              <h3 className="font-semibold text-lightning-DEFAULT mb-5 text-lg">
                {column.title}
              </h3>
              <ul className="space-y-3.5">
                {column.links.map((link, linkIndex) => (
                  <motion.li 
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Link 
                      href={link.href}
                      className="text-lightning-dim/70 hover:text-[#8D5AFF] transition-colors flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8D5AFF]/0 group-hover:bg-[#8D5AFF] mr-2 transition-colors"></span>
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact and newsletter */}
        <div className="border-t border-storm-light/10 mt-16 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="w-full md:max-w-md">
              <h3 className="font-semibold text-lightning-DEFAULT mb-4 text-lg">
                Stay updated with seller strategies
              </h3>
              <div className="flex w-full">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow px-5 py-3.5 rounded-l-xl border border-storm-light/10 bg-storm-light/5 backdrop-blur-sm text-lightning-dim/90 placeholder-lightning-dim/40 focus:outline-none focus:ring-2 focus:ring-blitz-blue/50 focus:border-transparent transition-all"
                />
                <motion.button 
                  className="bg-[#8D5AFF] hover:bg-[#8D5AFF]/90 text-white font-medium px-6 py-3.5 rounded-r-xl transition-all"
                  whileHover={{ boxShadow: '0 5px 15px -5px rgba(141, 90, 255, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
            <div className="flex items-center bg-storm-light/5 backdrop-blur-sm border border-storm-light/10 rounded-xl px-5 py-3.5">
              <Mail size={18} className="text-[#8D5AFF] mr-3" />
              <a 
                href="mailto:support@socialschedule.com" 
                className="text-lightning-dim/90 hover:text-[#8D5AFF] transition-colors font-medium"
              >
                support@socialschedule.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-storm-light/10 mt-12 pt-8 text-center">
          <p className="text-sm text-lightning-dim/60">
            © {currentYear} SocialSchedule. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
