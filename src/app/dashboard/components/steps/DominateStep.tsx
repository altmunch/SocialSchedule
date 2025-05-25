'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, RocketLaunchIcon, AdjustmentsHorizontalIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { schedulerIntegrationService } from '../../services/SchedulerIntegrationService';
import { Post } from '@/app/dashboard/types';

type PlatformType = 'instagram' | 'tiktok' | 'facebook' | 'linkedin';

const optimizationStrategies = [
  {
    id: 'peak-times',
    name: 'Peak Times',
    description: 'Schedule posts for maximum visibility',
    icon: ChartBarIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'hashtags',
    name: 'Hashtags',
    description: 'Optimize hashtags for better reach',
    icon: AdjustmentsHorizontalIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'boost',
    name: 'Boost',
    description: 'Amplify high-performing content',
    icon: RocketLaunchIcon,
    color: 'bg-green-100 text-green-600',
  },
];

interface DominateStepProps {
  onComplete: () => void;
  platform: PlatformType;
  postContent: string;
  postMetadata?: Record<string, any>;
}

export default function DominateStep({ 
  onComplete, 
  platform, 
  postContent,
  postMetadata = {} 
}: DominateStepProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(['peak-times']);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Array<{start: Date, end: Date, score: number}>>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Load available slots when component mounts
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slots = await schedulerIntegrationService.getAvailableSlots(platform);
        setAvailableSlots(slots);
        if (slots.length > 0) {
          setSelectedSlot(slots[0].start);
        }
      } catch (err) {
        setError('Failed to load available time slots');
        console.error('Error loading slots:', err);
      }
    };
    
    loadSlots();
  }, [platform]);

  const toggleStrategy = (strategyId: string) => {
    setSelectedStrategies(prev =>
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const handleSchedule = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    
    setIsScheduling(true);
    setError(null);
    
    try {
      const postData = {
        content: postContent,
        scheduledTime: selectedSlot,
        metadata: {
          ...postMetadata,
          optimizationStrategies: selectedStrategies,
        },
      };
      
      const postId = await schedulerIntegrationService.schedulePost(postData, platform);
      setScheduleSuccess(true);
      setTimeout(() => onComplete(), 2000); // Move to next step after 2 seconds
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while scheduling the post';
      setError(errorMessage);
      console.error('Scheduling error:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Schedule Your Post</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the best time to publish your content for maximum reach
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {scheduleSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your post has been scheduled successfully.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableSlots.slice(0, 6).map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedSlot(slot.start)}
                className={`relative rounded-lg border ${
                  selectedSlot?.getTime() === slot.start.getTime() 
                    ? 'ring-2 ring-indigo-500 border-transparent' 
                    : 'border-gray-200 hover:border-gray-300'
                } bg-white p-4 text-left transition-all duration-200`}
              >
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(slot.start)}
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        {Math.round(slot.score * 100)}% optimal
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(slot.start)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Optimization Strategies</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {optimizationStrategies.map((strategy) => {
              const isSelected = selectedStrategies.includes(strategy.id);
              const Icon = strategy.icon;
              
              return (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => toggleStrategy(strategy.id)}
                  className={`relative rounded-lg border ${
                    isSelected ? 'ring-2 ring-indigo-500' : 'border-gray-200'
                  } bg-white p-4 shadow-sm text-left focus:outline-none transition-all duration-200 ${
                    isSelected ? 'scale-[1.02]' : 'hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${strategy.color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{strategy.name}</p>
                      <p className="text-xs text-gray-500">{strategy.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute right-4 top-4">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
                        <span className="text-xs font-medium text-white">{selectedStrategies.indexOf(strategy.id) + 1}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedStrategies.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedSlot ? (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                <span>Scheduled for {formatDate(selectedSlot)} at {formatTime(selectedSlot)}</span>
              </div>
            ) : (
              'Select a time slot'
            )}
          </div>
          <button
            type="button"
            onClick={handleSchedule}
            disabled={!selectedSlot || isScheduling || scheduleSuccess}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !selectedSlot || isScheduling || scheduleSuccess
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isScheduling ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scheduling...
              </>
            ) : scheduleSuccess ? (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Scheduled!
              </>
            ) : (
              'Schedule Post'
            )}
          </button>
          {optimizationComplete && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Optimization Applied</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your content has been optimized for better performance.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
