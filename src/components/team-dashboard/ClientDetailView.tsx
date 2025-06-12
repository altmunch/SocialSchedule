'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CircularScore } from '@/components/ui/circular-score';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share2,
  Calendar,
  DollarSign,
  Users,
  Activity,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { useTeamMode } from '@/providers/TeamModeProvider';

interface ClientDetailViewProps {
  clientId: string;
  onBack: () => void;
}

export function ClientDetailView({ clientId, onBack }: ClientDetailViewProps) {
  const { clients } = useTeamMode();
  const [activeTab, setActiveTab] = useState('overview');
  
  const client = clients.find(c => c.id === clientId);
  
  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Client not found</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-mint/20 text-mint border-mint';
      case 'paused': return 'bg-lavender/20 text-lavender border-lavender';
      case 'needs_attention': return 'bg-coral/20 text-coral border-coral';
      default: return 'bg-muted/20 text-muted-foreground border-muted';
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-info/20 text-info border-info';
      case 'completed': return 'bg-mint/20 text-mint border-mint';
      case 'error': return 'bg-coral/20 text-coral border-coral';
      default: return 'bg-muted/20 text-muted-foreground border-muted';
    }
  };

  // Mock detailed analytics data
  const weeklyMetrics = {
    views: 125450,
    viewsChange: 12.5,
    engagement: 8.7,
    engagementChange: -2.1,
    followers: 45280,
    followersChange: 3.8,
    revenue: 15420,
    revenueChange: 28.3
  };

  const recentPosts = [
    { id: 1, title: 'Product Demo Video', platform: 'TikTok', views: 12500, engagement: 9.2, posted: '2 hours ago' },
    { id: 2, title: 'Behind the Scenes', platform: 'Instagram', views: 8340, engagement: 7.8, posted: '1 day ago' },
    { id: 3, title: 'Customer Testimonial', platform: 'YouTube', views: 5620, engagement: 11.1, posted: '3 days ago' },
  ];

  const upcomingPosts = [
    { id: 1, title: 'Weekly Update', platform: 'TikTok', scheduledFor: 'Today 6:00 PM' },
    { id: 2, title: 'Product Launch', platform: 'Instagram', scheduledFor: 'Tomorrow 9:00 AM' },
    { id: 3, title: 'Tutorial Video', platform: 'YouTube', scheduledFor: 'Friday 2:00 PM' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-creative">{client.name}</h1>
            <p className="text-muted-foreground">{client.industry}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`border ${getStatusColor(client.status)}`}>
            {client.status.replace('_', ' ')}
          </Badge>
          <Badge className={`border ${getWorkflowStatusColor(client.workflowStatus)}`}>
            {client.workflowStatus}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Views</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{weeklyMetrics.views.toLocaleString()}</div>
              <div className={`text-xs flex items-center ${weeklyMetrics.viewsChange > 0 ? 'text-mint' : 'text-coral'}`}>
                {weeklyMetrics.viewsChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(weeklyMetrics.viewsChange)}% this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Engagement</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{weeklyMetrics.engagement}%</div>
              <div className={`text-xs flex items-center ${weeklyMetrics.engagementChange > 0 ? 'text-mint' : 'text-coral'}`}>
                {weeklyMetrics.engagementChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(weeklyMetrics.engagementChange)}% this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{weeklyMetrics.followers.toLocaleString()}</div>
              <div className={`text-xs flex items-center ${weeklyMetrics.followersChange > 0 ? 'text-mint' : 'text-coral'}`}>
                {weeklyMetrics.followersChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(weeklyMetrics.followersChange)}% this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">${weeklyMetrics.revenue.toLocaleString()}</div>
              <div className={`text-xs flex items-center ${weeklyMetrics.revenueChange > 0 ? 'text-mint' : 'text-coral'}`}>
                {weeklyMetrics.revenueChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(weeklyMetrics.revenueChange)}% this week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-creative">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <CircularScore value={Math.round(client.avgEngagement * 10)} size={120} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Performance Score</p>
                  <p className="text-lg font-semibold text-creative">{Math.round(client.avgEngagement * 10)}/100</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Quality</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Posting Consistency</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Audience Engagement</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-creative">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-mint" />
                      <span className="text-sm">Accelerate workflow completed</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-lavender" />
                      <span className="text-sm">3 posts scheduled for today</span>
                    </div>
                    <span className="text-xs text-muted-foreground">4 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-info" />
                      <span className="text-sm">Engagement rate increased by 12%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Posts */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-creative">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{post.platform}</span>
                          <span>{post.views.toLocaleString()} views</span>
                          <span>{post.engagement}% engagement</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{post.posted}</p>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Posts */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-creative">Upcoming Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{post.platform}</span>
                          <span>{post.scheduledFor}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-creative">Active Workflows</CardTitle>
              <CardDescription>Manage automated workflows for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Accelerate', 'Blitz', 'Cycle'].map((workflow, index) => (
                  <div key={workflow} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">{workflow}</h4>
                      <p className="text-sm text-muted-foreground">
                        {workflow === 'Accelerate' && 'Content optimization pipeline'}
                        {workflow === 'Blitz' && 'Automated posting scheduler'}
                        {workflow === 'Cycle' && 'Performance analytics & improvements'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={index === 1 ? 'bg-mint/20 text-mint' : 'bg-muted/20 text-muted-foreground'}>
                        {index === 1 ? 'Active' : 'Idle'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {index === 1 ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-creative">Detailed Analytics</CardTitle>
              <CardDescription>In-depth performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Detailed analytics charts would be rendered here</p>
                  <p className="text-sm">Integration with charting library required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 