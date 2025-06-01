'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, Star } from 'lucide-react';

function NavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdown && dropdownRefs.current[openDropdown] && 
          !dropdownRefs.current[openDropdown]?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);
  
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Updated navigation structure
  const navItems = [
    { 
      label: 'Product', 
      key: 'product',
      hasDropdown: true,
      dropdown: [
        { label: 'Features', href: '/#features' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Demo', href: '/demo' },
      ]
    },
    { label: 'Pricing', href: '/pricing', hasDropdown: false },
    { label: 'Results', href: '/results', hasDropdown: false },
    { 
      label: 'Resources', 
      key: 'resources',
      hasDropdown: true,
      dropdown: [
        { label: 'Guides', href: '/resources#guides' },
        { label: 'FAQ', href: '/resources#faq' },
        { label: 'Hooks and templates', href: '/resources#templates' },
      ]
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Announcement banner */}
      <div className="bg-[#7D4AFF] py-2.5 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium text-white">
          <span className="flex items-center">
            <Star className="h-4 w-4 mr-1.5 text-yellow-300 fill-yellow-300" />
            Final 15 AI brand voices—yours forever (personalized captions, hashtags & audio)
          </span>
          <Link href="/claim" className="font-bold underline hover:text-white/90 transition-colors">
            Claim your slot
          </Link>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="bg-storm-dark/80 backdrop-blur-md border-b border-storm-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group space-x-3">
                <div className="relative w-16 h-16 bg-storm-dark/80 backdrop-blur-md p-2">
                  <div className="relative w-full h-full">
                    <Image 
                      src="/images/ChatGPT Image Jun 1, 2025, 07_27_54 PM.png" 
                      alt="Logo" 
                      fill 
                      className="object-contain"
                      style={{
                        filter: 'invert(1)',
                        opacity: 1
                      }}
                      priority
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">
                  ClipsCommerce
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div 
                  key={item.label}
                  className="relative"
                  ref={(el) => {
                    if (item.hasDropdown && el !== null) {
                      dropdownRefs.current[item.key as string] = el;
                    }
                  }}
                >
                  {item.hasDropdown ? (
                    <button 
                      onClick={() => toggleDropdown(item.key as string)}
                      className="flex items-center text-sm text-lightning-dim hover:text-blitz-blue transition-colors duration-300"
                    >
                      {item.label}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${openDropdown === item.key ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link 
                      href={item.href as string}
                      className="text-sm text-lightning-dim hover:text-blitz-blue transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  )}
                  
                  {/* Dropdown menu */}
                  {item.hasDropdown && openDropdown === item.key && (
                    <div className="absolute left-0 mt-2 w-60 rounded-md shadow-lg bg-storm-dark border border-storm-light/10 ring-1 ring-black ring-opacity-5 divide-y divide-storm-light/10">
                      <div className="py-1">
                        {item.dropdown?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.label}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-lightning-dim hover:bg-storm-light/5 hover:text-blitz-blue"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                className="bg-[#7D4AFF] hover:bg-[#6B3AD9] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#7D4AFF]/30"
              >
                Try Now
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
                <div key={item.label}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.key as string)}
                        className="flex items-center justify-between w-full px-3 py-2 text-base text-lightning-dim hover:text-blitz-blue hover:bg-storm-light/5 rounded-md transition-colors duration-300"
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.key ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.key && (
                        <div className="pl-4 pt-1 pb-1 space-y-1 border-l border-storm-light/10 ml-3">
                          {item.dropdown?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.label}
                              href={dropdownItem.href}
                              className="block px-3 py-2 text-sm text-lightning-dim hover:text-blitz-blue hover:bg-storm-light/5 rounded-md transition-colors duration-300"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href as string}
                      className="block px-3 py-2 text-base text-lightning-dim hover:text-blitz-blue hover:bg-storm-light/5 rounded-md transition-colors duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
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
                  className="bg-[#7D4AFF] hover:bg-[#6B3AD9] text-white px-4 py-2 rounded-md text-base font-medium w-full"
                >
                  Try Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default NavigationBar;
