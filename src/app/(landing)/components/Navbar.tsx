'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <header 
      className={cn(
        'fixed w-full z-50 transition-all duration-300',
        isScrolled ? 'bg-graphite/80 backdrop-blur-md border-b border-graphite-light/20' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-misty to-mint bg-clip-text text-transparent">
              SocialScheduler
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-misty transition-colors text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
            <Button 
              className="ml-4 bg-gradient-to-r from-misty to-mint text-graphite hover:opacity-90 transition-opacity hover:text-graphite"
              onClick={() => window.location.href = '#cta'}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-misty transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden bg-graphite/95 backdrop-blur-lg overflow-hidden transition-all duration-300',
          isMenuOpen ? 'max-h-96 py-4 border-t border-graphite-light/20' : 'max-h-0 py-0'
        )}
      >
        <div className="px-4 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-graphite-light/20 hover:text-misty transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <Button 
            className="w-full mt-2 bg-gradient-to-r from-misty to-mint text-graphite hover:opacity-90 transition-opacity hover:text-graphite"
            onClick={() => {
              window.location.href = '#cta';
              setIsMenuOpen(false);
            }}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
