'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Input 
} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Bell, Mail, User, Shield, Globe, Save, Loader2, CheckCircle2, Languages, Clock, Palette, Lightbulb, Phone, Speech, Sparkles, Database } from 'lucide-react';

export default function SettingsComponent() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC-5');
  const [theme, setTheme] = useState('dark');
  const [contentTone, setContentTone] = useState('professional');
  const [aiCreativity, setAiCreativity] = useState([50]);
  const [dataRetention, setDataRetention] = useState('1 year');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const stages = [0, 1, 2, 3];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 300);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    // Simulate API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving settings...', {
      notificationsEnabled, emailNotifications, smsNotifications,
      language, timezone, theme, contentTone, aiCreativity: aiCreativity[0],
      dataRetention
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* Compact Header */}
      <div className="text-center mb-8 fade-in opacity-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-lg text-gray-400 mt-2 max-w-3xl mx-auto">
          Manage your account and app preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">

        {/* General Settings */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 slide-up opacity-100">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <User className="h-7 w-7 text-violet-400" />
            General
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="language" className="text-md font-medium text-gray-300 flex items-center gap-2 mb-2">
                <Languages className="h-5 w-5 text-emerald-400" /> Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-violet-500">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md shadow-lg">
                  <SelectItem value="en" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">English</SelectItem>
                  <SelectItem value="es" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">Spanish</SelectItem>
                  <SelectItem value="fr" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="timezone" className="text-md font-medium text-gray-300 flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-400" /> Timezone
              </label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-violet-500">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md shadow-lg">
                  <SelectItem value="UTC-5" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">UTC-5 (Eastern Time)</SelectItem>
                  <SelectItem value="UTC-8" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">UTC-8 (Pacific Time)</SelectItem>
                  <SelectItem value="UTC+0" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">UTC+0 (Greenwich Mean Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="theme" className="text-md font-medium text-gray-300 flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-blue-400" /> Theme
              </label>
              <RadioGroup value={theme} onValueChange={setTheme} className="mt-2 flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" className="h-5 w-5 text-violet-400 border-gray-500 focus:ring-violet-500" />
                  <Label htmlFor="theme-dark" className="text-md text-gray-300">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" className="h-5 w-5 text-violet-400 border-gray-500 focus:ring-violet-500" />
                  <Label htmlFor="theme-light" className="text-md text-gray-300">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" className="h-5 w-5 text-violet-400 border-gray-500 focus:ring-violet-500" />
                  <Label htmlFor="theme-system" className="text-md text-gray-300">System</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 slide-up opacity-100">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Bell className="h-7 w-7 text-emerald-400" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
              <Label htmlFor="notifications-enabled" className="text-md font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <Bell className="h-5 w-5 text-emerald-400" /> Enable All Notifications
              </Label>
              <Switch
                id="notifications-enabled"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-600"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
              <Label htmlFor="email-notifications" className="text-md font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <Mail className="h-5 w-5 text-blue-400" /> Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={!notificationsEnabled}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
              <Label htmlFor="sms-notifications" className="text-md font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <Phone className="h-5 w-5 text-purple-400" /> SMS Notifications
              </Label>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                disabled={!notificationsEnabled}
                className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-600"
              />
            </div>
          </div>
        </div>

        {/* AI Content Settings */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 slide-up opacity-100">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-orange-400" />
            AI Content
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="content-tone" className="text-md font-medium text-gray-300 flex items-center gap-2 mb-2">
                <Speech className="h-5 w-5 text-orange-400" /> Content Tone
              </label>
              <Select value={contentTone} onValueChange={setContentTone}>
                <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-orange-500">
                  <SelectValue placeholder="Select content tone" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md shadow-lg">
                  <SelectItem value="professional" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">Professional</SelectItem>
                  <SelectItem value="casual" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">Casual</SelectItem>
                  <SelectItem value="witty" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">Witty</SelectItem>
                  <SelectItem value="authoritative" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ai-creativity" className="text-md font-medium text-gray-300 flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-pink-400" /> AI Creativity Level: {aiCreativity[0]}%
              </Label>
              <Slider
                id="ai-creativity"
                defaultValue={[50]}
                max={100}
                step={1}
                value={aiCreativity}
                onValueChange={setAiCreativity}
                className="mt-2 w-full"
                trackClassName="relative w-full h-2 rounded-full bg-gray-600"
                rangeClassName="absolute h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                thumbClassName="block w-5 h-5 rounded-full border-2 border-pink-500 bg-white shadow-md transition-transform duration-100 ease-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              />
            </div>
          </div>
        </div>

        {/* Data & Privacy Settings */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 slide-up opacity-100">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Shield className="h-7 w-7 text-violet-400" />
            Data & Privacy
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="data-retention" className="text-md font-medium text-gray-300 flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-violet-400" /> Data Retention Period
              </label>
              <Select value={dataRetention} onValueChange={setDataRetention}>
                <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-violet-500">
                  <SelectValue placeholder="Select data retention period" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white rounded-md shadow-lg">
                  <SelectItem value="6 months" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">6 Months</SelectItem>
                  <SelectItem value="1 year" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">1 Year</SelectItem>
                  <SelectItem value="3 years" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">3 Years</SelectItem>
                  <SelectItem value="5 years" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">5 Years</SelectItem>
                  <SelectItem value="forever" className="hover:bg-gray-600 cursor-pointer p-2 rounded-md">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="w-full py-3 px-6 rounded-md text-lg font-semibold transition-all duration-300
                           bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500
                           flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {saved && <CheckCircle2 className="mr-2 h-5 w-5" />}
                {saved ? 'Settings Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
