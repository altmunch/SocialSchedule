'use client';

import DashboardLayout from '@/app/dashboard/components/DashboardLayout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: true,
    mentions: false,
  });

  const [timezone, setTimezone] = useState('UTC+08:00');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8 max-w-3xl">
          {/* Profile Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" defaultValue="John Doe" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-12:00">(UTC-12:00) International Date Line West</SelectItem>
                    <SelectItem value="UTC-08:00">(UTC-08:00) Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="UTC-07:00">(UTC-07:00) Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="UTC-06:00">(UTC-06:00) Central Time (US & Canada)</SelectItem>
                    <SelectItem value="UTC-05:00">(UTC-05:00) Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="UTC+00:00">(UTC+00:00) London</SelectItem>
                    <SelectItem value="UTC+08:00">(UTC+08:00) Singapore, Hong Kong, Beijing</SelectItem>
                    <SelectItem value="UTC+09:00">(UTC+09:00) Tokyo, Seoul</SelectItem>
                    <SelectItem value="UTC+10:00">(UTC+10:00) Sydney, Melbourne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Button>Save Profile</Button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email notifications</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationChange('push')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-report">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={notifications.weeklyReport}
                  onCheckedChange={() => handleNotificationChange('weeklyReport')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mentions">Mentions</Label>
                  <p className="text-sm text-gray-500">Get notified when mentioned</p>
                </div>
                <Switch
                  id="mentions"
                  checked={notifications.mentions}
                  onCheckedChange={() => handleNotificationChange('mentions')}
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6">Account Actions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-500 mb-3">Download all your data in a ZIP file</p>
                <Button variant="outline">Export My Data</Button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all associated data</p>
                <Button variant="destructive">Delete My Account</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
