'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowRight, Upload, FileText, Volume2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type OptimizationResult = {
  original: string;
  optimized: string;
  improvements: string[];
  hashtags: string[];
};

export default function AccelerateComponent() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState('text');

  const handleOptimize = async () => {
    if (!content.trim()) {
      setError('Please enter content to optimize');
      return;
    }

    setIsOptimizing(true);
    setError(null);
    
    try {
      // In a real implementation, this would connect to an AI service
      // For demo purposes, we'll simulate a successful optimization after a delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate optimization results
      const mockResult: OptimizationResult = {
        original: content,
        optimized: content.length > 100 
          ? `${content}\n\nBut wait, there's more! 🚀 [AI-enhanced content with better hooks and flow]` 
          : `✨ ${content} ✨\n\n[AI-enhanced version with better engagement]`,
        improvements: [
          "Added stronger hooks to capture attention",
          "Improved readability with better sentence structure",
          "Enhanced emotional appeal",
          "Optimized call-to-action for better conversion"
        ],
        hashtags: ["#ContentCreator", "#DigitalMarketing", "#SocialMediaTips", "#ContentStrategy", "#ViralContent"]
      };
      
      setResult(mockResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred during optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accelerate</h1>
        <p className="text-gray-500">Optimize your content for maximum engagement</p>
      </div>

      <Tabs defaultValue="text" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="h-4 w-4 mr-2" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Optimization</CardTitle>
              <CardDescription>
                Enhance your written content to increase engagement and conversions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Your Content
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Paste your content here to optimize..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isOptimizing}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {result && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <h3 className="text-lg font-medium">Optimized Content</h3>
                      <div className="mt-2 p-3 bg-blue-50 rounded-md whitespace-pre-line">
                        {result.optimized}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Improvements Made</h3>
                      <ul className="mt-2 space-y-1">
                        {result.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <ArrowRight className="h-3 w-3 mr-2 text-green-500" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Recommended Hashtags</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.hashtags.map((hashtag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {result ? (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    New Optimization
                  </Button>
                  <Button>
                    Save Result
                  </Button>
                </>
              ) : (
                <Button onClick={handleOptimize} disabled={isOptimizing} className="w-full">
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    'Optimize Content'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="audio" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Optimization</CardTitle>
              <CardDescription>
                Enhance your audio content for better clarity and engagement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-md">
                <div className="text-center">
                  <Volume2 className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Audio Optimization</h3>
                  <p className="mt-1 text-sm text-gray-500">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Upload content files for optimization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-md">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">File Upload</h3>
                  <p className="mt-1 text-sm text-gray-500">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
