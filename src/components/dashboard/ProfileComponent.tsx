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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Mail, User, Phone, MapPin, Globe, Briefcase, Plus, Save, Award, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileComponent() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [address, setAddress] = useState(user?.user_metadata?.address || '');
  const [website, setWebsite] = useState(user?.user_metadata?.website || '');
  const [industry, setIndustry] = useState(user?.user_metadata?.industry || '');
  const [company, setCompany] = useState(user?.user_metadata?.company || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, you would update the user profile in your database/auth system
    console.log('Saving profile...', { fullName, email, bio, phone, address, website, industry, company, avatarUrl });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        // In a real app, you would upload this file to storage (e.g., Supabase Storage) and get a URL
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="single-view">
      
      {/* Compact Header */}
      <div className={`single-view-header fade-in ${animationStage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center space-y-2">
          <h1 className="text-dynamic-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
            User Profile
          </h1>
          <p className="text-dynamic-base text-gray-400 max-w-3xl mx-auto">
            Manage your personal and business information
          </p>
        </div>
      </div>

      {/* Profile Form Grid */}
      <div className="single-view-content grid grid-cols-12 gap-4">
        
        {/* Profile Picture and Basic Info */}
        <div className={`col-span-12 lg:col-span-4 compact-card flex flex-col items-center p-6 slide-up ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative mb-6">
            <Avatar className="w-32 h-32 border-4 border-violet-500/50 shadow-lg">
              <AvatarImage src={avatarUrl} alt={fullName || 'User'} />
              <AvatarFallback className="bg-gradient-to-r from-violet-500 to-emerald-500 text-white text-5xl font-bold">
                {getInitials(fullName || 'U')}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full cursor-pointer border-2 border-white hover:bg-violet-700 transition-colors shadow-md">
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
              />
              <Camera className="h-5 w-5 text-white" />
            </label>
          </div>
          <h2 className="text-dynamic-xl font-bold text-white mb-2 text-center">{fullName || 'New User'}</h2>
          <p className="text-dynamic-base text-gray-400 text-center mb-4">{user?.email}</p>

          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 text-dynamic-sm text-gray-300">
              <Mail className="h-4 w-4 text-violet-400" />
              <span>{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-2 text-dynamic-sm text-gray-300">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>{phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2 text-dynamic-sm text-gray-300">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>{address}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2 text-dynamic-sm text-gray-300">
                <Globe className="h-4 w-4 text-blue-400" />
                <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">{website}</a>
              </div>
            )}
            {company && (
              <div className="flex items-center gap-2 text-dynamic-sm text-gray-300">
                <Briefcase className="h-4 w-4 text-purple-400" />
                <span>{company}</span>
              </div>
            )}
            {industry && (
              <div className="flex items-center gap-2 text-dynamic-sm text-gray-300">
                <Award className="h-4 w-4 text-pink-400" />
                <span>{industry}</span>
              </div>
            )}
          </div>
        </div>

        {/* Editable Profile Details */}
        <div className={`col-span-12 lg:col-span-8 compact-card p-6 space-y-6 slide-up ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-dynamic-xl font-bold text-white mb-4 flex items-center gap-3">
            <User className="h-6 w-6 text-violet-400" />
            Edit Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="text-dynamic-sm font-medium text-gray-300">Full Name</label>
              <Input 
                id="fullName" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name" 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-dynamic-sm font-medium text-gray-300">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email" 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-dynamic-sm font-medium text-gray-300">Phone Number</label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +1234567890" 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="text-dynamic-sm font-medium text-gray-300">Address</label>
              <Input 
                id="address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your address" 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="website" className="text-dynamic-sm font-medium text-gray-300">Website</label>
              <Input 
                id="website" 
                type="url" 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g., https://yourwebsite.com" 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="company" className="text-dynamic-sm font-medium text-gray-300">Company</label>
              <Input 
                id="company" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name" 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="industry" className="text-dynamic-sm font-medium text-gray-300">Industry</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="bio" className="text-dynamic-sm font-medium text-gray-300">Bio</label>
              <Textarea 
                id="bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself or your business goals..." 
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            {saved && <span className="text-emerald-400 text-dynamic-sm flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Saved!</span>}
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-5 w-5" /> Save Profile</>
              )}
            </Button>
            <Button 
              onClick={signOut} 
              variant="outline"
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Usage Limits Card */}
        <div className={`col-span-12 slide-up ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card p-6">
            <h2 className="text-dynamic-xl font-bold text-white mb-4 flex items-center gap-3">
              <Award className="h-6 w-6 text-yellow-400" />
              Usage & Limits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Current Plan: <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-1 rounded-full text-sm font-bold">{user?.user_metadata?.subscription_tier || 'Free'}</span></h3>
                <p className="text-gray-400 text-sm mb-4">Your current subscription details and usage.</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-300 text-sm">
                    <span>Video Optimizations</span>
                    <span className="font-semibold">15/50 used</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>

                  <div className="flex items-center justify-between text-gray-300 text-sm">
                    <span>Scheduled Posts</span>
                    <span className="font-semibold">28/100 used</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>

                  <div className="flex items-center justify-between text-gray-300 text-sm">
                    <span>AI Idea Generations</span>
                    <span className="font-semibold">5/10 used</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Need More?</h3>
                  <p className="text-gray-400 text-sm mb-4">Upgrade your plan for higher limits and exclusive features.</p>
                </div>
                <Button className="btn-primary flex items-center gap-2 mt-auto">
                  <Plus className="h-5 w-5" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
