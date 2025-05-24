'use client';

import { useState } from 'react';
import { ArrowPathIcon, ChartBarIcon, LightBulbIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const insights = [
  {
    id: 'performance',
    title: 'Performance Metrics',
    description: 'View detailed analytics on your recent posts',
    icon: ChartBarIcon,
    stats: '+24%',
    trend: 'increase',
  },
  {
    id: 'suggestions',
    title: 'Content Suggestions',
    description: 'Get recommendations for your next posts',
    icon: LightBulbIcon,
    stats: '5 new',
    trend: 'suggestions',
  },
  {
    id: 'schedule',
    title: 'Upcoming Schedule',
    description: 'Review your scheduled content',
    icon: DocumentTextIcon,
    stats: '3 posts',
    trend: 'scheduled',
  },
];

interface RepeatStepProps {
  onComplete: () => void;
}

export default function RepeatStep({ onComplete }: RepeatStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      onComplete(); // Trigger completion callback
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analyze & Repeat</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review performance and optimize your strategy
          </p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || analysisComplete}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Analyzing...
            </>
          ) : analysisComplete ? (
            'Analysis Complete!'
          ) : (
            'Analyze Results'
          )}
        </button>
      </div>

      {analysisComplete ? (
        <div className="space-y-6">
          <div className="rounded-lg bg-indigo-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <LightBulbIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">Analysis Complete</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>Your content performance has been analyzed. Here are the key insights:</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="relative rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-indigo-100 p-2 text-indigo-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href="#" className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-500 truncate">{insight.description}</p>
                      <p className="text-xs font-medium text-indigo-600 mt-1">
                        {insight.stats} {insight.trend === 'increase' ? '↑' : insight.trend === 'decrease' ? '↓' : ''}
                      </p>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <LightBulbIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Ready for your next campaign?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Start a new campaign to continue growing your audience and engagement.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start New Campaign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Click "Analyze Results" to review your campaign performance.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
