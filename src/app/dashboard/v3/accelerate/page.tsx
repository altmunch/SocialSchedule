'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadCloud,
  Video,
  FileText,
  Hash,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Edit,
  Save,
  Trash2,
  ArrowLeftRight,
} from 'lucide-react';

interface VideoOptimizationResult {
  id: string;
  originalTitle: string;
  originalDescription: string;
  originalHashtags: string;
  optimizedTitle: string;
  optimizedDescription: string;
  optimizedHashtags: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  recommendations: string[];
}

export default function AcceleratePage() {
  const [videos, setVideos] = useState<File[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<VideoOptimizationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedHashtags, setEditedHashtags] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('video/'));
    if (files.length + videos.length > 30) {
      alert('You can only upload up to 30 videos at once.');
      return;
    }
    setVideos(prev => [...prev, ...files]);
  }, [videos]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('video/'));
    if (files.length + videos.length > 30) {
      alert('You can only upload up to 30 videos at once.');
      return;
    }
    setVideos(prev => [...prev, ...files]);
  }, [videos]);

  const handleOptimizeVideos = async () => {
    if (videos.length === 0) return;

    setIsProcessing(true);
    setGlobalProgress(0);
    setOptimizationResults([]);

    let completedCount = 0;
    const totalVideos = videos.length;

    for (const video of videos) {
      const videoId = `${video.name}-${Date.now()}`;
      setOptimizationResults(prev => [
        ...prev,
        {
          id: videoId,
          originalTitle: `Original Title for ${video.name}`,
          originalDescription: `This is the original description for ${video.name}. It might be too short or lack relevant keywords.`,
          originalHashtags: `#original #video #content`,
          optimizedTitle: '',
          optimizedDescription: '',
          optimizedHashtags: '',
          progress: 0,
          status: 'pending',
          recommendations: [],
        }
      ]);

      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 500)); // Initial delay

      setOptimizationResults(prev => prev.map(res =>
        res.id === videoId ? { ...res, status: 'processing' } : res
      ));

      // Simulate progress for description and hashtags
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setOptimizationResults(prev => prev.map(res =>
          res.id === videoId ? { ...res, progress: p } : res
        ));
      }

      const mockRecommendations = [
        `Consider adding more action verbs in the description for ${video.name}.`,
        `Explore trending audio for videos similar to ${video.name} to boost reach.`,
        `Optimize thumbnail for better click-through rate.`
      ];

      setOptimizationResults(prev => prev.map(res =>
        res.id === videoId ? {
          ...res,
          optimizedTitle: `AI Optimized Title for ${video.name} - Boosted Engagement!`,
          optimizedDescription: `This is the AI-generated, highly optimized description for ${video.name}. It now includes strong calls to action, relevant long-tail keywords, and addresses the target audience's pain points. This content is designed to convert!`,
          optimizedHashtags: `#EcommOptimize #ViralContent #${video.name.replace(/\s/g, '')}AI #GrowthHack`,
          status: 'completed',
          recommendations: mockRecommendations,
        } : res
      ));
      completedCount++;
      setGlobalProgress(Math.floor((completedCount / totalVideos) * 100));
    }
    setIsProcessing(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedVideoId(expandedVideoId === id ? null : id);
  };

  const handleEdit = (result: VideoOptimizationResult) => {
    setEditingVideoId(result.id);
    setEditedTitle(result.optimizedTitle);
    setEditedDescription(result.optimizedDescription);
    setEditedHashtags(result.optimizedHashtags);
  };

  const handleSaveEdit = (id: string) => {
    setOptimizationResults(prev => prev.map(res =>
      res.id === id ? {
        ...res,
        optimizedTitle: editedTitle,
        optimizedDescription: editedDescription,
        optimizedHashtags: editedHashtags,
      } : res
    ));
    setEditingVideoId(null);
  };

  const handleCancelEdit = () => {
    setEditingVideoId(null);
  };

  const handleRemoveVideo = (fileToRemove: File) => {
    setVideos(prev => prev.filter(video => video !== fileToRemove));
    setOptimizationResults(prev => prev.filter(result => !result.id.startsWith(fileToRemove.name)));
  };

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            Algorithm Optimization
          </h1>
          <p className="text-slate-400 text-lg">
            Supercharge your videos with AI-driven descriptions, hashtags, and titles.
          </p>
        </div>

        {/* Video Upload Section */}
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <UploadCloud className="h-6 w-6 text-indigo-400" /> Upload Videos (Up to 30)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Drag and drop your video files here, or click to select.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-700/30"
            >
              <Input
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileInputChange}
                ref={fileInputRef}
                className="hidden"
                disabled={isProcessing}
              />
              <UploadCloud className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <p className="text-lg font-medium text-gray-400">Drag & Drop Videos Here</p>
              <p className="text-sm text-gray-500">or click to browse files</p>
              {videos.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-semibold text-white mb-2">{videos.length} videos selected:</p>
                  <ul className="space-y-1">
                    {videos.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm text-slate-300 bg-gray-700 p-2 rounded">
                        <span className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-blue-400" /> {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleRemoveVideo(file); }}
                          className="text-red-400 hover:bg-red-500/20"
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button
              onClick={handleOptimizeVideos}
              disabled={videos.length === 0 || isProcessing}
              className="mt-6 w-full btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Optimizing Videos ({globalProgress}%)
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Start AI Optimization
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Optimization Results Section */}
        {optimizationResults.length > 0 && (
          <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-400" /> Optimization Results
              </CardTitle>
              <CardDescription className="text-slate-400">
                Review and fine-tune your AI-optimized video details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {optimizationResults.map((result) => (
                <div key={result.id} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => toggleExpand(result.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-white">{result.originalTitle.split('Original Title for ')[1]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'processing' && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                          <span className="text-sm text-indigo-400">Processing ({result.progress}%)</span>
                        </>
                      )}
                      {result.status === 'completed' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400">Completed</span>
                        </>
                      )}
                      {result.status === 'error' && (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-400">Error</span>
                        </>
                      )}
                      {expandedVideoId === result.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedVideoId === result.id && (
                    <div className="p-4 border-t border-gray-700">
                      <Tabs defaultValue="optimized" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 mb-4">
                          <TabsTrigger value="original" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Original</TabsTrigger>
                          <TabsTrigger value="optimized" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Optimized & AI</TabsTrigger>
                        </TabsList>
                        <TabsContent value="original" className="space-y-4">
                          <h4 className="text-lg font-semibold text-white">Original Content Details</h4>
                          <div className="space-y-2">
                            <label className="text-slate-400 text-sm">Title</label>
                            <Input value={result.originalTitle} readOnly className="bg-gray-700 border-gray-600 text-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-slate-400 text-sm">Description</label>
                            <Textarea value={result.originalDescription} readOnly rows={4} className="bg-gray-700 border-gray-600 text-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-slate-400 text-sm">Hashtags</label>
                            <Input value={result.originalHashtags} readOnly className="bg-gray-700 border-gray-600 text-slate-200" />
                          </div>
                        </TabsContent>
                        <TabsContent value="optimized" className="space-y-4">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-emerald-400" /> AI Optimized Content
                          </h4>
                          {editingVideoId === result.id ? (
                            <>
                              <div className="space-y-2">
                                <label htmlFor={`edit-title-${result.id}`} className="text-slate-400 text-sm">Title</label>
                                <Input
                                  id={`edit-title-${result.id}`}
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor={`edit-description-${result.id}`} className="text-slate-400 text-sm">Description</label>
                                <Textarea
                                  id={`edit-description-${result.id}`}
                                  value={editedDescription}
                                  onChange={(e) => setEditedDescription(e.target.value)}
                                  rows={4}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor={`edit-hashtags-${result.id}`} className="text-slate-400 text-sm">Hashtags</label>
                                <Input
                                  id={`edit-hashtags-${result.id}`}
                                  value={editedHashtags}
                                  onChange={(e) => setEditedHashtags(e.target.value)}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={handleCancelEdit} className="text-slate-400 border-slate-700 hover:bg-slate-700">
                                  Cancel
                                </Button>
                                <Button onClick={() => handleSaveEdit(result.id)} className="btn-primary">
                                  <Save className="h-4 w-4 mr-2" /> Save Changes
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <label className="text-slate-400 text-sm">Title</label>
                                <Input value={result.optimizedTitle} readOnly className="bg-gray-700 border-gray-600 text-slate-200" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-slate-400 text-sm">Description</label>
                                <Textarea value={result.optimizedDescription} readOnly rows={4} className="bg-gray-700 border-gray-600 text-slate-200" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-slate-400 text-sm">Hashtags</label>
                                <Input value={result.optimizedHashtags} readOnly className="bg-gray-700 border-gray-600 text-slate-200" />
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={() => handleEdit(result)} className="btn-secondary flex items-center gap-2">
                                  <Edit className="h-4 w-4" /> Edit
                                </Button>
                              </div>
                            </>
                          )}

                          {/* AI Recommendations */}
                          {result.recommendations.length > 0 && (
                            <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                              <h5 className="text-md font-semibold text-indigo-300 flex items-center gap-2 mb-3">
                                <Lightbulb className="h-4 w-4" /> AI Recommendations for further improvement
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                {result.recommendations.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && optimizationResults.length > 0 && (
                <div className="text-center mt-4">
                  <Progress value={globalProgress} className="w-full h-2 bg-gray-700" indicatorColor="bg-indigo-500" />
                  <p className="text-sm text-slate-400 mt-2">Overall Progress: {globalProgress}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
