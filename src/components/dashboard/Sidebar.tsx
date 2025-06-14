'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  Home as HomeIcon, // Renaming to avoid conflict if a local 'Home' component exists
  Zap as ZapIcon,
  CalendarDays as CalendarDaysIcon,
  LineChart as LineChartIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  Crown as CrownIcon,
  Link as LinkIcon,
  RefreshCw as RefreshCwIcon,
  ChevronRight
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
];

const sellFasterNav = [
  { name: 'Accelerate', href: '/dashboard/accelerate', icon: ZapIcon },
  { name: 'Blitz', href: '/dashboard/blitz', icon: CalendarDaysIcon },
  { name: 'Cycle', href: '/dashboard/cycle', icon: RefreshCwIcon },
];

const howToSellNav = [
  { name: 'Ideator', href: '/dashboard/ideator', icon: LightbulbIcon },
  { name: 'Competitor tactics', href: '/dashboard/competitor-tactics', icon: LineChartIcon },
];

const accountNav = [
  { name: 'Connect', href: '/dashboard/connect', icon: LinkIcon },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CrownIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [sellFasterOpen, setSellFasterOpen] = useState<boolean>(true);
  const [sellOpen, setSellOpen] = useState<boolean>(true);

  // Example onboarding progress array (would come from API)
  const incompletePaths = ['/dashboard/ideator', '/dashboard/competitor-tactics'];

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border-r border-[#8D5AFF]/20 flex flex-col shadow-xl">
      <div className="p-6 border-b border-[#8D5AFF]/20 flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#8D5AFF] to-[#00e5a0] flex items-center justify-center">
            <Image
              src="/images/ChatGPT Image Jun 1, 2025, 07_27_54 PM.png"
              alt="ClipsCommerce Logo"
              width={40}
              height={40}
              className="object-contain p-1 invert"
              priority
            />
          </div>
          <span className="text-2xl font-bold text-white">
            ClipsCommerce
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-4 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Primary */}
        <ul className="space-y-1 p-2">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "group flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-[#8D5AFF]/20 text-[#8D5AFF] font-semibold border border-[#8D5AFF]/30" 
                      : "text-gray-300 hover:bg-[#8D5AFF]/10 hover:text-white"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5 transition-transform duration-200", 
                      isActive 
                        ? "text-[#8D5AFF]" 
                        : "text-gray-400 group-hover:text-white group-hover:scale-105"
                    )} 
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sell Faster group collapsible */}
        <div className="mt-6 px-2">
          <button
            onClick={() => setSellFasterOpen(!sellFasterOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8D5AFF]/30 rounded-lg px-3 py-2 transition-colors"
          >
            <span className="flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8D5AFF] mr-2"></span>
              Sell Faster
            </span>
            <span className={cn("transition-transform text-gray-400", sellFasterOpen ? "rotate-90" : "")}>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
          {sellFasterOpen && (
            <ul className="mt-2 pl-2 space-y-1">
              {sellFasterNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center py-1.5 px-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? "bg-hover text-primary" : "text-secondaryText hover:bg-hover hover:text-primary"
                      )}
                    >
                      <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-150", isActive ? "text-primary" : "text-secondaryText group-hover:text-primary group-hover:scale-110")} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* How to Sell group collapsible */}
        <div className="mt-6 px-2">
          <button
            onClick={() => setSellOpen(!sellOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 rounded-lg px-3 py-2 transition-colors"
          >
            <span className="flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mr-2"></span>
              How to Sell
            </span>
            <span className={cn("transition-transform text-muted-foreground", sellOpen ? "rotate-90" : "")}>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
          {sellOpen && (
            <ul className="mt-2 pl-2 space-y-1">
              {howToSellNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                // Only show red dots if user has actual edits in progress (this would be managed by state)
                const hasEditsInProgress = false; // This would come from your app state
                return (
                  <li key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center py-1.5 px-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? "bg-hover text-primary" : "text-secondaryText hover:bg-hover hover:text-primary"
                      )}
                    >
                      <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-150", isActive ? "text-primary" : "text-secondaryText group-hover:text-primary group-hover:scale-110")} />
                      {item.name}
                      {hasEditsInProgress && (
                        <span className="ml-auto mr-1 h-2 w-2 rounded-full bg-coral" aria-label="Edits in progress" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Account nav - separated with space */}
        <div className="mt-8 pt-4 border-t border-border">
          <ul className="space-y-1">
            {accountNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center py-1.5 px-2 rounded-md text-sm font-medium transition-colors",
                      isActive ? "bg-hover text-primary" : "text-secondaryText hover:bg-hover hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-150", isActive ? "text-primary" : "text-secondaryText group-hover:text-primary group-hover:scale-110")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
