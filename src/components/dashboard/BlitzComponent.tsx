'use client';

import { useState, useEffect } from 'react';
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
    <div className="space-y-6 bg-background text-text min-h-screen p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-creative">Blitz</h1>
        <p className="text-secondaryText">Autopost your marketing at optimal times</p>
      </div>
      <div className="bg-panel rounded-lg p-6 shadow-md border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg text-creative">Autopost your marketing</span>
            <div className="flex gap-2 ml-4">
              <Button variant="ghost" className="px-4 py-1 rounded-full text-creative border border-creative bg-background hover:bg-highlight hover:text-white">Week</Button>
              <Button variant="ghost" className="px-4 py-1 rounded-full text-creative border border-creative bg-background hover:bg-highlight hover:text-white">Month</Button>
            </div>
          </div>
          <Button className="bg-primary text-black hover:bg-creative hover:text-white">Next</Button>
        </div>
        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 border-t border-l border-border">
            <div className="bg-panel"></div>
            {["Mon","Tues","Wed","Thurs","Fri","Sat","Sun"].map(day => (
              <div key={day} className="text-center py-2 px-4 font-semibold text-secondaryText border-b border-r border-border bg-panel">{day}</div>
            ))}
            {[1,2,3,4,5].map(row => (
              <>
                <div className="text-secondaryText text-center py-2 px-2 border-b border-r border-border bg-panel">{row}</div>
                {Array(7).fill(0).map((_, colIdx) => (
                  <div key={colIdx} className="h-20 border-b border-r border-border bg-background hover:bg-highlight/30 transition-colors flex items-center justify-center cursor-pointer">
                    {/* Placeholder for drag-and-drop post slot */}
                    <span className="text-xs text-secondaryText">{row === 1 && colIdx < 3 ? `Pillar ${colIdx+1}` : ''}</span>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="text-xs text-secondaryText mt-2">All pairings are optional already when user first sees the page.</div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Scheduled Posts</h3>
          <ul className="space-y-2">
            {scheduledPosts.map(post => (
              <li key={post.id} className="flex items-center gap-4 p-2 border rounded-md">
                <span className="font-medium">{post.content}</span>
                <span className="text-xs text-secondaryText">{post.platform}</span>
                <span className="text-xs text-secondaryText">{format(post.scheduledDate, 'MMM d, yyyy')} {post.scheduledTime}</span>
                <span className={`text-xs font-bold ${post.status === 'posted' ? 'text-green-600' : post.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>{post.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
