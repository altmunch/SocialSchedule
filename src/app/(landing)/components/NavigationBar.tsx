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
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-[#007BFF] rounded-md flex items-center justify-center mr-3">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-[#333333] font-semibold text-lg">SocialSchedule</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className="text-sm text-[#444444] hover:text-[#007BFF] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => router.push('/sign-in')}
              className="text-sm text-[#444444] hover:text-[#007BFF] transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/sign-up')}
              className="bg-[#FF7F50] hover:bg-[#FF6F00] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#444444] hover:text-[#007BFF]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 text-base text-[#444444] hover:text-[#007BFF] hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-4 pb-3 px-3 flex flex-col space-y-3">
              <button
                onClick={() => {
                  router.push('/sign-in');
                  setMobileMenuOpen(false);
                }}
                className="text-[#444444] hover:text-[#007BFF] text-base"
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
