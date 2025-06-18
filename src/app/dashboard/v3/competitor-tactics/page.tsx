"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, Users, Eye, Heart, ExternalLink, Copy, Target, Brain, BarChart3, Search, Lightbulb, Award, ChevronDown, AlertTriangle, Video, Instagram, Youtube, Clapperboard } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        {
          id: "1",
          name: "Trendsetter Central",
          handle: "@trendsetter",
          followers: "1.8M",
          engagement: "10.2%",
          avgViews: "250K",
          topContent: [
            { 
              id: "t1", 
              title: "5 DIY Home Decor Hacks", 
              views: "4.5M", 
              engagement: "18.0%",
              url: "https://www.tiktok.com/@tiktok/video/7376710497579124000",
              platform: "tiktok",
              thumbnail: "https://via.placeholder.com/150/FF69B4/FFFFFF?text=TikTok+Video"
            },
            { 
              id: "t2", 
              title: "Mastering Minimalist Living", 
              views: "3.2M", 
              engagement: "15.5%",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              platform: "youtube",
              thumbnail: "https://via.placeholder.com/150/FF5733/FFFFFF?text=YouTube+Video"
            }
          ],
          tactics: [
            "High-energy, short-form video content",
            "Early adoption of trending sounds and challenges",
            "Direct calls-to-action for product showcases",
            "Collaborations with micro-influencers"
          ],
          hooks: [
            "You won't believe this home decor secret...",
            "Transform your space with these simple steps!"
          ]
        },
        {
          id: "2",
          name: "FashionForward Daily",
          handle: "@fashionforward",
          followers: "1.2M",
          engagement: "8.5%",
          avgViews: "180K",
          topContent: [
            { 
              id: "f1", 
              title: "Summer Outfit Ideas 2024", 
              views: "2.8M", 
              engagement: "12.0%",
              url: "https://www.instagram.com/p/C71j_50u7cR/",
              platform: "instagram",
              thumbnail: "https://via.placeholder.com/150/8A2BE2/FFFFFF?text=Instagram+Post"
            },
            { 
              id: "f2", 
              title: "Affordable Luxury Haul", 
              views: "2.1M", 
              engagement: "10.0%",
              url: "https://www.tiktok.com/@tiktok/video/7376710497579124000",
              platform: "tiktok",
              thumbnail: "https://via.placeholder.com/150/FFD700/FFFFFF?text=TikTok+Video"
            }
          ],
          tactics: [
            "Styling guides and 'how-to' videos",
            "Frequent engagement with comments and DMs",
            "Showcasing product versatility",
            "Leveraging user-generated content"
          ],
          hooks: [
            "Your summer wardrobe just got an upgrade!",
            "These luxury finds are actually affordable..."
          ]
        },
        {
          id: "3",
          name: "Healthy Living Hub",
          handle: "@healthylife",
          followers: "900K",
          engagement: "7.0%",
          avgViews: "120K",
          topContent: [
            { 
              id: "h1", 
              title: "Quick & Easy Healthy Meal Prep", 
              views: "1.5M", 
              engagement: "9.5%",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              platform: "youtube",
              thumbnail: "https://via.placeholder.com/150/3CB371/FFFFFF?text=YouTube+Video"
            },
            { 
              id: "h2", 
              title: "Morning Routine for Energy", 
              views: "1.0M", 
              engagement: "8.0%",
              url: "https://www.instagram.com/p/C71j_50u7cR/",
              platform: "instagram",
              thumbnail: "https://via.placeholder.com/150/6A5ACD/FFFFFF?text=Instagram+Post"
            }
          ],
          tactics: [
            "Educational content on health benefits",
            "Showcasing product use in daily routines",
            "Engaging with health-related challenges",
            "Partnerships with nutritionists/fitness experts"
          ],
          hooks: [
            "Boost your energy with this simple morning routine!",
            "Unlock the secret to effortless healthy eating."
          ]
        },
        {
          id: "4",
          name: "Gamer's Paradise",
          handle: "@gameon",
          followers: "2.1M",
          engagement: "11.5%",
          avgViews: "300K",
          topContent: [
            { 
              id: "g1", 
              title: "New Game Review: Immortal Realms", 
              views: "5.0M", 
              engagement: "20.0%",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              platform: "youtube",
              thumbnail: "https://via.placeholder.com/150/4682B4/FFFFFF?text=YouTube+Video"
            },
            { 
              id: "g2", 
              title: "Top Gaming Setups 2024", 
              views: "3.5M", 
              engagement: "16.0%",
              url: "https://www.tiktok.com/@tiktok/video/7376710497579124000",
              platform: "tiktok",
              thumbnail: "https://via.placeholder.com/150/DDA0DD/FFFFFF?text=TikTok+Video"
            }
          ],
          tactics: [
            "Live streaming gameplay and interactions",
            "Early access content and exclusive reviews",
            "Community contests and giveaways",
            "Utilizing game-specific humor and memes"
          ],
          hooks: [
            "This new game will change everything...",
            "Is your gaming setup holding you back?"
          ]
        },
        {
          id: "5",
          name: "Travel Explorer Co.",
          handle: "@travel_exp",
          followers: "750K",
          engagement: "6.8%",
          avgViews: "90K",
          topContent: [
            { 
              id: "tr1", 
              title: "Hidden Gems of Southeast Asia", 
              views: "1.0M", 
              engagement: "8.0%",
              url: "https://www.instagram.com/p/C71j_50u7cR/",
              platform: "instagram",
              thumbnail: "https://via.placeholder.com/150/ADD8E6/FFFFFF?text=Instagram+Post"
            },
            { 
              id: "tr2", 
              title: "Budget Travel Tips for Europe", 
              views: "800K", 
              engagement: "7.5%",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              platform: "youtube",
              thumbnail: "https://via.placeholder.com/150/F08080/FFFFFF?text=YouTube+Video"
            }
          ],
          tactics: [
            "Visually stunning travel vlogs and reels",
            "Detailed travel guides and itineraries",
            "Highlighting unique cultural experiences",
            "Partnerships with local tourism boards"
          ],
          hooks: [
            "Uncover the magic of [destination]...",
            "Travel Europe on a budget? Here's how!"
          ]
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
    switch (platform) {
      case 'tiktok':
        return <Clapperboard className="h-4 w-4 text-white" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-white" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 text-white" />;
      default:
        return <Video className="h-4 w-4 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen flex items-center justify-center">
        <div className="p-8 text-center space-y-4 compact-card bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-violet-400" />
          <h3 className="text-xl font-semibold text-white">Analyzing Top Competitors</h3>
          <p className="text-slate-400">Scanning viral content in your niche...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
          Competitor Analysis
        </h1>
        <p className="text-slate-400 text-lg">
          Gain a competitive edge by analyzing top-performing strategies in your niche.
        </p>
        <Button 
          onClick={handleRefresh} 
          disabled={loading} 
          className="btn-primary flex items-center gap-2 mx-auto mt-4"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Filters and Search - Removed for simplified UI, could be re-added later if required */}
      {/* <div className="compact-card grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium text-gray-300">Search Competitors</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              id="search" 
              placeholder="Search by name or keyword" 
              className="pl-10 bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium text-gray-300">Industry</label>
          <Select value={filterIndustry} onValueChange={setFilterIndustry}>
            <SelectTrigger id="industry" className="bg-gray-700/50 border-gray-600 text-white">
              <SelectValue placeholder="Select Industry" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="contentType" className="text-sm font-medium text-gray-300">Content Type</label>
          <Select value={filterContentType} onValueChange={setFilterContentType}>
            <SelectTrigger id="contentType" className="bg-gray-700/50 border-gray-600 text-white">
              <SelectValue placeholder="Select Content Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="shortVideo">Short Video</SelectItem>
              <SelectItem value="longVideo">Long Video</SelectItem>
              <SelectItem value="image">Image Post</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="timePeriod" className="text-sm font-medium text-gray-300">Time Period</label>
          <Select value={filterTimePeriod} onValueChange={setFilterTimePeriod}>
            <SelectTrigger id="timePeriod" className="bg-gray-700/50 border-gray-600 text-white">
              <SelectValue placeholder="Select Time Period" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {competitors.map((competitor, index) => (
          <Card 
            key={competitor.id} 
            className={`compact-card bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl transition-all duration-300 transform ${expandedCompetitor === competitor.id ? 'scale-[1.01] border-indigo-500' : ''}
            ${index === 0 ? 'order-1' : index === 1 ? 'order-2' : index === 2 ? 'order-3' : 'order-4'}
            `}
          >
            <CardHeader className="p-0 mb-4">
              <div classNameName="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-400" /> {competitor.name}
                </CardTitle>
                <span className="text-slate-400 text-sm">{competitor.handle}</span>
              </div>
              <CardDescription className="text-slate-400 mt-2">
                Leading the pack in content strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center border-b border-gray-700/50 pb-4">
                <div className="flex flex-col items-center">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <span className="text-white font-semibold text-lg mt-1">{competitor.followers}</span>
                  <span className="text-slate-400 text-xs">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="h-5 w-5 text-violet-400" />
                  <span className="text-white font-semibold text-lg mt-1">{competitor.engagement}</span>
                  <span className="text-slate-400 text-xs">Engagement</span>
                </div>
                <div className="flex flex-col items-center">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-semibold text-lg mt-1">{competitor.avgViews}</span>
                  <span className="text-slate-400 text-xs">Avg. Views</span>
                </div>
              </div>

              <Collapsible 
                open={expandedCompetitor === competitor.id}
                onOpenChange={() => setExpandedCompetitor(expandedCompetitor === competitor.id ? null : competitor.id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer text-white font-semibold hover:text-indigo-400 transition-colors py-2">
                  <span>Key Tactics & Hooks</span>
                  {expandedCompetitor === competitor.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  <div>
                    <h4 className="text-md font-semibold text-slate-300 mb-2">Top Tactics:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                      {competitor.tactics.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-slate-300 mb-2">Popular Hooks:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                      {competitor.hooks.map((h, i) => <li key={i}>"{h}"</li>)}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <div className="mt-4">
                <h3 className="text-md font-semibold text-slate-300 mb-2">Top Performing Content:</h3>
                <div className="space-y-3">
                  {competitor.topContent.map(content => (
                    <div 
                      key={content.id} 
                      className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-700 relative group"
                    >
                      {content.thumbnail && (
                        <img src={content.thumbnail} alt="video thumbnail" className="w-16 h-10 object-cover rounded-md flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white truncate">{content.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {content.views}</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {content.engagement}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${getPlatformColor(content.platform)}`}>
                            {content.platform}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={content.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-shrink-0 text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="View on platform"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 text-slate-400 hover:text-white"
                        onClick={() => copyToClipboard(content.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 