"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Users, ShoppingCart, Music2, Instagram, Youtube, Twitter, Linkedin, Store, Package, Globe, Plug, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { SubscriptionPromptPopup } from "@/components/dashboard/SubscriptionPromptPopup";

const socialPlatforms = [
  { name: "TikTok", id: "tiktok", icon: Music2, color: "#6366f1" }, // indigo
  { name: "Instagram", id: "instagram", icon: Instagram, color: "#ec4899" }, // pink
  { name: "YouTube", id: "youtube", icon: Youtube, color: "#ef4444" }, // red
  { name: "Twitter", id: "twitter", icon: Twitter, color: "#3b82f6" }, // blue
  { name: "LinkedIn", id: "linkedin", icon: Linkedin, color: "#2563eb" }, // darker blue
];

const commercePlatforms = [
  { name: "Shopify", id: "shopify", icon: Store, color: "#10b981" }, // emerald
  { name: "Amazon", id: "amazon", icon: Package, color: "#f59e0b" }, // amber
  { name: "WooCommerce", id: "woocommerce", icon: Globe, color: "#be185d" }, // dark pink
  { name: "Etsy", id: "etsy", icon: Store, color: "#d97706" }, // orange
  { name: "eBay", id: "ebay", icon: Package, color: "#eab308" }, // yellow
];

export default function ConnectPage() {
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate fetching initial connection status from an API
    const fetchConnections = async () => {
      await new Promise((res) => setTimeout(res, 500)); // Simulate API delay
      setConnections({
        tiktok: true,
        instagram: false,
        youtube: true,
        twitter: false,
        linkedin: false,
        shopify: true,
        amazon: false,
        woocommerce: false,
        etsy: false,
        ebay: false,
      });
    };
    fetchConnections();
  }, []);

  const handleConnect = async (platform: string) => {
    if (user?.user_metadata?.tier === 'lite' && commercePlatforms.some(p => p.id === platform)) {
      setShowSubscriptionPrompt(true);
      return;
    }

    setLoading(platform);
    setError(null);
    try {
      // Simulate API call to connect
      await new Promise((res) => setTimeout(res, 1200));
      setConnections((prev) => ({ ...prev, [platform]: true }));
    } catch {
      setError(`Failed to connect to ${platform}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    setLoading(platform);
    setError(null);
    try {
      // Simulate API call to disconnect
      await new Promise((res) => setTimeout(res, 800));
      setConnections((prev) => ({ ...prev, [platform]: false }));
    } catch {
      setError(`Failed to disconnect from ${platform}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const renderPlatformCard = (platform: typeof socialPlatforms[0]) => {
    const PlatformIcon = platform.icon;
    const isConnected = connections[platform.id];
    const isCommercePlatform = commercePlatforms.some(p => p.id === platform.id);
    const isLiteTier = user?.user_metadata?.tier === 'lite';
    const isDisabledForLite = isCommercePlatform && isLiteTier;

    return (
      <Card key={platform.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full" style={{ backgroundColor: `${platform.color}20` }}>
            <PlatformIcon className="h-6 w-6" style={{ color: platform.color }} />
          </div>
          <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
          {isDisabledForLite && (
            <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full">Pro Feature</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {loading === platform.id ? (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          ) : isConnected ? (
            <span className="text-emerald-400 flex items-center gap-1 text-sm font-medium"><CheckCircle2 className="h-4 w-4" /> Connected</span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1 text-sm font-medium"><XCircle className="h-4 w-4" /> Disconnected</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => (isConnected ? handleDisconnect(platform.id) : handleConnect(platform.id))}
            disabled={loading === platform.id || isDisabledForLite}
            className={`w-28 ${
              isConnected ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-indigo-500 text-indigo-400 hover:bg-indigo-500/20'
            }`}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            Integrate Your Platforms
          </h1>
          <p className="text-slate-400 text-lg">
            Connect your social media and e-commerce accounts for seamless automation and analytics.
          </p>
        </div>

        {/* Social Media Integrations */}
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-400" /> Social Media Integrations
            </CardTitle>
            <CardDescription className="text-slate-400">Boost your online presence across popular social platforms.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {socialPlatforms.map(renderPlatformCard)}
          </CardContent>
        </Card>

        {/* E-commerce Integrations */}
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-emerald-400" /> E-commerce Integrations
            </CardTitle>
            <CardDescription className="text-slate-400">Streamline product management and sales analytics.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {commercePlatforms.map(renderPlatformCard)}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <SubscriptionPromptPopup 
          isOpen={showSubscriptionPrompt}
          onClose={() => setShowSubscriptionPrompt(false)}
          featureName="E-commerce Integrations"
        />
      </div>
    </div>
  );
} 