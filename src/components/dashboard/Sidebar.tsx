'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  Home as HomeIcon, // Renaming to avoid conflict if a local 'Home' component exists
  Zap as ZapIcon,
  CalendarDays as CalendarDaysIcon,
  LineChart as LineChartIcon,
  Settings as SettingsIcon,
  User as UserIcon, // Keep for potential future use in settings/profile
  CreditCard as CreditCardIcon // Keep for potential future use
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accelerate', href: '/dashboard/accelerate', icon: ZapIcon },
  { name: 'Blitz', href: '/dashboard/blitz', icon: CalendarDaysIcon },
  { name: 'Cycle', href: '/dashboard/cycle', icon: LineChartIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
  // Example for future grouped items or less prominent links:
  // { name: 'Profile', href: '/dashboard/profile', icon: UserIcon, group: 'Account' },
  // { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCardIcon, group: 'Account' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-card text-foreground border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="/images/ChatGPT Image Jun 1, 2025, 07_27_54 PM.png"
              alt="ClipsCommerce Logo"
              fill
              style={{
                objectFit: 'cover',
                filter: 'invert(1)'
              }}
              priority
            />
          </div>
          <span className="text-xl font-bold text-foreground">ClipsCommerce</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center p-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 mt-auto border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} ClipsCommerce
        </div>
      </div>
    </div>
  );
}
