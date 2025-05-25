'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LightningBoltIcon, ClockIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { SchedulerIntegrationService } from '../../services/SchedulerService';

type PlatformType = 'instagram' | 'tiktok' | 'facebook' | 'linkedin';

interface ScheduledPost {
  id: string;
  content: string;
  platform: PlatformType;
  scheduledTime: Date;
  status: 'scheduled' | 'posted' | 'failed';
  metrics?: {
    reach?: number;
    engagement?: number;
  };
}

export default function BlitzPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('instagram');
  const [isScheduling, setIsScheduling] = useState(false);

  // Load scheduled posts on component mount
  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch from your API
      // const posts = await schedulerIntegrationService.getScheduledPosts(selectedPlatform);
      // setScheduledPosts(posts);
      
      // Mock data for now
      setScheduledPosts([
        {
          id: '1',
          content: 'Check out our new product launch! #excited',
          platform: 'instagram',
          scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
          status: 'scheduled'
        }
      ]);
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePost = async (content: string, platform: PlatformType, scheduledTime: Date) => {
    try {
      setIsScheduling(true);
      // In a real implementation:
      // await schedulerIntegrationService.schedulePost({
      //   content,
      //   platform,
      //   scheduledTime,
      //   metadata: {}
      // }, platform);
      
      // For now, just add to local state
      const newPost: ScheduledPost = {
        id: `post-${Date.now()}`,
        content,
        platform,
        scheduledTime,
        status: 'scheduled'
      };
      
      setScheduledPosts(prev => [...prev, newPost]);
      return { success: true };
    } catch (error) {
      console.error('Failed to schedule post:', error);
      return { success: false, error: 'Failed to schedule post' };
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePostNow = async (postId: string) => {
    try {
      // In a real implementation:
      // await schedulerIntegrationService.postNow(postId);
      
      // Update local state
      setScheduledPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, status: 'posted', scheduledTime: new Date() } 
            : post
        )
      );
    } catch (error) {
      console.error('Failed to post now:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // In a real implementation:
      // await schedulerIntegrationService.cancelPost(postId);
      
      // Update local state
      setScheduledPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <LightningBoltIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blitz Scheduler</h1>
          <p className="text-lg text-gray-600">
            Automate your social media posts and reach your audience at the perfect time
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule New Post</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                id="platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as PlatformType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="What's on your mind?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="time"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isScheduling}
                onClick={async () => {
                  const contentEl = document.getElementById('content') as HTMLTextAreaElement;
                  const dateEl = document.getElementById('date') as HTMLInputElement;
                  const timeEl = document.getElementById('time') as HTMLInputElement;
                  
                  const content = contentEl.value.trim();
                  if (!content) {
                    alert('Please enter some content');
                    return;
                  }
                  
                  const date = new Date(`${dateEl.value}T${timeEl.value}`);
                  if (isNaN(date.getTime())) {
                    alert('Please select a valid date and time');
                    return;
                  }
                  
                  const result = await handleSchedulePost(content, selectedPlatform, date);
                  if (result.success) {
                    contentEl.value = '';
                    // Reset to current date/time
                    const now = new Date();
                    dateEl.value = now.toISOString().split('T')[0];
                    timeEl.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  }
                }}
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Scheduled Posts</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading scheduled posts...
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No scheduled posts. Schedule your first post above!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {scheduledPosts.map((post) => (
                <li key={post.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ClockIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {post.content}
                          </p>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>Scheduled for {post.scheduledTime.toLocaleString()}</span>
                            {post.status === 'posted' && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Posted
                              </span>
                            )}
                            {post.status === 'failed' && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Failed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      {post.status === 'scheduled' && (
                        <>
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => handlePostNow(post.id)}
                          >
                            Post Now
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {post.status === 'posted' && post.metrics && (
                        <div className="flex items-center text-sm text-gray-500">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          <span>{post.metrics.reach?.toLocaleString() || '0'} reach</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
