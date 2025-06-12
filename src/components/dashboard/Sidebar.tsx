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
  RefreshCw as RefreshCwIcon
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
    <div className="w-64 h-screen bg-panel text-text border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="/images/ChatGPT Image Jun 1, 2025, 07_27_54 PM.png"
              alt="ClipsCommerce Logo"
              fill
              style={{ objectFit: 'cover', filter: 'invert(1)' }}
              priority
            />
          </div>
          <span className="text-xl font-bold text-text">ClipsCommerce</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Primary */}
        <ul>
          {mainNav.map((item) => {
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

        {/* Sell Faster group collapsible */}
        <div className="mt-6">
          <button
            onClick={() => setSellFasterOpen(!sellFasterOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
          >
            Sell Faster
            <span className={cn("transition-transform", sellFasterOpen ? "rotate-90" : "")}>▶</span>
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
        <div className="mt-6">
          <button
            onClick={() => setSellOpen(!sellOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
          >
            How to Sell
            <span className={cn("transition-transform", sellOpen ? "rotate-90" : "")}>▶</span>
          </button>
          {sellOpen && (
            <ul className="mt-2 pl-2 space-y-1">
              {howToSellNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const incomplete = incompletePaths.includes(item.href);
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
                      {incomplete && (
                        <span className="ml-auto mr-1 h-2 w-2 rounded-full bg-coral" aria-label="Onboarding step incomplete" />
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
      {/* Quick stats footer */}
      <div className="p-3 mt-auto border-t border-border text-xs text-secondaryText">
        <div className="flex items-center justify-between mb-0.5">
          <span>Scheduled Posts</span>
          <span className="font-semibold text-foreground">3</span>
        </div>
        <div className="flex items-center justify-between mb-0.5">
          <span>Videos Processing</span>
          <span className="font-semibold text-foreground">1</span>
        </div>
        <div className="text-center mt-2">&copy; {new Date().getFullYear()} ClipsCommerce</div>
      </div>
    </div>
  );
}
