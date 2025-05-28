'use client';

import { useState } from 'react';
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Instagram, Twitter, Facebook, Linkedin, Loader2, CheckCircle2 } from 'lucide-react';

type ScheduledPost = {
  id: string;
  content: string;
  platform: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: 'scheduled' | 'posted' | 'failed';
};

export default function BlitzComponent() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

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
      // In a real implementation, this would connect to a scheduling service
      // For demo purposes, we'll simulate a successful schedule after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new scheduled post
      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        content,
        platform: selectedPlatform,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        status: 'scheduled',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blitz</h1>
        <p className="text-gray-500">Schedule posts at optimal times for visibility</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Schedule Post</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule a New Post</CardTitle>
              <CardDescription>
                Create and schedule your content for the optimal posting time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="platform" className="text-sm font-medium">
                    Platform
                  </label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger id="platform" className="w-full">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="twitter">
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </div>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <div className="flex items-center">
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Post Content
                  </label>
                  <Textarea
                    id="content"
                    placeholder="What do you want to share?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium">
                      Time
                    </label>
                    <div className="flex">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        <Input
                          id="time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="border-0 p-0 focus-visible:ring-0"
                        />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSchedule} 
                disabled={isScheduling} 
                className="w-full"
              >
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
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
              <CardDescription>
                Manage your scheduled content across platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No scheduled posts yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => document.querySelector('[value="schedule"]')?.dispatchEvent(new Event('click'))}
                  >
                    Schedule Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="border rounded-md p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-md bg-gray-100">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{post.platform}</p>
                            <p className="text-xs text-gray-500">
                              {format(post.scheduledDate, 'MMM d, yyyy')} at {post.scheduledTime}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Scheduled
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
