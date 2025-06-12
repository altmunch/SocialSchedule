'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Instagram, Twitter, Facebook, Linkedin, Loader2, CheckCircle2, Video, Image, Type, Star, GripVertical } from 'lucide-react';

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
  
  // Mock calendar posts data
  const [calendarPosts, setCalendarPosts] = useState<{ [key: string]: CalendarPost[] }>({
    '2025-01-13': [
      { id: '1', content: 'Morning motivation post', type: 'image', platform: 'instagram', time: '09:00', status: 'scheduled', isOptimalTime: true },
      { id: '2', content: 'Product demo video', type: 'video', platform: 'tiktok', time: '15:00', status: 'scheduled', isOptimalTime: true },
    ],
    '2025-01-14': [
      { id: '3', content: 'Behind the scenes', type: 'carousel', platform: 'instagram', time: '12:00', status: 'posted' },
    ],
    '2025-01-15': [
      { id: '4', content: 'Tips and tricks', type: 'text', platform: 'twitter', time: '18:00', status: 'scheduled', isOptimalTime: true },
    ],
  });
  
  // Optimal posting times by platform
  const optimalTimes = {
    instagram: ['09:00', '15:00', '18:00'],
    tiktok: ['14:00', '18:00', '21:00'],
    twitter: ['09:00', '12:00', '15:00'],
    facebook: ['13:00', '15:00', '18:00'],
    linkedin: ['08:00', '12:00', '17:00'],
  };

  // Polling for post status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      setScheduledPosts(prevPosts => prevPosts.map(post => {
        if (post.status === 'scheduled') {
          // Simulate status update: after 5 seconds, mark as 'posted'
          if (Date.now() - Number(post.id) > 5000) {
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
      // Simulate scheduling via autopost workflow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new scheduled post
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
      carousel: Image, // Using Image as placeholder for carousel
      text: Type,
    };
    const IconComponent = icons[type];
    return <IconComponent className="h-3 w-3" />;
  };

  const getPostTypeColor = (type: 'video' | 'image' | 'carousel' | 'text') => {
    const colors = {
      video: 'bg-mint/20 border-mint text-mint',
      image: 'bg-lavender/20 border-lavender text-lavender',
      carousel: 'bg-coral/20 border-coral text-coral',
      text: 'bg-info/20 border-info text-info',
    };
    return colors[type];
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  const getPostsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return calendarPosts[dateKey] || [];
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">Blitz</h1>
        <p className="text-muted-foreground mt-1">Schedule and autopost your content at optimal times</p>
      </div>

      {/* Calendar View - Now moved above Quick Schedule */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-creative">Content Calendar</CardTitle>
              <CardDescription>Drag and drop to reschedule posts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Week
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week View Calendar */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Calendar Header */}
              <div className="grid grid-cols-8 gap-0 border border-border rounded-t-lg overflow-hidden">
                <div className="bg-muted/50 p-3 text-center text-sm font-medium">Time</div>
                {getWeekDays().map((day, index) => (
                  <div key={index} className="bg-muted/50 p-3 text-center border-l border-border">
                    <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                    <div className="text-xs text-muted-foreground">{format(day, 'MMM d')}</div>
                  </div>
                ))}
              </div>
              
              {/* Calendar Body */}
              <div className="border-l border-r border-b border-border rounded-b-lg overflow-hidden">
                {['09:00', '12:00', '15:00', '18:00', '21:00'].map((time) => (
                  <div key={time} className="grid grid-cols-8 gap-0 min-h-[80px] border-b border-border last:border-b-0">
                    <div className="bg-muted/20 p-3 text-sm font-medium border-r border-border flex items-center justify-center">
                      {time}
                    </div>
                    {getWeekDays().map((day, dayIndex) => {
                      const posts = getPostsForDate(day).filter(post => post.time === time);
                      const isOptimalSlot = Object.values(optimalTimes).some(times => times.includes(time));
                      return (
                        <div 
                          key={dayIndex} 
                          className={`p-2 border-r border-border last:border-r-0 transition-colors hover:bg-muted/30 ${
                            isOptimalSlot ? 'bg-mint/5' : ''
                          }`}
                        >
                          {isOptimalSlot && posts.length === 0 && (
                            <div className="h-full flex items-center justify-center opacity-30">
                              <Star className="h-4 w-4 text-mint" />
                            </div>
                          )}
                          <div className="space-y-1">
                            {posts.map((post) => (
                              <div 
                                key={post.id}
                                className={`p-2 rounded-lg border text-xs cursor-move ${getPostTypeColor(post.type)} ${
                                  post.isOptimalTime ? 'ring-1 ring-mint' : ''
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  {getPostTypeIcon(post.type)}
                                  {getPlatformIcon(post.platform)}
                                  {post.isOptimalTime && <Star className="h-2 w-2 text-mint" />}
                                  <GripVertical className="h-3 w-3 ml-auto opacity-50" />
                                </div>
                                <div className="font-medium truncate">{post.content}</div>
                                <div className={`text-xs font-medium ${
                                  post.status === 'posted' ? 'text-mint' : 
                                  post.status === 'failed' ? 'text-coral' : 'text-info'
                                }`}>
                                  {post.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border bg-mint/20 border-mint"></div>
              <span>Video</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border bg-lavender/20 border-lavender"></div>
              <span>Image</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border bg-coral/20 border-coral"></div>
              <span>Carousel</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border bg-info/20 border-info"></div>
              <span>Text</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-mint" />
              <span>Optimal time</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Post Scheduling Card - Now moved below Calendar */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-creative">Quick Schedule</CardTitle>
          <CardDescription>Schedule a new post with optimal timing suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="border-mint/20 bg-mint/5">
              <CheckCircle2 className="h-4 w-4 text-mint" />
              <AlertDescription className="text-mint">{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select value={selectedPostType} onValueChange={(value: any) => setSelectedPostType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">📹 Video</SelectItem>
                  <SelectItem value="image">🖼️ Image</SelectItem>
                  <SelectItem value="carousel">📱 Carousel</SelectItem>
                  <SelectItem value="text">📝 Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter</SelectItem>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {['09:00', '12:00', '15:00', '18:00', '21:00'].map(time => (
                    <SelectItem key={time} value={time}>
                      {time} {optimalTimes[selectedPlatform as keyof typeof optimalTimes]?.includes(time) && 
                        <span className="text-mint">⭐</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {optimalTimes[selectedPlatform as keyof typeof optimalTimes]?.includes(selectedTime) && (
                <p className="text-xs text-mint flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Optimal posting time
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'MMM dd') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea 
              placeholder="What's your post about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSchedule} disabled={isScheduling} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isScheduling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Post'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Posting Performance Heatmap */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-creative">Posting Performance Heatmap</CardTitle>
          <CardDescription>Optimal posting times based on your audience engagement patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Hours grid */}
            <div className="grid gap-1 text-xs" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
              <div></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-center text-muted-foreground font-mono">
                  {i.toString().padStart(2, '0')}
                </div>
              ))}
              
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  <div className="text-right text-muted-foreground pr-2">{day}</div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    // Mock engagement data - higher values during typical peak hours
                    const isPeak = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21);
                    const isWeekend = dayIndex >= 5;
                    const engagement = isPeak ? (isWeekend ? 0.6 : 0.8) : (Math.random() * 0.4);
                    
                    const getHeatmapColor = (value: number) => {
                      if (value > 0.7) return 'bg-mint text-white';
                      if (value > 0.5) return 'bg-mint/70 text-white';
                      if (value > 0.3) return 'bg-mint/40';
                      if (value > 0.1) return 'bg-mint/20';
                      return 'bg-muted';
                    };

                    return (
                      <div
                        key={hour}
                        className={`h-4 w-4 rounded-sm cursor-pointer transition-all hover:scale-110 ${getHeatmapColor(engagement)}`}
                        title={`${day} ${hour}:00 - ${Math.round(engagement * 100)}% engagement`}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Low</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-muted rounded-sm"></div>
                  <div className="w-3 h-3 bg-mint/20 rounded-sm"></div>
                  <div className="w-3 h-3 bg-mint/40 rounded-sm"></div>
                  <div className="w-3 h-3 bg-mint/70 rounded-sm"></div>
                  <div className="w-3 h-3 bg-mint rounded-sm"></div>
                </div>
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Hover for details
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scheduled Posts */}
      {scheduledPosts.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-creative">Recent Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduledPosts.slice(0, 5).map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded border ${getPostTypeColor(post.type)}`}>
                      {getPostTypeIcon(post.type)}
                    </div>
                    <div>
                      <div className="font-medium">{post.content}</div>
                      <div className="text-xs text-muted-foreground">
                        {getPlatformIcon(post.platform)} {post.platform} • {format(post.scheduledDate, 'MMM d')} at {post.scheduledTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isOptimalTime && <Star className="h-3 w-3 text-mint" />}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      post.status === 'posted' ? 'bg-mint/20 text-mint' : 
                      post.status === 'failed' ? 'bg-coral/20 text-coral' : 'bg-info/20 text-info'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
