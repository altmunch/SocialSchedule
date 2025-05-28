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
    <footer className="bg-[#F8F9FA] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          {/* Logo and company info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center">
                <div className="relative w-10 h-10 mr-2">
                  <Image
                    src="/logo.png"
                    alt="SocialSchedule Logo"
                    width={40}
                    height={40}
                    className="rounded"
                  />
                </div>
                <span className="text-xl font-bold text-[#333333]">SocialSchedule</span>
              </div>
            </Link>
            <p className="text-[#666666] mb-6 max-w-md">
              Helping e-commerce sellers turn social media content into direct sales through automated scheduling, optimization, and revenue tracking.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="bg-white p-2 rounded-full border border-gray-200 text-[#666666] hover:text-[#007BFF] hover:border-[#007BFF] transition-colors"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          {footerLinks.map((column, columnIndex) => (
            <div key={columnIndex}>
              <h3 className="font-semibold text-[#333333] mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-[#666666] hover:text-[#007BFF] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact and newsletter */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="font-semibold text-[#333333] mb-3">Stay updated with seller strategies</h3>
              <div className="flex max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                />
                <button className="bg-[#007BFF] hover:bg-[#0070E0] text-white font-medium px-4 py-2 rounded-r-md transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Mail size={18} className="text-[#666666] mr-2" />
              <a href="mailto:support@socialschedule.com" className="text-[#666666] hover:text-[#007BFF] transition-colors">
                support@socialschedule.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-[#666666]">
            © {currentYear} SocialSchedule. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
