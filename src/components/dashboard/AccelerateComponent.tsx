'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Upload, 
  Sparkles, 
  Copy, 
  Save, 
  Share, 
  Lightbulb, 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Star, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Heart, 
  MessageSquare, 
  X,
  Plus,
  ArrowRight,
  Video,
  BarChart3,
  Award,
  Loader2
} from 'lucide-react';

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: string;
  duration: string;
  thumbnail: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  optimizations?: {
    title: string;
    description: string;
    hashtags: string[];
    score: number;
    suggestions: string[];
  };
}

export default function AccelerateComponent() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [animationStage, setAnimationStage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 300);
    });
  }, []);

  // Mock optimization data
  const generateOptimizations = (videoName: string): VideoFile['optimizations'] => ({
    title: `Viral ${videoName.split('.')[0]} - The Secret to 10x Growth!`,
    description: `🚀 GAME-CHANGING ${videoName.split('.')[0]} strategy that's driving INSANE results! Watch till the end for the secret formula that transformed our business. #GameChanger #Viral #Success\n\n💯 What you'll learn:\n• The hidden strategy behind 10x growth\n• Exact steps we used to scale from 0 to 6 figures\n• Why 97% of people fail (and how to be the 3%)\n\nDrop a 🔥 if you're ready to level up!`,
    hashtags: [
      '#Viral', '#Success', '#GameChanger', '#BusinessTips', '#Entrepreneur',
      '#Motivation', '#GrowthHacking', '#Marketing', '#Strategy', '#Results'
    ],
    score: Math.floor(Math.random() * 20) + 80,
    suggestions: [
      'Add hook in first 3 seconds',
      'Include trending audio',
      'Use eye-catching thumbnail',
      'Post during peak hours (6-8 PM)',
      'Engage with comments immediately'
    ]
  });

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('dragover');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    if (videos.length + files.length > 10) {
      alert('Maximum 10 videos allowed for single-page view');
      return;
    }

    const newVideos: VideoFile[] = files
      .filter(file => file.type.startsWith('video/'))
      .map(file => ({
        id: Date.now().toString() + Math.random(),
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        duration: '0:' + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
        thumbnail: '/placeholder-video.jpg',
        status: 'pending' as const,
        progress: 0,
      }));

    setVideos(prev => [...prev, ...newVideos]);
  };

  const startOptimization = async () => {
    if (videos.length === 0) return;

    setIsProcessing(true);
    
    // Simulate optimization process
    for (let i = 0; i < videos.length; i++) {
      setVideos(prev => 
        prev.map((video, index) => 
          index === i 
            ? { ...video, status: 'processing', progress: 0 }
            : video
        )
      );

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setVideos(prev => 
          prev.map((video, index) => 
            index === i 
              ? { ...video, progress }
              : video
          )
        );
      }

      // Complete optimization
      setVideos(prev => 
        prev.map((video, index) => 
          index === i 
            ? { 
                ...video, 
                status: 'completed', 
                progress: 100,
                optimizations: generateOptimizations(video.name)
              }
            : video
        )
      );
    }

    setIsProcessing(false);
  };

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const completedCount = videos.filter(v => v.status === 'completed').length;
  const averageScore = videos
    .filter(v => v.optimizations)
    .reduce((acc, v) => acc + (v.optimizations?.score || 0), 0) / Math.max(completedCount, 1);

  return (
    <div className="single-view">
      
      {/* Compact Header */}
      <div className={`single-view-header fade-in ${animationStage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-dynamic-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              AI Video Optimizer
            </h1>
            <p className="text-dynamic-base text-gray-400 mt-1">Upload videos and optimize titles, descriptions, and hashtags with AI</p>
          </div>
        {videos.length > 0 && (
            <div className="flex items-center gap-4 text-dynamic-sm">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-violet-400" />
                <span className="text-white">{videos.length} videos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">{completedCount} optimized</span>
              </div>
              {completedCount > 0 && (
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-400">{Math.round(averageScore)}% avg score</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="single-view-content">
        
          {/* Upload Section */}
        <div className={`slide-up ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-12 gap-4">
            
            {/* Upload Zone */}
            <div className="col-span-5 compact-card flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-700/50 rounded-lg cursor-pointer hover:border-violet-500 transition-colors bg-gray-900/50">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop Videos Here</h3>
              <p className="text-sm text-gray-500 mb-4">or click to upload (Max 10 videos)</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                
              <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                >
                  Upload Videos
                </button>
            </div>

            {/* Video Queue */}
            <div className="col-span-7 compact-card flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-dynamic-lg font-semibold text-white">Video Queue ({videos.length})</h2>
                <button 
                  onClick={startOptimization}
                  disabled={videos.length === 0 || isProcessing}
                  className="btn-primary flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Optimizing...</>
                  ) : (
                    <><Sparkles className="h-5 w-5" /> Start Optimization</>
                  )}
                </button>
              </div>

              {videos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p>No videos in queue. Drag and drop or upload to begin.</p>
                </div>
              ) : (
                <div className="space-y-4"> {/* Removed max-h-96 overflow-y-auto */}
                  {videos.map((video, index) => (
                    <div key={video.id} className="video-card p-4 flex items-center gap-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                      <img src="/images/video-thumbnail.png" alt="Video Thumbnail" className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-dynamic-base mb-1">{video.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{video.duration} • {video.size}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-violet-500 to-purple-400 h-2 rounded-full" style={{ width: `${video.progress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{video.status === 'processing' ? `Processing: ${video.progress}%` : video.status}</p>
                      </div>
                      <button onClick={() => removeVideo(video.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optimization Results Section */}
        <div className={`slide-up ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-12 gap-4 mt-8">
            {/* Selected Video Details */}
            <div className="col-span-5 compact-card flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-dynamic-lg font-semibold text-white">Optimization Details</h2>
                {selectedVideo && (
                  <span className="text-dynamic-sm text-gray-400">Score: {selectedVideo.optimizations?.score}%</span>
                )}
              </div>
              {selectedVideo ? (
                <div className="space-y-4">
                  <img src="/images/video-thumbnail.png" alt="Video Thumbnail" className="w-full h-auto object-cover rounded-md mb-2" />
                  <h3 className="text-dynamic-base font-semibold text-white">{selectedVideo.name}</h3>
                  <p className="text-sm text-gray-500">Duration: {selectedVideo.duration} | Size: {selectedVideo.size}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      Title & Description
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Hashtags
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      Engagement Score
                    </span>
                  </div>

                  <h4 className="text-dynamic-base font-semibold text-white mt-4 mb-2">AI-Generated Title</h4>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex justify-between items-center">
                    <p className="text-white text-sm">{selectedVideo.optimizations?.title}</p>
                    <button onClick={() => copyToClipboard(selectedVideo.optimizations?.title || '')} className="text-gray-400 hover:text-white transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <h4 className="text-dynamic-base font-semibold text-white mt-4 mb-2">AI-Generated Description</h4>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex flex-col">
                    <p className="text-white text-sm leading-relaxed mb-3">{selectedVideo.optimizations?.description}</p>
                    <button onClick={() => copyToClipboard(selectedVideo.optimizations?.description || '')} className="self-end text-gray-400 hover:text-white transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <h4 className="text-dynamic-base font-semibold text-white mt-4 mb-2">Recommended Hashtags</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedVideo.optimizations?.hashtags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => copyToClipboard(selectedVideo.optimizations?.hashtags.map(tag => `#${tag}`).join(' ') || '')} className="btn-secondary w-full">
                    <Copy className="h-4 w-4 mr-2" /> Copy All Hashtags
                  </button>

                  <h4 className="text-dynamic-base font-semibold text-white mt-4 mb-2">Improvement Suggestions</h4>
                  <ul className="space-y-2">
                    {selectedVideo.optimizations?.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <Lightbulb className="h-4 w-4 text-orange-400 flex-shrink-0 mt-1" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-3 mt-6">
                    <button className="btn-secondary flex-1">
                      <Save className="h-4 w-4 mr-2" /> Save Optimizations
                    </button>
                    <button className="btn-primary flex-1">
                      <Share className="h-4 w-4 mr-2" /> Share Video
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-16 w-16 mx-auto mb-4" />
                  <p>Select a completed video from the queue to view its optimization details.</p>
                </div>
              )}
            </div>

            {/* All Videos Grid */}
            <div className="col-span-7 flex flex-col space-y-4">
              <h2 className="text-dynamic-lg font-semibold text-white mb-2">All Optimized Videos</h2>
              {videos.length === 0 ? (
                <div className="compact-card text-center py-8 text-gray-500">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p>No videos available yet. Upload and optimize your first video!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.filter(v => v.status === 'completed').map((video) => (
                    <button 
                      key={video.id} 
                      onClick={() => setSelectedVideo(video)}
                      className={`video-card p-4 flex flex-col gap-3 bg-gray-800/50 border rounded-lg transition-all duration-300 
                        ${selectedVideo?.id === video.id ? 'border-violet-500 shadow-lg' : 'border-gray-700/50 hover:border-violet-400 hover:shadow-md'}
                      `}
                    >
                      <img src="/images/video-thumbnail.png" alt="Video Thumbnail" className="w-full h-32 object-cover rounded-md" />
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium text-dynamic-base mb-1 truncate">{video.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">Score: <span className="font-bold" style={{ color: `hsl(${video.optimizations?.score! * 1.2}, 70%, 60%)` }}>{video.optimizations?.score}%</span></p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Eye className="h-4 w-4" /> {Math.floor(Math.random() * 500) + 100} Views
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between w-full">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                          Optimized
                        </span>
                        <ArrowRight className="h-4 w-4 text-violet-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
