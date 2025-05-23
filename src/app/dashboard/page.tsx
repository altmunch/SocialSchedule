import DashboardNavbar from "@/components/dashboard-navbar";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Plus, Users, TrendingUp, Zap, Calendar, Music, BookOpen } from "lucide-react";

// Mock data
const mockAnalytics = {
  engagementRate: 4.8,
  followers: 12450,
  impressions: 125000,
  topPerformingPost: 'New Collection Preview',
  engagementScore: 87,
};

const mockPosts = [
  { id: 1, platform: 'Instagram', content: 'New product launch!', status: 'scheduled', date: '2023-06-15 14:30', engagement: 78 },
  { id: 2, platform: 'TikTok', content: 'Behind the scenes', status: 'published', date: '2023-06-14 10:15', engagement: 92 },
  { id: 3, platform: 'Twitter', content: 'Industry insights', status: 'draft', date: '2023-06-16 16:45', engagement: 45 },
];

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
    <div className="min-h-screen bg-dominator-black">
      <DashboardNavbar />
      <div className="p-6 md:p-8">
        <SubscriptionCheck>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-dominator-light">Dashboard</h1>
                <p className="text-dominator-light/80">
                  Welcome back, <span className="text-dominator-blue">{user.email?.split('@')[0] || 'User'}</span>! Here's what's happening with your account.
                </p>
              </div>
              <Button className="bg-gradient-to-r from-dominator-blue to-dominator-magenta hover:from-dominator-blue/90 hover:to-dominator-magenta/90 text-dominator-black font-medium hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>

            {/* Stats Overview */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-dominator-dark/30 border border-dominator-dark/50 p-1">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-dominator-dark/50 data-[state=active]:text-dominator-blue rounded px-3 py-1.5 text-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-dominator-dark/50 data-[state=active]:text-dominator-blue rounded px-3 py-1.5 text-sm"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Engagement Rate Card */}
                  <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-dominator-light/80">Engagement Rate</CardTitle>
                      <div className="p-2 rounded-lg bg-dominator-blue/10">
                        <BarChart2 className="h-4 w-4 text-dominator-blue" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-dominator-light">{mockAnalytics.engagementRate}%</div>
                      <p className="text-xs text-dominator-light/60">+2.1% from last month</p>
                    </CardContent>
                  </Card>

                  {/* Total Followers Card */}
                  <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-dominator-light/80">Total Followers</CardTitle>
                      <div className="p-2 rounded-lg bg-dominator-blue/10">
                        <Users className="h-4 w-4 text-dominator-blue" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-dominator-light">
                        {(mockAnalytics.followers / 1000).toFixed(1)}K
                      </div>
                      <p className="text-xs text-dominator-light/60">+320 this week</p>
                    </CardContent>
                  </Card>

                  {/* Impressions Card */}
                  <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-dominator-light/80">Impressions</CardTitle>
                      <div className="p-2 rounded-lg bg-dominator-blue/10">
                        <TrendingUp className="h-4 w-4 text-dominator-blue" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-dominator-light">
                        {(mockAnalytics.impressions / 1000).toFixed(0)}K
                      </div>
                      <p className="text-xs text-dominator-light/60">+12.5% from last month</p>
                    </CardContent>
                  </Card>

                  {/* Engagement Score Card */}
                  <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-dominator-light/80">Engagement Score</CardTitle>
                      <div className="p-2 rounded-lg bg-dominator-blue/10">
                        <Zap className="h-4 w-4 text-dominator-blue" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-dominator-light">
                        {mockAnalytics.engagementScore}/100
                      </div>
                      <div className="mt-2">
                        <Progress value={mockAnalytics.engagementScore} className="h-2 bg-dominator-dark/30" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Calendar */}
                <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-dominator-light">Content Calendar</CardTitle>
                        <CardDescription className="text-dominator-light/60">Upcoming scheduled posts and campaigns</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="border-dominator-dark/50 text-dominator-light/80 hover:bg-dominator-dark/30">
                        <Calendar className="mr-2 h-4 w-4" />
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPosts.map((post) => (
                        <div key={post.id} className="flex items-center p-3 rounded-lg border border-dominator-dark/50">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dominator-blue/10 flex items-center justify-center">
                            <span className="text-dominator-blue font-medium">
                              {post.platform[0]}
                            </span>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-dominator-light">{post.content}</h4>
                              <Badge 
                                variant={post.status === 'published' ? 'default' : 'outline'}
                                className="text-xs text-dominator-light/80 border-dominator-dark/50"
                              >
                                {post.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-dominator-light/60 mt-1">
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

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Trending Audios */}
                  <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Music className="h-5 w-5 text-dominator-blue" />
                        <CardTitle className="text-dominator-light">Trending Audios</CardTitle>
                      </div>
                      <CardDescription className="text-dominator-light/60">Popular sounds in your niche</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockTrendingAudios.map((audio) => (
                          <div key={audio.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-dominator-light">{audio.name}</p>
                              <p className="text-sm text-dominator-light/60">{audio.creator}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-dominator-light">{audio.usage}</p>
                              <p className="text-sm text-green-500">↑ {audio.growth}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Hook Generator */}
                  <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-dominator-blue" />
                        <CardTitle className="text-dominator-light">AI Hook Generator</CardTitle>
                      </div>
                      <CardDescription className="text-dominator-light/60">High-converting hooks for your next post</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockHooks.map((hook, index) => (
                          <div key={index} className="p-3 bg-dominator-dark/30 rounded-lg text-sm text-dominator-light/80">
                            {hook}
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          className="w-full mt-2 border-dominator-dark/50 text-dominator-light/80 hover:bg-dominator-dark/30"
                        >
                          Generate More Hooks
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="pt-4">
                <Card className="bg-dominator-dark/50 border-dominator-dark/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-dominator-light">Analytics</CardTitle>
                    <CardDescription className="text-dominator-light/60">
                      Detailed performance metrics and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center rounded-lg bg-dominator-dark/30">
                      <p className="text-dominator-light/60">Analytics dashboard coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SubscriptionCheck>
      </div>
    </div>
  );
}
