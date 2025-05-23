import DashboardNavbar from "@/components/dashboard-navbar";
import { createServerClient } from "@/lib/supabase";
import { cookies } from 'next/headers';
import { 
  Calendar, 
  BarChart2, 
  Zap, 
  Hash, 
  Music, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock as ClockIcon
} from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data - replace with actual data from your API
const mockPosts = [
  { id: 1, platform: 'Instagram', content: 'New product launch!', status: 'scheduled', date: '2023-06-15 14:30', engagement: 78 },
  { id: 2, platform: 'TikTok', content: 'Behind the scenes', status: 'published', date: '2023-06-14 10:15', engagement: 92 },
  { id: 3, platform: 'Twitter', content: 'Industry insights', status: 'draft', date: '2023-06-16 16:45', engagement: 45 },
];

const mockAnalytics = {
  engagementRate: 4.8,
  followers: 12450,
  impressions: 125000,
  topPerformingPost: 'New Collection Preview',
  engagementScore: 87,
};

const mockTrendingAudios = [
  { id: 1, name: 'Upbeat Summer Vibe', creator: '@djmix', usage: '1.2M', growth: '12%' },
  { id: 2, name: 'Chill Lofi Beats', creator: '@lofigirl', usage: '890K', growth: '8%' },
  { id: 3, name: 'Epic Cinematic', creator: '@soundfx', usage: '2.1M', growth: '24%' },
];

const mockHooks = [
  'Stop making this common mistake...',
  'The secret to viral content is...',
  '3 things I wish I knew before...',
  'This changed everything for my growth...',
  'The truth about algorithm hacks...',
];

export default async function Dashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full bg-muted/40">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.email?.split('@')[0] || 'User'}</p>
            </div>
            <Button className="gap-2">
              <Plus size={16} />
              New Post
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(mockAnalytics.followers / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">+320 this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(mockAnalytics.impressions / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.engagementScore}/100</div>
                <div className="mt-2">
                  <Progress value={mockAnalytics.engagementScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Content Calendar */}
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content Calendar</CardTitle>
                    <CardDescription>Upcoming scheduled posts and campaigns</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar size={14} />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPosts.map((post) => (
                    <div key={post.id} className="flex items-center p-3 rounded-lg border">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {post.platform[0]}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{post.content}</h4>
                          <Badge 
                            variant={post.status === 'published' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {post.status}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>{post.date}</span>
                          <span className="mx-2">•</span>
                          <span>{post.engagement}% engagement</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Right Sidebar */}
            <div className="col-span-3 space-y-4">
              {/* Trending Audios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music size={18} />
                    <span>Trending Audios</span>
                  </CardTitle>
                  <CardDescription>Popular sounds in your niche</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTrendingAudios.map((audio) => (
                      <div key={audio.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{audio.name}</p>
                          <p className="text-sm text-muted-foreground">{audio.creator}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{audio.usage}</p>
                          <p className="text-sm text-green-500">↑ {audio.growth}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Hook Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen size={18} />
                    <span>AI Hook Generator</span>
                  </CardTitle>
                  <CardDescription>High-converting hooks for your next post</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockHooks.map((hook, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                        {hook}
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      Generate More Hooks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Track your social media performance</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Last 7 days
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Performance charts will be displayed here</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Schedule Post
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <BarChart2 className="h-6 w-6" />
              View Analytics
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Hash className="h-6 w-6" />
              Hashtag Research
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Settings className="h-6 w-6" />
              Settings
            </Button>
          </div>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
