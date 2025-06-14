'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  User, 
  Search, 
  Filter,
  ToggleLeft,
  ToggleRight,
  Users,
  Home,
  RefreshCw
} from 'lucide-react';

interface TeamHeaderProps {
  breadcrumb?: React.ReactNode;
}

export default function TeamHeader({ breadcrumb }: TeamHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { 
    searchQuery, 
    setSearchQuery, 
    refreshClients, 
    totalClientCount,
    selectedClients 
  } = useTeamMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonalMode, setIsPersonalMode] = useState(false);

  const handleModeSwitch = () => {
    if (isPersonalMode) {
      // Already in personal mode, do nothing or provide feedback
      return;
    }
    
    // Smooth transition to personal dashboard
    setIsPersonalMode(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  const handleRefresh = async () => {
    await refreshClients();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10 text-foreground">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="hover:bg-secondary/20 text-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Left section - Breadcrumb and Mode Switcher */}
          <div className="hidden md:flex md:flex-shrink-0 items-center space-x-4">
            {/* Mode Switcher */}
            <div className="flex items-center space-x-2 bg-muted/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModeSwitch}
                className="flex items-center space-x-2 text-xs"
              >
                <Home className="h-4 w-4" />
                <span>Personal</span>
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center space-x-2 text-xs bg-mint text-background hover:bg-mint/90"
                disabled
              >
                <Users className="h-4 w-4" />
                <span>Team</span>
                <ToggleRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm">
              {breadcrumb}
            </div>
          </div>

          {/* Center section - Search and Quick Stats */}
          <div className="flex-1 max-w-lg mx-4 md:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search clients, campaigns, or metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-background/50 border-border focus:border-mint"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Stats Bar */}
            <div className="hidden lg:flex items-center justify-center mt-1 space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{formatNumber(totalClientCount)} clients</span>
              </span>
              {selectedClients.length > 0 && (
                <span className="flex items-center space-x-1 text-mint">
                  <span>•</span>
                  <span>{selectedClients.length} selected</span>
                </span>
              )}
            </div>
          </div>

          {/* Right section - Actions and User Menu */}
          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-mint animate-pulse"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Team Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-2 px-4 text-sm space-y-2">
                  <div className="p-2 bg-mint/10 rounded-md">
                    <div className="font-medium">Bulk workflow completed</div>
                    <div className="text-xs text-muted-foreground">247 clients processed successfully</div>
                  </div>
                  <div className="p-2 bg-coral/10 rounded-md">
                    <div className="font-medium">3 clients need attention</div>
                    <div className="text-xs text-muted-foreground">API connection issues detected</div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 hover:bg-secondary/20"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mint to-lavender flex items-center justify-center text-background">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user?.email?.split('@')[0] || 'Team Admin'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Team Mode
                    </span>
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Team Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/team-dashboard/settings">Team Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/subscription">Subscription</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleModeSwitch}>
                  Switch to Personal Mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="space-y-1 px-4 py-3">
            {/* Mobile Mode Switcher */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Team Mode</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleModeSwitch}
                className="text-xs"
              >
                Switch to Personal
              </Button>
            </div>
            
            {/* Mobile Quick Stats */}
            <div className="py-2 text-sm text-muted-foreground">
              <div>{formatNumber(totalClientCount)} total clients</div>
              {selectedClients.length > 0 && (
                <div className="text-mint">{selectedClients.length} selected</div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 