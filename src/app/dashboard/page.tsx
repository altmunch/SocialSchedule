'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Zap, BarChart3, RefreshCw, ArrowRight } from 'lucide-react';
import { LineChart, BarChart } from '@/components/dashboard/charts';
import { ReportsAnalysisService } from '@/app/workflows/reports/ReportsAnalysisService';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Hello');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const supabase = createClientComponentClient();
        const reportsService = new ReportsAnalysisService(supabase);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const result = await reportsService.getReport({
          userId: user.id,
          platform: 'TikTok',
          timeRange: { start: start.toISOString(), end: end.toISOString() },
          correlationId: `dashboard-home-${user.id}`,
        });
        if (result.success) {
          setAnalytics(result.data);
        } else {
          setError(result.error?.message || 'Failed to load analytics');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

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
    <div className="min-h-screen bg-background text-text flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user?.email?.split('@')[0] || 'User'}
        </h1>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Workflow Cards */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-xl font-semibold mb-2 text-creative">Choose your workflow</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-panel rounded-lg p-6 flex-1 flex flex-col justify-between shadow-md border border-border">
              <div>
                <h3 className="text-lg font-bold text-creative mb-2">Sell Better</h3>
                <p className="text-secondaryText mb-4">Optimize your sales workflow for better results. Click below to start.</p>
              </div>
              <Link href="/dashboard/accelerate">
                <Button className="bg-primary text-black hover:bg-creative hover:text-white w-full">Start Sell Better</Button>
              </Link>
            </div>
            <div className="bg-panel rounded-lg p-6 flex-1 flex flex-col justify-between shadow-md border border-border">
              <div>
                <h3 className="text-lg font-bold text-creative mb-2">How to Sell</h3>
                <p className="text-secondaryText mb-4">Learn and implement proven selling tactics. Click below to explore.</p>
              </div>
              <Link href="/dashboard/ideation">
                <Button className="bg-primary text-black hover:bg-creative hover:text-white w-full">Start How to Sell</Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Performance Charts */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-xl font-semibold mb-2 text-creative">Performance</h2>
          <div className="flex flex-col gap-6">
            <div className="bg-panel rounded-lg p-6 shadow-md border border-border flex flex-col items-center">
              <span className="text-creative font-bold mb-2">Sales</span>
              <div className="w-full h-32">
                {loading ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : error ? (
                  <div className="text-red-500 text-sm">{error}</div>
                ) : analytics && analytics.historicalViewGrowth ? (
                  <BarChart />
                ) : (
                  <div className="text-secondaryText text-sm">No data</div>
                )}
              </div>
            </div>
            <div className="bg-panel rounded-lg p-6 shadow-md border border-border flex flex-col items-center">
              <span className="text-highlight font-bold mb-2">Conversion</span>
              <div className="w-full h-32">
                {loading ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : error ? (
                  <div className="text-red-500 text-sm">{error}</div>
                ) : analytics && analytics.pastPostsPerformance ? (
                  <LineChart />
                ) : (
                  <div className="text-secondaryText text-sm">No data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
