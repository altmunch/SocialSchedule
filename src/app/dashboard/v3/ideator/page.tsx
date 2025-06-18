"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Copy, Save, Share, Lightbulb, Brain, Zap, Image as ImageIcon, Video, Hash, Mic, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContentIdeaSet {
  id: string;
  hooks: string[];
  script: string;
  visuals: string[];
  audio: string[];
}

export default function IdeatorPage() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ContentIdeaSet[]>([]); // Array of idea sets
  const [expandedIdeaSet, setExpandedIdeaSet] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      await new Promise((res) => setTimeout(res, 2000));

      const generatedSets: ContentIdeaSet[] = Array.from({ length: 5 }).map((_, index) => ({
        id: `set-${index + 1}`,
        hooks: [
          `AI Hook ${index + 1}: Grab attention for your product with a bold statement!`, 
          `AI Hook ${index + 1}: Problem-solution hook for your target audience.`,
        ],
        script: `AI Script ${index + 1}: This structured script includes an introduction, problem statement, product demonstration, benefits, and a strong call to action for your product. It's designed for maximum conversion and virality, leveraging current trends and psychological triggers.`, // More detailed script
        visuals: [
          `AI Visual ${index + 1}: Dynamic product shots with animated overlays.`,
          `AI Visual ${index + 1}: Engaging b-roll footage of product in use.`,
          `AI Visual ${index + 1}: Testimonials or user-generated content.`,
        ],
        audio: [
          `AI Audio ${index + 1}: Upbeat, trending background music (e.g., electronic pop).`,
          `AI Audio ${index + 1}: Clear, enthusiastic voiceover.`,
        ],
      }));
      setResults(generatedSets);

    } catch (err: any) {
      setError("Failed to generate content ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllResults = (ideaSet: ContentIdeaSet) => {
    const allContent = `
HOOKS:
${ideaSet.hooks.map((hook: string, i: number) => `${i + 1}. ${hook}`).join('\n')}

SCRIPT STRUCTURE:
${ideaSet.script}

VISUAL GUIDELINES:
${ideaSet.visuals.map((v: string, i: number) => `• ${v}`).join('\n')}

AUDIO SUGGESTIONS:
${ideaSet.audio.map((a: string, i: number) => `• ${a}`).join('\n')}
      `;
    navigator.clipboard.writeText(allContent);
  };

  const toggleIdeaSetExpand = (id: string) => {
    setExpandedIdeaSet(expandedIdeaSet === id ? null : id);
  };

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
          AI Content Strategist
        </h1>
        <p className="text-slate-400 text-lg">
          Generate viral-ready content ideas, scripts, and visuals with AI-powered creativity.
        </p>
      </div>

      {/* Input Section (Chatbot Style) */}
      <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl mb-8">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-400" /> Describe Your Content Needs
          </CardTitle>
          <CardDescription className="text-slate-400">
            Tell the AI about your product, target audience, and content goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <Textarea
            placeholder="e.g., I need ideas for a TikTok campaign for a new sustainable skincare line. Target audience is Gen Z. Goal is brand awareness and website traffic. Focus on product benefits like eco-friendly ingredients and cruelty-free." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            disabled={loading}
            className="w-full text-base leading-relaxed p-4 rounded-lg border border-gray-700 bg-gray-700/50 text-white placeholder-gray-500 focus:border-indigo-500 resize-none"
          />
          
          <div className="flex items-center gap-6">
            <label className="flex items-center cursor-pointer">
              <Button variant="outline" className="btn-secondary flex items-center gap-2" disabled={loading}>
                <Upload className="h-4 w-4" /> Attach Image
              </Button>
              <Input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
                disabled={loading} 
              />
            </label>
            {image && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                <ImageIcon className="h-4 w-4" />
                <span>{image.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !description.trim()} 
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" /> Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="h-5 w-5" /> Generate Content Ideas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Your AI-Generated Strategies</h2>
            <p className="text-slate-400">Explore multiple viral content ideas tailored for your needs.</p>
          </div>
          
          {results.map((ideaSet, index) => (
            <Collapsible 
              key={ideaSet.id} 
              open={expandedIdeaSet === ideaSet.id}
              onOpenChange={() => toggleIdeaSetExpand(ideaSet.id)}
              className="compact-card p-6 mb-4"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer pb-4 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" /> Content Idea Set {index + 1}
                </h3>
                {expandedIdeaSet === ideaSet.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-6">
                {/* Hooks Section */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-400" /> Hooks
                  </h4>
                  <ul className="space-y-2">
                    {ideaSet.hooks.map((hook: string, i: number) => (
                      <li key={i} className="p-3 bg-gray-700/50 rounded-lg text-sm text-slate-300 border border-gray-700 relative group">
                        "{hook}"
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={() => copyToClipboard(hook)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Script Section */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Video className="h-5 w-5 text-blue-400" /> Script Structure
                  </h4>
                  <div className="p-4 bg-gray-700/50 rounded-lg text-sm text-slate-300 border border-gray-700 relative group leading-relaxed">
                    {ideaSet.script}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                      onClick={() => copyToClipboard(ideaSet.script)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Visuals Section */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-emerald-400" /> Visual Guidelines
                  </h4>
                  <ul className="space-y-2">
                    {ideaSet.visuals.map((visual: string, i: number) => (
                      <li key={i} className="p-3 bg-gray-700/50 rounded-lg text-sm text-slate-300 border border-gray-700 relative group">
                        {visual}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={() => copyToClipboard(visual)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Audio Section */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Mic className="h-5 w-5 text-orange-400" /> Audio Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {ideaSet.audio.map((audio: string, i: number) => (
                      <li key={i} className="p-3 bg-gray-700/50 rounded-lg text-sm text-slate-300 border border-gray-700 relative group">
                        {audio}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={() => copyToClipboard(audio)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => copyAllResults(ideaSet)} className="btn-secondary flex items-center gap-2">
                    <Copy className="h-5 w-5" />
                    Copy All from Set {index + 1}
                  </Button>
                  <Button className="btn-primary flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    Export Set {index + 1}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Global Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button className="btn-secondary flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save All Strategies
            </Button>
            <Button className="btn-primary flex items-center gap-2">
              <Share className="h-5 w-5" />
              Export All to Campaign
            </Button>
          </div>

        </div>
      )}
    </div>
  );
} 