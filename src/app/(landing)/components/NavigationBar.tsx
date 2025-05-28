'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function NavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Updated navigation items based on the new plan
  const navItems = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-storm-dark/80 backdrop-blur-md border-b border-storm-light/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-blitz-blue rounded-md flex items-center justify-center mr-3 group-hover:bg-blitz-purple transition-colors duration-300">
                <span className="text-lightning-DEFAULT font-bold">S</span>
              </div>
              <span className="text-lightning-DEFAULT font-semibold text-lg">SocialSchedule</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className="text-sm text-lightning-dim hover:text-blitz-blue transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => router.push('/sign-in')}
              className="text-sm text-lightning-dim hover:text-blitz-blue transition-colors duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/sign-up')}
              className="bg-blitz-blue hover:bg-blitz-purple text-lightning-DEFAULT px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blitz-blue/20"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-lightning-dim hover:text-blitz-blue transition-colors duration-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-storm-dark/95 backdrop-blur-lg border-t border-storm-light/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 text-base text-lightning-dim hover:text-blitz-blue hover:bg-storm-light/5 rounded-md transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-storm-light/10 pt-4 pb-3 px-3 flex flex-col space-y-3">
              <button
                onClick={() => {
                  router.push('/sign-in');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blitz-blue hover:bg-blitz-purple text-lightning-DEFAULT py-2 px-4 rounded-md text-base font-medium text-center transition-all duration-300 hover:shadow-lg hover:shadow-blitz-blue/20"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  router.push('/sign-up');
                  setMobileMenuOpen(false);
                }}
                className="bg-[#FF7F50] hover:bg-[#FF6F00] text-white px-4 py-2 rounded-md text-base font-medium w-full"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
