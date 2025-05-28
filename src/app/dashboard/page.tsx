'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Zap, BarChart3, RefreshCw, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Feature cards for the dashboard
  const features = [
    {
      title: 'Scan',
      description: 'Analyze trends and opportunities in your niche',
      icon: Search,
      href: '/dashboard/scan',
      color: 'bg-blue-500',
    },
    {
      title: 'Accelerate',
      description: 'Optimize your content for maximum engagement',
      icon: Zap,
      href: '/dashboard/accelerate',
      color: 'bg-purple-500',
    },
    {
      title: 'Blitz',
      description: 'Schedule posts at optimal times for visibility',
      icon: BarChart3,
      href: '/dashboard/blitz',
      color: 'bg-green-500',
    },
    {
      title: 'Cycle',
      description: 'Analyze performance and generate new content ideas',
      icon: RefreshCw,
      href: '/dashboard/cycle',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user?.email?.split('@')[0] || 'User'}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className={`p-2 rounded-md w-10 h-10 flex items-center justify-center ${feature.color} text-white mb-2`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-4">
              <Button asChild variant="ghost" className="w-full justify-between">
                <Link href={feature.href}>
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-500">No recent activity found</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <p className="text-sm font-medium">Total Posts</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm font-medium">Total Engagement</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm font-medium">Scans Completed</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm font-medium">Content Optimized</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
