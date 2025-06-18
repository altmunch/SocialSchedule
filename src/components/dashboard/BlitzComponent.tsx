'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Instagram, Twitter, Facebook, Linkedin, Loader2, CheckCircle2, Video, Image, Type, Star, GripVertical, Sparkles, TrendingUp, Zap, X } from 'lucide-react';

type ScheduledPost = {
  id: string;
  content: string;
  platform: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: 'scheduled' | 'posted' | 'failed';
  type: 'video' | 'image' | 'carousel' | 'text';
  thumbnail?: string;
  isOptimalTime?: boolean;
};

type CalendarPost = {
  id: string;
  content: string;
  type: 'video' | 'image' | 'carousel' | 'text';
  platform: string;
  time: string;
  status: 'scheduled' | 'posted' | 'failed';
  isOptimalTime?: boolean;
};

export default function BlitzComponent() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedPostType, setSelectedPostType] = useState<'video' | 'image' | 'carousel' | 'text'>('text');
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // TODO: Replace with actual fetching of scheduled posts and calendar data from a database/API.
  // Mock calendar posts data
  const [calendarPosts, setCalendarPosts] = useState<{ [key: string]: CalendarPost[] }>({});
  
  // Optimal posting times by platform
  // TODO: Consider dynamically generating these optimal times based on user's historical data via AI analysis.
  const optimalTimes = {
    instagram: ['09:00', '15:00', '18:00'],
    tiktok: ['14:00', '18:00', '21:00'],
    twitter: ['09:00', '12:00', '15:00'],
    facebook: ['13:00', '15:00', '18:00'],
    linkedin: ['08:00', '12:00', '17:00'],
  };

  // Polling for post status updates
  useEffect(() => {
    // TODO: Replace with real-time updates from a backend or websocket for post status.
    const interval = setInterval(() => {
      setScheduledPosts(prevPosts => prevPosts.map(post => {
        // This is a simulation. In a real app, you'd fetch actual status from backend.
        if (post.status === 'scheduled') {
          // Simulate posting after some time
          if (Date.now() - Number(post.id) > 5000) { // Example: post 'completes' after 5 seconds
            return { ...post, status: 'posted' };
          }
        }
        return post;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
  };

  const handleSchedule = async () => {
    if (!content.trim()) {
      setError('Please enter content to schedule');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsScheduling(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        content,
        platform: selectedPlatform,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        status: 'scheduled',
        type: selectedPostType,
        isOptimalTime: optimalTimes[selectedPlatform as keyof typeof optimalTimes]?.includes(selectedTime) || false
      };
      
      setScheduledPosts(prev => [newPost, ...prev]);
      setSuccessMessage('Post scheduled successfully');
      setContent('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while scheduling the post');
    } finally {
      setIsScheduling(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform as keyof typeof platformIcons] || Instagram;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPostTypeIcon = (type: 'video' | 'image' | 'carousel' | 'text') => {
    const icons = {
      video: Video,
      image: Image,
      carousel: Image,
      text: Type,
    };
    const IconComponent = icons[type];
    return <IconComponent className="h-3 w-3" />;
  };

  const getPostTypeColor = (type: 'video' | 'image' | 'carousel' | 'text') => {
    const colors = {
      video: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      image: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      carousel: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      text: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    };
    return colors[type];
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  const getPostsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return calendarPosts[dateKey] || [];
  };

  return (
    <div className="single-view">
      
      {/* Compact Header */}
      <div className={`single-view-header fade-in ${0 >= 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
              <div>
            <h1 className="text-dynamic-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Blitz Autoposting
            </h1>
            <p className="text-dynamic-base text-gray-400 mt-1">Schedule and autopost your content at optimal times with AI-powered timing intelligence</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="btn-primary"
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
          
      {/* Main Content Grid */}
      <div className="single-view-content grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Schedule */}
        <div className={`slide-up ${0 >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-dynamic-lg font-semibold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-400" />
                Quick Schedule
              </h2>
              <p className="text-dynamic-sm text-gray-400">Schedule a new post with optimal timing suggestions</p>
            </div>
            
            <div className="space-y-6">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Content Type</label>
                <Select value={selectedPostType} onValueChange={(value: any) => setSelectedPostType(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="video">📹 Video</SelectItem>
                    <SelectItem value="image">🖼️ Image</SelectItem>
                    <SelectItem value="carousel">📱 Carousel</SelectItem>
                    <SelectItem value="text">📝 Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Object.keys(platformIcons).map(platform => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2 capitalize">
                          {getPlatformIcon(platform)} {platform}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white ${!selectedDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="rounded-md border bg-gray-800/50 border-gray-700/50"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Time</label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {selectedDate && optimalTimes[selectedPlatform as keyof typeof optimalTimes]?.includes(selectedTime) && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" /> Optimal time for {selectedPlatform}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Content</label>
              <Textarea
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            
            <div>
              <Button 
                onClick={handleSchedule}
                disabled={isScheduling}
                className="btn-primary flex items-center gap-2 w-full"
              >
                {isScheduling ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Scheduling...</>
                ) : (
                  <><Zap className="h-5 w-5" /> Schedule Post</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar and Upcoming Posts */}
        <div className={`slide-up ${0 >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="md:col-span-1">
              <div className="compact-card p-6 flex flex-col items-center">
                <h2 className="text-dynamic-lg font-semibold text-white mb-4">Post Calendar</h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border bg-gray-800/50 border-gray-700/50"
                />
              </div>
            </div>

            {/* Upcoming Posts */}
            <div className="md:col-span-1">
              <div className="compact-card p-6 flex flex-col h-full">
                <h2 className="text-dynamic-lg font-semibold text-white mb-4">Upcoming Posts</h2>
                {scheduledPosts.filter(post => post.status === 'scheduled').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4" />
                    <p>No upcoming posts scheduled.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {scheduledPosts
                      .filter(post => post.status === 'scheduled')
                      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
                      .map(post => (
                        <li key={post.id} className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">{post.content.substring(0, 70)}{post.content.length > 70 ? '...' : ''}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{format(post.scheduledDate, 'MMM dd, yyyy')} at {post.scheduledTime}</span>
                              {post.isOptimalTime && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Optimal Time
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400">
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All Scheduled Posts */}
        <div className={`slide-up ${0 >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card p-6">
            <h2 className="text-dynamic-lg font-semibold text-white mb-4">All Scheduled Posts</h2>
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700 mb-4">
                <TabsTrigger value="current" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300">Current</TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="current" className="space-y-4">
                {scheduledPosts.filter(post => post.status === 'scheduled').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4" />
                    <p>No current scheduled posts.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {scheduledPosts
                      .filter(post => post.status === 'scheduled')
                      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
                      .map(post => (
                        <li key={post.id} className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          {post.thumbnail && (
                            <img src={post.thumbnail} alt="Post Thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                          )}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">{post.content.substring(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{format(post.scheduledDate, 'MMM dd, yyyy')} at {post.scheduledTime}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPostTypeColor(post.type)}`}>
                                {post.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="past" className="space-y-4">
                {scheduledPosts.filter(post => post.status === 'posted' || post.status === 'failed').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4" />
                    <p>No past scheduled posts.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {scheduledPosts
                      .filter(post => post.status === 'posted' || post.status === 'failed')
                      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())
                      .map(post => (
                        <li key={post.id} className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          {post.thumbnail && (
                            <img src={post.thumbnail} alt="Post Thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                          )}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">{post.content.substring(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{format(post.scheduledDate, 'MMM dd, yyyy')} at {post.scheduledTime}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPostTypeColor(post.type)}`}>
                                {post.type}
                              </span>
                              {post.status === 'failed' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                  Failed
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* New Heatmap Section */}
        <div className={`slide-up ${0 >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-dynamic-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Optimal Posting Times Heatmap
              </h2>
              <p className="text-dynamic-sm text-gray-400">Optimal posting times based on your audience engagement patterns</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-1 text-dynamic-sm" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
                <div className="col-span-1"></div> {/* Empty corner for alignment */}
                {[...Array(24)].map((_, hour) => (
                  <div key={hour} className="text-center text-gray-500 font-semibold text-xs">
                    {hour < 10 ? `0${hour}` : hour}
                  </div>
                ))}
              </div>
              
              {Object.entries(optimalTimes).map(([platform, times]) => (
                <div key={platform} className="grid gap-1 items-center" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
                  <div className="text-xs text-gray-400 capitalize flex items-center gap-1">
                    {getPlatformIcon(platform)} {platform}
                  </div>
                  {[...Array(24)].map((_, hour) => {
                    const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
                    const isOptimal = times.includes(hourStr.substring(0, 5));
                    const intensity = isOptimal ? 3 : 1;
                    const bgColor = getHeatmapColor(intensity);
                    return (
                      <div 
                        key={hour}
                        className={`h-6 rounded-sm ${bgColor} ${isOptimal ? 'border border-emerald-400/30' : 'border-transparent'}`}
                        title={`${platform} - ${hourStr}: ${isOptimal ? 'Optimal' : 'Regular'}`}
                      >
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
