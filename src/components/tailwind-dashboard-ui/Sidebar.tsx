'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Home, Zap, Calendar, BarChart3, Lightbulb, Target, Settings, Users, DollarSign, Menu, X } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, isActive }) => {
  const router = useRouter();

  return (
    <Link href={href} passHref onMouseEnter={() => router.prefetch(href)}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
        ${isActive ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
      `}>
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/v3/accelerate', icon: Zap, label: 'Algorithm Optimization' },
    { href: '/dashboard/v3/blitz', icon: Calendar, label: 'Autoposting' },
    { href: '/dashboard/v3/cycle', icon: BarChart3, label: 'Reports' },
    { href: '/dashboard/v3/ideator', icon: Lightbulb, label: 'Template Generator' },
    { href: '/dashboard/v3/competitor-tactics', icon: Target, label: 'Competitor Tactics' },
    { href: '/dashboard/v3/connect', icon: Users, label: 'Connect Accounts' },
    { href: '/dashboard/v3/subscription', icon: DollarSign, label: 'Subscription' },
    { href: '/dashboard/v3/profile', icon: Settings, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">CC</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
            ClipsCommerce
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar; 