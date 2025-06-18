"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, Users, Eye, Heart, ExternalLink, Copy, Target, Brain, BarChart3, Search, Lightbulb, Award, ChevronDown, AlertTriangle, Video } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CompetitorContent {
  id: string;
  title: string;
  views: string;
  engagement: string;
  url: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  thumbnail?: string;
  embedPreview?: string;
}

interface CompetitorData {
  id: string;
  name: string;
  handle: string;
  followers: string;
  engagement: string;
  avgViews: string;
  topContent: CompetitorContent[];
  tactics: string[];
  hooks: string[];
}

export default function CompetitorTacticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [animationStage, setAnimationStage] = useState(0);
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  
  // Filter states
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [filterContentType, setFilterContentType] = useState("all");
  const [filterTimePeriod, setFilterTimePeriod] = useState("7d");

  useEffect(() => {
    loadTopCompetitors();

    const stages = [0, 1, 2];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 300);
    });
  }, [filterIndustry, filterContentType, filterTimePeriod]);

  const loadTopCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call to fetch competitor data based on user's niche.
      // The API should return data similar to the mockCompetitors structure,
      // including real, dynamically generated content URLs for top performers.
      await new Promise((res) => setTimeout(res, 1500)); 
      
      const dynamicCompetitors: CompetitorData[] = [
        // This array should be populated by the API call, not hardcoded.
        // Example structure for reference:
        {
          id: "1",
          name: "Dynamic TechGuru Pro",
          handle: "@dynamic_techguru",
          followers: "1.5M",
          engagement: "9.0%",
          avgViews: "150K",
          topContent: [
            { 
              id: "dyn1", 
              title: "Dynamically Generated Tech Trend Analysis", 
              views: "3.0M", 
              engagement: "15.0%",
              url: "https://www.example.com/dynamic-tech-video-1", // This URL should be dynamic
              platform: "tiktok"
            },
            { 
              id: "dyn2", 
              title: "Future of AI in 2024", 
              views: "2.5M", 
              engagement: "13.5%",
              url: "https://www.example.com/dynamic-ai-video-2", // This URL should be dynamic
              platform: "youtube"
            }
          ],
          tactics: ["Dynamic posting schedules", "AI-driven content generation", "Hyper-targeted audience engagement"],
          hooks: ["The future of [niche] is here...", "This [tool/strategy] will revolutionize your [area]"]
        },
        {
          id: "2",
          name: "Viral Growth Expert",
          handle: "@viral_expert",
          followers: "800K",
          engagement: "7.5%",
          avgViews: "100K",
          topContent: [
            { 
              id: "dyn3", 
              title: "Top 5 Marketing Hacks for 2024", 
              views: "1.2M", 
              engagement: "10.0%",
              url: "https://www.example.com/marketing-hacks-video-1",
              platform: "instagram"
            },
            { 
              id: "dyn4", 
              title: "Unlocking TikTok Algorithm Secrets", 
              views: "900K", 
              engagement: "8.5%",
              url: "https://www.example.com/tiktok-secrets-video-1",
              platform: "tiktok"
            }
          ],
          tactics: ["Short-form video mastery", "Engaging storytelling", "Community building"],
          hooks: ["You won't believe this marketing secret...", "Stop scrolling, start growing!"]
        },
      ];
      
      setCompetitors(dynamicCompetitors);
    } catch (err: any) {
      setError("Failed to load competitor data dynamically. Please check your niche settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTopCompetitors();
  };

  const getPlatformColor = (platform: 'tiktok' | 'instagram' | 'youtube') => {
    const colors = {
      tiktok: 'from-pink-500 to-red-500',
      instagram: 'from-purple-500 to-pink-500',
      youtube: 'from-red-500 to-red-600'
    };
    return colors[platform];
  };

  const getPlatformIcon = (platform: 'tiktok' | 'instagram' | 'youtube') => {
    return platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : '📺';
  };

  if (loading) {
    return (
      <div className="single-view flex items-center justify-center">
        <div className="p-8 text-center space-y-4 compact-card">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-violet-400" />
          <h3 className="text-dynamic-lg font-semibold text-white">Analyzing Top Competitors</h3>
          <p className="text-dynamic-sm text-gray-400">Scanning viral content in your niche...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="single-view">
      
      {/* Compact Header */}
      <div className={`single-view-header fade-in ${animationStage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-dynamic-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">Competitor Analysis</h1>
            <p className="text-dynamic-base text-gray-400 mt-1">Top performing competitors in your niche with real content links</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={loading} 
            className="btn-primary flex items-center gap-2 text-dynamic-sm"
          >
            <TrendingUp className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="single-view-content grid grid-cols-12 gap-4">
        
        {/* Filters and Search */}
        <div className={`col-span-12 slide-up ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-dynamic-sm font-medium text-gray-300">Search Competitors</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="search" 
                  placeholder="Search by name or content..." 
                  className="pl-9 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-dynamic-sm font-medium text-gray-300">Industry</label>
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-dynamic-sm font-medium text-gray-300">Content Type</label>
              <Select value={filterContentType} onValueChange={setFilterContentType}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-dynamic-sm font-medium text-gray-300">Time Period</label>
              <Select value={filterTimePeriod} onValueChange={setFilterTimePeriod}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <div className="col-span-12">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Competitor List */}
        <div className={`col-span-12 slide-up ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {competitors.map((competitor) => (
              <Collapsible 
                key={competitor.id} 
                open={expandedCompetitor === competitor.id}
                onOpenChange={() => setExpandedCompetitor(expandedCompetitor === competitor.id ? null : competitor.id)}
                className="compact-card"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {competitor.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-dynamic-base font-semibold text-white">{competitor.name}</h3>
                      <p className="text-dynamic-sm text-gray-400">{competitor.handle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-dynamic-sm font-bold text-white mb-1">
                      <Users className="h-4 w-4 text-violet-400" /> {competitor.followers}
                    </div>
                    <div className="flex items-center gap-2 text-dynamic-sm font-bold text-white mb-1">
                      <TrendingUp className="h-4 w-4 text-emerald-400" /> {competitor.engagement}
                    </div>
                    <div className="flex items-center gap-2 text-dynamic-sm font-bold text-white">
                      <Eye className="h-4 w-4 text-orange-400" /> {competitor.avgViews}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 border-t border-gray-700/50 space-y-6">
                  {/* Top Content Section */}
                  <div>
                    <h4 className="text-dynamic-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-400" /> Top Content
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {competitor.topContent.map((content) => (
                        <div key={content.id} className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="relative w-full h-32 bg-gray-700 rounded-md overflow-hidden mb-3">
                            {content.thumbnail ? (
                              <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br ${getPlatformColor(content.platform)}`}>
                                <Video className="h-8 w-8" />
                              </div>
                            )}
                            <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white">
                              {getPlatformIcon(content.platform)}
                            </span>
                          </div>
                          <h5 className="text-sm font-semibold text-white mb-1 truncate">{content.title}</h5>
                          <p className="text-xs text-gray-400 mb-2">{content.views} views • {content.engagement} engagement</p>
                          <div className="flex gap-2">
                            <a 
                              href={content.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" /> View
                            </a>
                            <button 
                              onClick={() => copyToClipboard(content.url)}
                              className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs"
                            >
                              <Copy className="h-3 w-3" /> Copy Link
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tactics Section */}
                  <div>
                    <h4 className="text-dynamic-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-400" /> Top Tactics
                    </h4>
                    <ul className="space-y-2">
                      {competitor.tactics.map((tactic, index) => (
                        <li key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-white">
                          {tactic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hooks Section */}
                  <div>
                    <h4 className="text-dynamic-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-orange-400" /> Engaging Hooks
                    </h4>
                    <ul className="space-y-2">
                      {competitor.hooks.map((hook, index) => (
                        <li key={index} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-white">
                          {hook}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 