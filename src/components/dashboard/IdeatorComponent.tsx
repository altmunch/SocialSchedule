"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Sparkles, 
  Copy, 
  Save, 
  Share, 
  Lightbulb, 
  Brain, 
  Zap, 
  Image as ImageIcon, 
  Video, 
  Hash, 
  Mic, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Palette, 
  Music, 
  TrendingUp, 
  Star,
  RefreshCw as Refresh,
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface ContentSet {
  id: string;
  hooks: string[];
  script: string;
  visuals: string[];
  audio: string[];
  hashtags: string[];
  score: number;
}

export default function IdeatorComponent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI content strategist. Tell me about your product or service, and I'll create 5 unique content strategies for you. What are you promoting?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ContentSet[]>([]);
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [animationStage, setAnimationStage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 300);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: "AI is thinking...",
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      // Generate results
      const generatedResults: ContentSet[] = Array.from({ length: 5 }, (_, index) => ({
        id: `set-${index + 1}`,
        hooks: [
          `Hook ${index + 1}: Transform your business with our game-changing solution!`,
          `Hook ${index + 1}B: The secret strategy that's driving 10x growth...`
        ],
        script: `Complete script structure for set ${index + 1}: Start with a compelling hook, build tension with relatable problems, present your solution as the hero, provide social proof, and end with a clear call-to-action. This script is optimized for ${inputValue} and includes emotional triggers that convert.`,
        visuals: [
          `High-energy opening scene with dynamic transitions`,
          `Split-screen before/after comparisons`,
          `Animated text overlays with key statistics`,
          `User testimonial graphics`
        ],
        audio: [
          `Upbeat background music (120-140 BPM)`,
          `Clear, confident voiceover tone`,
          `Sound effects for transitions`,
          `Trending audio clip integration`
        ],
        hashtags: [
          '#ProductLaunch', '#Innovation', '#GameChanger', '#Success', '#Trending'
        ],
        score: Math.floor(Math.random() * 20) + 80 // Score between 80-100
      }));

      setResults(generatedResults);

      const aiResponse: Message = {
        id: Date.now().toString(),
        text: `Perfect! I've analyzed your product and created 5 unique content strategies. Each set includes hooks, scripts, visual guidelines, audio recommendations, and hashtags. The strategies are ranked by predicted engagement score. You can expand each set to see the full details!`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error. Please try again!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyFullSet = (set: ContentSet) => {
    const fullContent = `
CONTENT STRATEGY SET ${set.id.toUpperCase()}
Engagement Score: ${set.score}/100

HOOKS:
${set.hooks.map((hook, i) => `${i + 1}. ${hook}`).join('\n')}

SCRIPT:
${set.script}

VISUAL GUIDELINES:
${set.visuals.map((v, i) => `• ${v}`).join('\n')}

AUDIO RECOMMENDATIONS:
${set.audio.map((a, i) => `• ${a}`).join('\n')}

HASHTAGS:
${set.hashtags.join(' ')}
    `;
    navigator.clipboard.writeText(fullContent);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#059669'; // Green
    if (score >= 80) return '#ea580c'; // Orange
    if (score >= 70) return '#7c3aed'; // Purple
    return '#6b7280'; // Gray
  };

  return (
    <div className="single-view">
      
      {/* Compact Header */}
      <div className={`single-view-header fade-in ${animationStage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center space-y-2">
          <h1 className="text-dynamic-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
            AI Content Strategist
          </h1>
          <p className="text-dynamic-base text-gray-400 max-w-3xl mx-auto">
            Chat with AI to generate viral content strategies for your products
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="single-view-content grid grid-cols-12 gap-4">
        {/* Chat Interface */}
        <div className={`col-span-12 lg:col-span-6 slide-up ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-gray-700/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-amber-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-dynamic-lg font-semibold text-white">AI Content Strategist</h2>
                <p className="text-dynamic-sm text-gray-400">Online • Ready to create viral content</p>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg text-dynamic-sm ${
                      message.isUser 
                        ? 'bg-violet-500/20 text-white border border-violet-500/30 rounded-br-none' 
                        : 'bg-gray-800/50 text-white border border-gray-700/50 rounded-bl-none'
                    }`}>
                      {message.isTyping ? (
                        <Progress value={70} className="w-[100px] h-2 bg-gray-700" /> 
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                    {message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700/50 flex items-end gap-3">
              {image && (
                <div className="flex items-center gap-2 text-dynamic-sm text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                  <ImageIcon className="h-4 w-4" />
                  <span>{image.name}</span>
                  <button onClick={() => setImage(null)} className="text-gray-400 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-violet-400"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Textarea
                placeholder="Describe your product, target audience, and goals..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                maxRows={3}
                disabled={isLoading}
                className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 resize-none min-h-[40px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="btn-primary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className={`col-span-12 lg:col-span-6 slide-up ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          {results.length > 0 && (
            <div className="mb-6">
              <h2 className="text-dynamic-lg font-bold text-white flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Generated Content Strategies
              </h2>
              <p className="text-dynamic-sm text-gray-400">5 unique strategies ranked by predicted engagement. Click to expand each set.</p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((set, index) => (
              <Collapsible
                key={set.id}
                open={expandedSet === set.id}
                onOpenChange={() => setExpandedSet(expandedSet === set.id ? null : set.id)}
                className="compact-card"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: `linear-gradient(45deg, ${getScoreColor(set.score)}, ${getScoreColor(set.score)}90)` }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-dynamic-base font-semibold text-white">Strategy Set {index + 1}</h3>
                      <p className="text-dynamic-sm text-gray-400">Hooks • Script • Visuals • Audio • Hashtags</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-dynamic-sm font-bold px-3 py-1 rounded-full"
                      style={{
                        background: `${getScoreColor(set.score)}20`,
                        color: getScoreColor(set.score),
                        border: `1px solid ${getScoreColor(set.score)}40`,
                      }}
                    >
                      {set.score}/100
                    </span>
                    <p className="text-dynamic-sm text-gray-400 mt-1">Engagement Score</p>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hooks Section */}
                    <div className="compact-card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-dynamic-base font-semibold text-white flex items-center gap-2">
                          <Zap className="h-4 w-4 text-violet-400" />
                          Hooks
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(set.hooks.join('\n'))} className="text-gray-400 hover:text-white">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {set.hooks.map((hook, hookIndex) => (
                          <div key={hookIndex} className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-dynamic-sm text-white">
                            "{hook}"
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Script Section */}
                    <div className="compact-card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-dynamic-base font-semibold text-white flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-400" />
                          Script Structure
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(set.script)} className="text-gray-400 hover:text-white">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-dynamic-sm text-white">
                        <p className="leading-relaxed">{set.script}</p>
                      </div>
                    </div>

                    {/* Visuals Section */}
                    <div className="compact-card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-dynamic-base font-semibold text-white flex items-center gap-2">
                          <Palette className="h-4 w-4 text-orange-400" />
                          Visual Guidelines
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(set.visuals.join('\n'))} className="text-gray-400 hover:text-white">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {set.visuals.map((visual, visualIndex) => (
                          <div key={visualIndex} className="flex items-start gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-dynamic-sm text-white">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p>{visual}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Audio Section */}
                    <div className="compact-card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-dynamic-base font-semibold text-white flex items-center gap-2">
                          <Music className="h-4 w-4 text-blue-400" />
                          Audio Recommendations
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(set.audio.join('\n'))} className="text-gray-400 hover:text-white">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {set.audio.map((audio, audioIndex) => (
                          <div key={audioIndex} className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-dynamic-sm text-white">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p>{audio}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags Section */}
                    <div className="col-span-full compact-card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-dynamic-base font-semibold text-white flex items-center gap-2">
                          <Hash className="h-4 w-4 text-cyan-400" />
                          Recommended Hashtags
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(set.hashtags.join(' '))} className="text-gray-400 hover:text-white">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {set.hashtags.map((tag, tagIndex) => (
                          <button
                            key={tagIndex}
                            onClick={() => copyToClipboard(tag)}
                            className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-dynamic-sm border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-full flex flex-col sm:flex-row justify-between gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => copyFullSet(set)}
                        className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="border-violet-500 text-violet-400 hover:bg-violet-500/10"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          className="btn-primary"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Use Strategy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {results.length > 0 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setResults([]);
                  setExpandedSet(null);
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    text: "Great! Let's create new strategies. What other product or angle would you like to explore?",
                    isUser: false,
                    timestamp: new Date()
                  }]);
                }}
                className="border-white/20 text-white hover:bg-white/5"
              >
                <Refresh className="h-4 w-4 mr-2" />
                Generate New Strategies
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 