'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Video, Plus, Save, Trash2, Edit, XCircle, CheckCircle2, Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduledPost {
  id: string;
  date: Date;
  time: string; // e.g., "10:30 AM"
  description: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  optimizedVideoId?: string; // Link to an optimized video
  isOptimal?: boolean;
}

interface UnscheduledVideo {
  id: string;
  description: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
}

export default function BlitzPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [unScheduledVideos, setUnScheduledVideos] = useState<UnscheduledVideo[]>([]);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [selectedDatePosts, setSelectedDatePosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedVideoId, setDraggedVideoId] = useState<string | null>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false); // Mock for connect accounts

  // Mock data for initial load
  useEffect(() => {
    // Simulate fetching pre-optimized videos and scheduling them
    const mockOptimizedVideos: UnscheduledVideo[] = [
      { id: 'opt-video-1', description: 'AI Optimized E-commerce Product Launch', platform: 'tiktok' },
      { id: 'opt-video-2', description: 'Deep Dive: Instagram Marketing Strategy', platform: 'instagram' },
      { id: 'opt-video-3', description: 'YouTube Shorts: Boost Engagement', platform: 'youtube' },
      { id: 'opt-video-4', description: 'Viral Content Breakdown', platform: 'tiktok' },
    ];
    setUnScheduledVideos(mockOptimizedVideos);

    const today = new Date();
    const mockPosts: ScheduledPost[] = [
      {
        id: 'post-1',
        date: addMonths(today, 0), // Current month
        time: '10:00 AM',
        description: 'Autumn Collection Sneak Peek',
        platform: 'instagram',
        optimizedVideoId: 'opt-video-1',
        isOptimal: true,
      },
      {
        id: 'post-2',
        date: addMonths(today, 0),
        time: '03:30 PM',
        description: 'Weekly Sales Recap & New Arrivals',
        platform: 'youtube',
        optimizedVideoId: 'opt-video-2',
        isOptimal: false,
      },
      {
        id: 'post-3',
        date: addMonths(today, 0),
        time: '01:00 PM',
        description: 'How to use our new feature!',
        platform: 'tiktok',
        optimizedVideoId: 'opt-video-3',
        isOptimal: true,
      },
      {
        id: 'post-4',
        date: addMonths(today, 1), // Next month
        time: '09:00 AM',
        description: 'Holiday Gifting Guide',
        platform: 'instagram',
        optimizedVideoId: 'opt-video-4',
        isOptimal: true,
      },
    ];
    setScheduledPosts(mockPosts);

    // Simulate checking if accounts are connected
    const accountsConnected = localStorage.getItem('accountsConnected') === 'true'; // Mock
    if (!accountsConnected) {
      setShowConnectPrompt(true);
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getDayPosts = (date: Date) => {
    return scheduledPosts.filter(post => isSameDay(post.date, date));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedDatePosts(getDayPosts(date));
    setShowTimePopup(true);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const onDragStart = (e: React.DragEvent, video: UnscheduledVideo) => {
    e.dataTransfer.setData('videoId', video.id);
    setIsDragging(true);
    setDraggedVideoId(video.id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const onDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const videoId = e.dataTransfer.getData('videoId');
    const droppedVideo = unScheduledVideos.find(v => v.id === videoId);

    if (droppedVideo) {
      const newPost: ScheduledPost = {
        id: `post-${Date.now()}`,
        date: date,
        time: '12:00 PM', // Default time, can be adjusted in popup
        description: droppedVideo.description,
        platform: droppedVideo.platform,
        optimizedVideoId: droppedVideo.id,
        isOptimal: true, // Assume dropped optimized videos have optimal times
      };
      setScheduledPosts(prev => [...prev, newPost]);
      setUnScheduledVideos(prev => prev.filter(v => v.id !== videoId));
    }
    setIsDragging(false);
    setDraggedVideoId(null);
  };

  const handlePostEdit = (postId: string, field: keyof ScheduledPost, value: string | Date) => {
    setScheduledPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, [field]: value } : post
    ));
    setSelectedDatePosts(prev => prev.map(post =>
      post.id === postId ? { ...post, [field]: value } : post
    ));
  };

  const handlePostDelete = (postId: string) => {
    const postToDelete = scheduledPosts.find(p => p.id === postId);
    if (postToDelete?.optimizedVideoId) {
      // If it was an optimized video, return it to unscheduled
      setUnScheduledVideos(prev => [...prev, { id: postToDelete.optimizedVideoId!, description: postToDelete.description, platform: postToDelete.platform }]);
    }
    setScheduledPosts(prev => prev.filter(post => post.id !== postId));
    setSelectedDatePosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleSetConnected = () => {
    localStorage.setItem('accountsConnected', 'true');
    setShowConnectPrompt(false);
  };

  const getPlatformColor = (platform: 'tiktok' | 'instagram' | 'youtube') => {
    switch (platform) {
      case 'tiktok': return 'bg-purple-500/10 text-purple-400';
      case 'instagram': return 'bg-pink-500/10 text-pink-400';
      case 'youtube': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            Autoposting Calendar
          </h1>
          <p className="text-slate-400 text-lg">
            Visually plan and schedule your content across multiple platforms.
          </p>
        </div>

        {/* Connect Accounts Prompt */}
        {showConnectPrompt && (
          <Card className="bg-red-900/20 border border-red-700 p-4 rounded-lg shadow-xl text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <span>Please connect your social media accounts to enable autoposting.</span>
            </div>
            <Button variant="outline" onClick={handleSetConnected} className="text-red-300 border-red-500 hover:bg-red-800">
              Connect Accounts
            </Button>
          </Card>
        )}

        {/* Calendar and Unscheduled Videos Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unscheduled Videos */}
          <Card className="lg:col-span-1 bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-xl">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <Video className="h-6 w-6 text-indigo-400" /> Unscheduled Videos
              </CardTitle>
              <CardDescription className="text-slate-400">Drag these videos onto the calendar to schedule.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
              {unScheduledVideos.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No unscheduled videos.</p>
              ) : (
                unScheduledVideos.map(video => (
                  <div
                    key={video.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, video)}
                    className={`p-3 border rounded-lg bg-gray-700/50 cursor-grab flex items-center gap-3 transition-all ${isDragging && draggedVideoId === video.id ? 'opacity-50 border-indigo-500' : 'border-gray-700 hover:border-indigo-500'}`}
                  >
                    <Video className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">{video.description} ({video.platform})</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <Card className="lg:col-span-3 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
            <CardHeader className="flex flex-row justify-between items-center p-0 mb-4">
              <Button variant="ghost" onClick={handlePrevMonth} className="text-gray-400 hover:text-white">
                &lt; Prev
              </Button>
              <CardTitle className="text-xl font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <Button variant="ghost" onClick={handleNextMonth} className="text-gray-400 hover:text-white">
                Next &gt;
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-400 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const dayPosts = getDayPosts(day);
                  return (
                    <div
                      key={index}
                      className={`h-28 border border-gray-700 rounded-lg p-2 flex flex-col items-start overflow-hidden relative transition-colors ${
                        !isSameMonth(day, currentMonth) ? 'bg-gray-800/50 text-gray-600 border-gray-700' : 'bg-gray-900/50 text-white'
                      } ${
                        isSameDay(day, new Date()) ? 'border-indigo-500 bg-indigo-900/20' : ''
                      } ${
                        isDragging ? 'border-dashed border-indigo-500' : ''
                      }`}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, day)}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className={`text-xs font-semibold ${isSameDay(day, new Date()) ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex-1 w-full mt-1 space-y-1 overflow-y-auto scrollbar-hide">
                        {dayPosts.map(post => (
                          <div key={post.id} className={`px-2 py-1 rounded-md text-xs font-medium truncate ${getPlatformColor(post.platform)}`}>
                            {post.description}
                            {post.isOptimal && <span className="ml-1 text-[8px] px-1 py-0.5 rounded-full bg-emerald-500/50 text-white">AI</span>}
                          </div>
                        ))}
                      </div>
                      {dayPosts.length > 2 && (
                        <div className="absolute bottom-1 right-1 text-[10px] text-slate-500">+{dayPosts.length - 2} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Adjustment Popup */}
        {selectedDate && (
          <Dialog open={showTimePopup} onOpenChange={setShowTimePopup}>
            <DialogContent className="compact-card p-6 max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-indigo-400" /> Schedule for {format(selectedDate, 'PPP')}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Adjust post times and details for this day. Drag and drop to reorder.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                {selectedDatePosts.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No posts scheduled for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDatePosts.map(post => (
                      <div key={post.id} className="p-3 border border-gray-700 rounded-lg bg-gray-900/50 flex items-center gap-3">
                        <Video className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-white">{post.description}</p>
                          <span className={`text-xs font-medium ${getPlatformColor(post.platform)} px-2 py-0.5 rounded-full`}>
                            {post.platform} {post.isOptimal && ' (AI Optimal)'}
                          </span>
                        </div>
                        <Input
                          type="time"
                          value={post.time}
                          onChange={(e) => handlePostEdit(post.id, 'time', e.target.value)}
                          className="w-auto bg-gray-700 border-gray-600 text-white"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handlePostDelete(post.id)} className="text-red-400 hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={() => setShowTimePopup(false)} className="w-full btn-secondary mt-4">
                  <Save className="h-4 w-4 mr-2" /> Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
