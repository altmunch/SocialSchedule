'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, PieChart, LineChart, HotspotGeneration } from '@/components/dashboard/charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, ChevronRight } from 'lucide-react';

type ContentIdea = {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  estimated_engagement: number;
};

export default function CycleComponent() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([
    {
      id: '1',
      title: 'Behind-the-scenes walkthrough',
      description: 'Show your audience how your product/service works behind the scenes.',
      type: 'video',
      estimated_engagement: 85,
    },
    {
      id: '2',
      title: 'Common industry myth debunked',
      description: 'Address a common misconception in your industry with facts and data.',
      type: 'image',
      estimated_engagement: 78,
    },
    {
      id: '3',
      title: 'Case study: Before and After',
      description: 'Showcase a successful project with before and after results.',
      type: 'text',
      estimated_engagement: 92,
    },
  ]);

  const handleGenerateIdeas = () => {
    // In a real app, this would call an AI service to generate fresh ideas
    // For demo purposes, we'll just use our static data
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cycle</h1>
        <p className="text-gray-500">Analyze performance and generate new content ideas</p>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Performance Overview</h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,427</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +14.5% from previous period
                </p>
                <div className="h-[80px] mt-2">
                  <LineChart />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Audience Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+258</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.3% from previous period
                </p>
                <div className="h-[80px] mt-2">
                  <LineChart />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.8%</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.4% from previous period
                </p>
                <div className="h-[80px] mt-2">
                  <LineChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Platform</CardTitle>
                <CardDescription>Where your content performs best</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Content Type Breakdown</CardTitle>
                <CardDescription>Performance by content format</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Hotspots</CardTitle>
              <CardDescription>Optimal times to post for maximum engagement</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <HotspotGeneration />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ideas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Content Ideas</CardTitle>
              <CardDescription>
                Fresh content ideas based on your niche and audience engagement patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentIdeas.map((idea) => (
                  <div key={idea.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium flex items-center">
                          <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                          {idea.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{idea.description}</p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {idea.type}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Estimated engagement:</span>
                        <span className="text-xs font-medium text-green-600">{idea.estimated_engagement}%</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Use This Idea <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateIdeas}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Fresh Ideas
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
