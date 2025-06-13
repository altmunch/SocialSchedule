'use client';

import dynamic from 'next/dynamic';

// Dynamically import NavigationBarClient with no SSR to prevent hydration mismatch
const NavigationBarClient = dynamic(() => import('./NavigationBarClient'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-black/80 backdrop-blur-md border-b border-white/5">
      {/* Announcement banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium text-white">
          <span className="flex items-center">
            ⭐ AI-powered e-commerce content creation and optimization platform
          </span>
          <a 
            href="/dashboard" 
            className="font-bold underline hover:text-white/90 transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </div>
      
      {/* Main navigation skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-700">
                  {/* Placeholder for logo */}
                </div>
                <span className="text-white text-2xl font-bold">ClipsCommerce</span>
              </div>
            </a>
          </div>

          {/* Navigation skeleton */}
          <nav className="hidden md:flex items-center space-x-8 h-6">
            {/* Loading skeleton */}
            <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="/sign-in"
              className="text-sm text-gray-200 hover:text-white transition-colors duration-300"
            >
              Sign In
            </a>
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 inline-block"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button skeleton */}
          <div className="md:hidden flex items-center h-10 w-10">
            <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  )
});

export default NavigationBarClient; 