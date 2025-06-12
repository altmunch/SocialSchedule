"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Users, Eye, Heart } from "lucide-react";

interface CompetitorData {
  id: string;
  name: string;
  handle: string;
  followers: string;
  engagement: string;
  avgViews: string;
  topContent: {
    title: string;
    views: string;
    engagement: string;
  }[];
  tactics: string[];
  hooks: string[];
}

export default function CompetitorTacticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);

  useEffect(() => {
    // Auto-load top competitors on component mount
    loadTopCompetitors();
  }, []);

  const loadTopCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call to get top performing competitors
      await new Promise((res) => setTimeout(res, 2000));
      
      // Mock data for top 5 competitors
      const mockCompetitors: CompetitorData[] = [
        {
          id: "1",
          name: "TechGuru Pro",
          handle: "@techguru_pro",
          followers: "1.2M",
          engagement: "8.5%",
          avgViews: "125K",
          topContent: [
            { title: "5 Tech Tips That Changed My Life", views: "2.1M", engagement: "12.3%" },
            { title: "Why Everyone Needs This App", views: "1.8M", engagement: "11.1%" }
          ],
          tactics: ["Posts consistently at 6 PM EST", "Uses trending audio within 2 hours", "Responds to every comment in first hour"],
          hooks: ["You won't believe what this app can do...", "I tested 10 apps so you don't have to", "This changed everything for me"]
        },
        {
          id: "2", 
          name: "MarketingMaven",
          handle: "@marketing_maven",
          followers: "890K",
          engagement: "9.2%",
          avgViews: "98K",
          topContent: [
            { title: "Marketing Hack That Actually Works", views: "1.5M", engagement: "13.8%" },
            { title: "I Grew My Business 300% Using This", views: "1.2M", engagement: "10.5%" }
          ],
          tactics: ["Creates 'How I...' content series", "Shows behind-the-scenes process", "Uses data-driven claims with proof"],
          hooks: ["How I grew my business from $0 to $100K", "The marketing strategy they don't want you to know", "I tried every growth hack - here's what worked"]
        },
        {
          id: "3",
          name: "ProductivityPro",
          handle: "@productivity_pro",
          followers: "750K", 
          engagement: "7.8%",
          avgViews: "87K",
          topContent: [
            { title: "My Morning Routine for Success", views: "980K", engagement: "9.2%" },
            { title: "Productivity Tools Review", views: "845K", engagement: "8.7%" }
          ],
          tactics: ["Creates list-format content", "Uses split-screen comparisons", "Posts tutorial-style videos"],
          hooks: ["5 apps that will change your productivity game", "My secret to getting 3x more done", "Stop doing these productivity mistakes"]
        },
        {
          id: "4",
          name: "SuccessStories",
          handle: "@success_stories",
          followers: "650K",
          engagement: "8.9%", 
          avgViews: "76K",
          topContent: [
            { title: "From Zero to Hero Story", views: "1.1M", engagement: "11.4%" },
            { title: "Biggest Failure That Led to Success", views: "920K", engagement: "10.2%" }
          ],
          tactics: ["Shares personal transformation stories", "Uses before/after format", "Emotional storytelling with data"],
          hooks: ["My biggest failure taught me this...", "How I went from broke to making 6 figures", "The moment everything changed for me"]
        },
        {
          id: "5",
          name: "InnovationHub",
          handle: "@innovation_hub",
          followers: "580K",
          engagement: "7.5%",
          avgViews: "68K", 
          topContent: [
            { title: "Future Tech Predictions", views: "850K", engagement: "9.8%" },
            { title: "Tech That Will Change Everything", views: "720K", engagement: "8.9%" }
          ],
          tactics: ["Focuses on future trends", "Creates prediction-based content", "Uses countdown/timeline formats"],
          hooks: ["Technology that will replace everything in 2025", "Why everyone will use this by next year", "The future is here and it's called..."]
        }
      ];
      
      setCompetitors(mockCompetitors);
    } catch (err: any) {
      setError("Failed to load competitor data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTopCompetitors();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background text-text flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p>Analyzing top competitors in your niche...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-creative">Top Competitor Analysis</h1>
          <p className="text-secondaryText">Top 5 performing competitors in your niche and similar niches</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitors.map((competitor) => (
          <Card key={competitor.id} className="bg-panel border border-border shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-creative">{competitor.name}</CardTitle>
                  <p className="text-secondaryText text-sm">{competitor.handle}</p>
                </div>
                <div className="text-right text-xs text-secondaryText">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {competitor.followers}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {competitor.engagement} avg
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {competitor.avgViews} avg views
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top Content */}
              <div>
                <h4 className="font-medium text-sm mb-2">Top Performing Content</h4>
                <div className="space-y-2">
                  {competitor.topContent.map((content, index) => (
                    <div key={index} className="bg-background/50 p-2 rounded text-xs">
                      <div className="font-medium">{content.title}</div>
                      <div className="text-secondaryText">
                        {content.views} views • {content.engagement} engagement
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Winning Tactics */}
              <div>
                <h4 className="font-medium text-sm mb-2">Winning Tactics</h4>
                <ul className="space-y-1">
                  {competitor.tactics.map((tactic, index) => (
                    <li key={index} className="bg-mint/10 p-2 rounded text-xs border border-mint/20">
                      {tactic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Hooks */}
              <div>
                <h4 className="font-medium text-sm mb-2">High-Converting Hooks</h4>
                <ul className="space-y-1">
                  {competitor.hooks.map((hook, index) => (
                    <li key={index} className="bg-lavender/10 p-2 rounded text-xs border border-lavender/20 flex justify-between items-center">
                      <span>"{hook}"</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                        onClick={() => navigator.clipboard.writeText(hook)}
                      >
                        Copy
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Insights */}
      <Card className="bg-panel border border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-creative">Key Insights Across Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background/50 p-4 rounded">
              <h4 className="font-medium mb-2">Common Patterns</h4>
              <ul className="text-sm space-y-1 text-secondaryText">
                <li>• Post consistently during peak hours (6-8 PM)</li>
                <li>• Use trending audio within 2 hours of release</li>
                <li>• Focus on transformation/before-after content</li>
                <li>• Engage actively in first hour after posting</li>
              </ul>
            </div>
            <div className="bg-background/50 p-4 rounded">
              <h4 className="font-medium mb-2">Hook Formulas</h4>
              <ul className="text-sm space-y-1 text-secondaryText">
                <li>• "How I [achieved result] in [timeframe]"</li>
                <li>• "[Number] things that will change your [area]"</li>
                <li>• "I tested [number] [things] so you don't have to"</li>
                <li>• "The [secret/mistake] they don't want you to know"</li>
              </ul>
            </div>
            <div className="bg-background/50 p-4 rounded">
              <h4 className="font-medium mb-2">Content Types</h4>
              <ul className="text-sm space-y-1 text-secondaryText">
                <li>• Tutorial/How-to (highest engagement)</li>
                <li>• Behind-the-scenes content</li>
                <li>• Before/after transformations</li>
                <li>• Tool/app reviews and comparisons</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 