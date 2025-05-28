'use client';

import DashboardLayout from '@/app/dashboard/components/DashboardLayout';
import { useState } from 'react';
import { Calendar, BarChart, PieChart, Users, ArrowUp, ArrowDown } from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { name: 'Total Followers', value: '24.5K', change: '+12%', changeType: 'increase' },
    { name: 'Engagement Rate', value: '4.8%', change: '+0.8%', changeType: 'increase' },
    { name: 'Impressions', value: '156K', change: '+32%', changeType: 'increase' },
    { name: 'Profile Visits', value: '8.2K', change: '-2%', changeType: 'decrease' },
  ];

  const topPosts = [
    { id: 1, title: 'Morning Coffee ☕️', engagement: '8.2K', reach: '24.5K', saves: '1.2K' },
    { id: 2, title: 'Behind the Scenes', engagement: '7.8K', reach: '21.1K', saves: '980' },
    { id: 3, title: 'New Product Launch', engagement: '6.5K', reach: '18.7K', saves: '1.5K' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-gray-600">Track your social media performance</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
            {['7d', '30d', '90d', '12m'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  timeRange === range ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
            <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { name: 'Overview', id: 'overview' },
              { name: 'Audience', id: 'audience' },
              { name: 'Content', id: 'content' },
              { name: 'Activity', id: 'activity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Engagement Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Engagement</h2>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <BarChart className="h-12 w-12 text-gray-300" />
              <p className="ml-2 text-gray-400">Engagement chart will appear here</p>
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-6">Audience Demographics</h2>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <Users className="h-12 w-12 text-gray-300" />
              <p className="ml-2 text-gray-400">Audience data will appear here</p>
            </div>
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-6">Top Performing Posts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reach
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saves
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{post.engagement}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{post.reach}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{post.saves}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
