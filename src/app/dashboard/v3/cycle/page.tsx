'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  AreaChart as AreaIcon,
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Lightbulb,
  RefreshCcw,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { LineChart, BarChart } from '@/components/dashboard/charts'; // Assuming these exist
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function CyclePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("monthly");

  // Mock Data for Analytics
  const salesData = [
    { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 }, { name: 'May', value: 6000 }, { name: 'Jun', value: 5500 },
    { name: 'Jul', value: 7000 }, { name: 'Aug', value: 6500 }, { name: 'Sep', value: 7500 },
    { name: 'Oct', value: 8000 }, { name: 'Nov', value: 7200 }, { name: 'Dec', value: 8500 },
  ];

  const engagementData = [
    { name: 'Jan', likes: 2400, comments: 1200 }, { name: 'Feb', likes: 2210, comments: 1000 },
    { name: 'Mar', likes: 2290, comments: 1500 }, { name: 'Apr', likes: 2000, comments: 1100 },
    { name: 'May', likes: 2181, comments: 1300 }, { name: 'Jun', likes: 2500, comments: 1600 },
  ];

  const platformDistributionData = [
    { name: 'TikTok', value: 400 },
    { name: 'Instagram', value: 300 },
    { name: 'YouTube', value: 300 },
  ];

  const conversionData = [
    { name: 'Week 1', visitors: 1000, converted: 50 },
    { name: 'Week 2', visitors: 1200, converted: 65 },
    { name: 'Week 3', visitors: 900, converted: 40 },
    { name: 'Week 4', visitors: 1500, converted: 80 },
  ];

  const COLORS = ['#10b981', '#6366f1', '#3b82f6', '#8b5cf6']; // Green, Indigo, Blue, Purple

  useEffect(() => {
    // Simulate data fetching
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeTab, timeframe]);

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
      <p className="text-lg">Loading analytics data...</p>
      <p className="text-sm text-slate-500">This might take a moment as we crunch the numbers.</p>
    </div>
  );

  const renderInsights = () => (
    <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-emerald-400" /> Actionable Insights
        </CardTitle>
        <CardDescription className="text-slate-400">
          AI-powered recommendations to boost your performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4 text-slate-300">
        <p>
          <span className="font-semibold text-emerald-300">Sales Growth Opportunity:</span> Your sales peaked in December. Analyze content from that period to replicate success and apply similar strategies for upcoming high seasons.
        </p>
        <p>
          <span className="font-semibold text-violet-300">Engagement Hotspot:</span> Instagram consistently drives high engagement. Consider reallocating more content creation efforts to capitalize on this platform's audience.
        </p>
        <p>
          <span className="font-semibold text-blue-300">Conversion Funnel Optimization:</span> While visitors are high, the conversion rate can be improved. Review your landing page UX and CTA clarity to reduce bounce rates.
        </p>
        <p>
          <span className="font-semibold text-amber-300">Content Gap Alert:</span> Competitor analysis shows strong performance in short-form video tutorials. This could be a significant content gap in your strategy. Plan to create more educational, quick-tip videos.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            Reports & Analytics
          </h1>
          <p className="text-slate-400 text-lg">
            Deep dive into your content performance across all platforms.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-6">
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-700/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Revenue</TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Engagement</TabsTrigger>
              <TabsTrigger value="platforms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Platforms</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-end mb-6">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? renderLoadingState() : (
          <TabsContent value={activeTab}>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Total Revenue Trend (Line Chart) */}
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <LineIcon className="h-6 w-6 text-emerald-400" /> Total Revenue ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Track your financial performance over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 8 }} name="Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Platform Content Distribution (Pie Chart) */}
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <PieIcon className="h-6 w-6 text-blue-400" /> Content Distribution by Platform
                    </CardTitle>
                    <CardDescription className="text-slate-400">See where your content is performing best.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {platformDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Engagement Trends (Area Chart) */}
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl lg:col-span-2">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <AreaIcon className="h-6 w-6 text-violet-400" /> Engagement Trends ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Understand likes and comments over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <Area type="monotone" dataKey="likes" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Likes" />
                        <Area type="monotone" dataKey="comments" stackId="1" stroke="#6366f1" fill="#6366f1" name="Comments" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {renderInsights()}

              </div>
            )}
            {activeTab === "revenue" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-emerald-400" /> Total Revenue Growth ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Detailed breakdown of your revenue over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 8 }} name="Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6 text-amber-400" /> Conversion Rate ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Understand how many visitors convert into customers.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" domain={[0, 100]} label={{ value: 'Conversion %' , angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                        <Tooltip formatter={(value, name, props) => [`${(value / props.payload.visitors * 100).toFixed(2)}%`, 'Conversion Rate']} contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <Bar dataKey="converted" fill="#f59e0b" name="Converted" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {renderInsights()}
              </div>
            )}
            {activeTab === "engagement" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl lg:col-span-2">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-violet-400" /> Engagement Metrics ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Likes, comments, shares, and saves over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <Area type="monotone" dataKey="likes" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Likes" />
                        <Area type="monotone" dataKey="comments" stackId="1" stroke="#6366f1" fill="#6366f1" name="Comments" />
                        {/* Add more engagement metrics here if available, e.g., shares, saves */}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {renderInsights()}
              </div>
            )}
            {activeTab === "platforms" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <PieIcon className="h-6 w-6 text-blue-400" /> Content Distribution by Platform ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Overview of your content reach across different social media platforms.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {platformDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Add a bar chart for platform specific performance comparison, e.g., views per platform */}
                <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-indigo-400" /> Views Per Platform ({timeframe})
                    </CardTitle>
                    <CardDescription className="text-slate-400">Compare video views across your connected social media platforms.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 p-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <Bar dataKey="value" fill="#6366f1" name="Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {renderInsights()}
              </div>
            )}
          </TabsContent>
        )}
      </div>
    </div>
  );
}
