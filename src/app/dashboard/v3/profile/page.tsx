'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Bell, Lock, Save, Ban, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
// Assuming useAuth provides user data, similar to other pages
import { useAuth } from '@/providers/AuthProvider'; 

export default function ProfilePage() {
  const { user } = useAuth(); // Mock user data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for Personal Information
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');

  // State for Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // State for Security Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    // Simulate fetching user preferences
    setLoading(true);
    const timer = setTimeout(() => {
      // In a real app, you'd fetch these from a backend
      setFullName(user?.user_metadata?.full_name || 'John Doe');
      setEmail(user?.email || 'john.doe@example.com');
      setEmailNotifications(true);
      setSmsNotifications(false);
      setInAppNotifications(true);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      // Simulate API call to update profile
      console.log('Updating profile:', { fullName, email });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      // Simulate API call to update notifications
      console.log('Updating notifications:', { emailNotifications, smsNotifications, inAppNotifications });
      setMessage({ type: 'success', text: 'Notification settings updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update notifications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setMessage(null);
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      setLoading(false);
      return;
    }

    try {
      await new Promise((res) => setTimeout(res, 1000));
      // Simulate API call to change password
      console.log('Changing password');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            Your Profile
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your personal information, notification preferences, and security settings.
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-700 text-emerald-300' : 'bg-red-900/20 border-red-700 text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Personal Information Card */}
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="h-6 w-6 text-indigo-400" /> Personal Information
            </CardTitle>
            <CardDescription className="text-slate-400">Update your basic account details.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  disabled={loading}
                />
              </div>
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={loading} 
              className="btn-primary flex items-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-violet-400" /> Notification Settings
            </CardTitle>
            <CardDescription className="text-slate-400">Control how you receive alerts and updates.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-slate-300">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={loading}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications" className="text-slate-300">SMS Notifications</Label>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                disabled={loading}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="in-app-notifications" className="text-slate-300">In-App Notifications</Label>
              <Switch
                id="in-app-notifications"
                checked={inAppNotifications}
                onCheckedChange={setInAppNotifications}
                disabled={loading}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
            <Button 
              onClick={handleUpdateNotifications} 
              disabled={loading} 
              className="btn-primary flex items-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Saving..." : "Save Notifications"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Lock className="h-6 w-6 text-blue-400" /> Security
            </CardTitle>
            <CardDescription className="text-slate-400">Manage your account security and password.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-300">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="text-slate-300">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={loading} 
              className="btn-primary flex items-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Optional: Delete Account Section */}
        <Card className="bg-red-900/10 border border-red-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-red-400 flex items-center gap-2">
              <Ban className="h-6 w-6 text-red-400" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-red-300">Proceed with caution: These actions are irreversible.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Button 
              variant="destructive" 
              onClick={() => alert('Simulating account deletion...')}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
