'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart } from '@/components/dashboard/charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, ChevronRight, Target, Award, AlertTriangle } from 'lucide-react';
import { CircularScore } from '@/components/ui/circular-score';
import { ChartWrapper } from '@/components/ui/chart-wrapper';

type ContentIdea = {
  id: string;
  title: string;
  description: string;
  estimated_engagement: number;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  before_after?: {
    before: string;
    after: string;
  };
};

type OptimizationSuggestion = {
  id: string;
  title: string;
  description: string;
  estimated_improvement: number;
  priority: 'high' | 'medium' | 'low';
  category: 'scheduling' | 'optimization';
};

type PerformanceMetric = {
  label: string;
  current: number;
  previous: number;
  target: number;
  trend: 'up' | 'down' | 'neutral';
};

export default function CycleComponent() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  
  // Split suggestions into optimization and content
  const [optimizationSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: '1',
      title: 'Optimize posting schedule',
      description: 'Post during peak engagement hours (6-8 PM) for 23% better reach.',
      estimated_improvement: 23,
      priority: 'high',
      category: 'scheduling'
    },
    {
      id: '2', 
      title: 'Enhance content descriptions',
      description: 'Add trending keywords to boost discoverability by 15%.',
      estimated_improvement: 15,
      priority: 'medium',
      category: 'optimization'
    }
  ]);

  const [contentIdeas] = useState<ContentIdea[]>([
    {
      id: '1',
      title: 'Behind-the-scenes walkthrough',
      description: 'Show your audience how your product/service works behind the scenes.',
      estimated_engagement: 85,
      priority: 'high',
      difficulty: 'easy',
      before_after: {
        before: 'Generic product posts',
        after: 'Authentic behind-the-scenes content showing real process'
      }
    },
    {
      id: '2',
      title: 'Common industry myth debunked',
      description: 'Address a common misconception in your industry with facts and data.',
      estimated_engagement: 78,
      priority: 'medium',
      difficulty: 'medium',
      before_after: {
        before: 'Repeating common advice',
        after: 'Educational content that challenges assumptions'
      }
    },
    {
      id: '3',
      title: 'Case study: Before and After',
      description: 'Showcase a successful project with before and after results.',
      estimated_engagement: 92,
      priority: 'high',
      difficulty: 'hard',
      before_after: {
        before: 'Vague success claims',
        after: 'Detailed case study with metrics and proof'
      }
    },
  ]);

  // Mock performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    { label: 'Engagement Rate', current: 76, previous: 68, target: 85, trend: 'up' },
    { label: 'Follower Growth', current: 82, previous: 75, target: 90, trend: 'up' },
    { label: 'Content Quality', current: 68, previous: 72, target: 80, trend: 'down' },
    { label: 'Posting Consistency', current: 91, previous: 88, target: 95, trend: 'up' },
  ];

  const handleGenerateIdeas = () => {
    // In a real app, this would call an AI service to generate fresh ideas
    // For demo purposes, we'll just use our static data
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-coral/20 text-coral border-coral',
      medium: 'bg-lavender/20 text-lavender border-lavender',
      low: 'bg-mint/20 text-mint border-mint',
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    const icons = {
      high: AlertTriangle,
      medium: Target,
      low: Award,
    };
    return icons[priority];
  };

  const getDifficultyStars = (difficulty: 'easy' | 'medium' | 'hard') => {
    const levels = {
      easy: 1,
      medium: 3,
      hard: 5,
    };
    return '⭐'.repeat(levels[difficulty]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">Cycle</h1>
        <p className="text-muted-foreground mt-1">Analyze performance and generate improvement ideas</p>
      </div>

      {/* AI Optimization Suggestions - Now at the top */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-creative flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-lavender" />
            AI Optimization Suggestions
          </CardTitle>
          <CardDescription>Direct improvements for scheduling and content optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimizationSuggestions.map((suggestion) => {
            const PriorityIcon = getPriorityIcon(suggestion.priority);
            return (
              <div key={suggestion.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded border ${getPriorityColor(suggestion.priority)}`}>
                        <PriorityIcon className="h-3 w-3" />
                      </div>
                      <h3 className="font-semibold">{suggestion.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-mint">+{suggestion.estimated_improvement}%</div>
                      <div className="text-xs text-muted-foreground">improvement</div>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Apply All
          </Button>
        </CardFooter>
      </Card>

      {/* AI Content Suggestions */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-creative flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-lavender" />
            Content Ideas & Strategies
          </CardTitle>
          <CardDescription>Suggestions to improve your content strategy and engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentIdeas.map((idea) => {
            const PriorityIcon = getPriorityIcon(idea.priority);
            return (
              <div key={idea.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded border ${getPriorityColor(idea.priority)}`}>
                        <PriorityIcon className="h-3 w-3" />
                      </div>
                      <h3 className="font-semibold">{idea.title}</h3>
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {getDifficultyStars(idea.difficulty)} {idea.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                    
                    {/* Before/After Section */}
                    {idea.before_after && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2 rounded bg-coral/10 border border-coral/20">
                          <div className="font-medium text-coral mb-1">Before:</div>
                          <div className="text-muted-foreground">{idea.before_after.before}</div>
                        </div>
                        <div className="p-2 rounded bg-mint/10 border border-mint/20">
                          <div className="font-medium text-mint mb-1">After:</div>
                          <div className="text-muted-foreground">{idea.before_after.after}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-mint">+{idea.estimated_engagement}%</div>
                      <div className="text-xs text-muted-foreground">estimated views</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGenerateIdeas}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Ideas
          </Button>
        </CardFooter>
      </Card>

      {/* Performance Analytics with Circular Graphs */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-creative">Performance Analytics</CardTitle>
          <CardDescription>Track your key metrics with circular progress indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="text-center space-y-2">
                <CircularScore 
                  value={metric.current} 
                  size={80}
                  className="mx-auto"
                />
                <div>
                  <h3 className="font-medium">{metric.label}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <span className={`${metric.trend === 'up' ? 'text-mint' : metric.trend === 'down' ? 'text-coral' : 'text-muted-foreground'}`}>
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.current}%
                    </span>
                    <span className="text-muted-foreground">/ {metric.target}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-muted">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-card">Analytics</TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-card">Trend Analysis</TabsTrigger>
          </TabsList>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,427</div>
                <p className="text-xs text-mint flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +14.5% from previous period
                </p>
                <div className="h-[80px] mt-2">
                  <ChartWrapper><LineChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Audience Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+258</div>
                <p className="text-xs text-mint flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.3% from previous period
                </p>
                <div className="h-[80px] mt-2">
                  <ChartWrapper><LineChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.8%</div>
                <p className="text-xs text-mint flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.4% from previous period
                </p>
                <div className="h-[80px] mt-2">
                  <ChartWrapper><LineChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-creative">Engagement by Platform</CardTitle>
                <CardDescription>Where your content performs best</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartWrapper><BarChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-creative">Growth Trends</CardTitle>
                <CardDescription>Follower growth over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartWrapper><LineChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-creative">Trending Topics</CardTitle>
                <CardDescription>Popular content themes this week</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartWrapper><BarChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-creative">Performance Trends</CardTitle>
                <CardDescription>Content performance over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartWrapper><LineChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-creative">Competitive Analysis</CardTitle>
              <CardDescription>How you compare to similar accounts</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartWrapper><BarChart data={[{value: 60}, {value: 70}, {value: 50}, {value: 30}, {value:20}, {value:10}, {value:15}]} /></ChartWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
