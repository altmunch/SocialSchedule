"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export default function IdeatorPage() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      // Simulate API call to content generator workflow
      await new Promise((res) => setTimeout(res, 2000));
      setResults({
        hooks: [
          "Unlock the secret to viral growth for your product!",
          "Why everyone is talking about this new solution...",
        ],
        script: "Start with a bold claim, show proof, end with a call to action.",
        visuals: ["Show product in action", "Use bold colors"],
        audio: ["Upbeat background music", "Clear voiceover"],
        guidelines: "Emphasize the unique value of your product. Keep it concise and visual.",
      });
    } catch (err: any) {
      setError("Failed to generate content ideas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background text-text flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-creative">Content Idea Generator</h1>
        <p className="text-secondaryText">Describe your product or service to generate content ideas and templates.</p>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Describe your product or service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your product or service in detail... Include features, benefits, target audience, and what makes it unique. The more details you provide, the better content ideas we can generate for you."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              disabled={loading}
              className="w-full min-h-[200px] text-base leading-relaxed p-6 rounded-xl border-2 border-border focus:border-primary resize-none"
            />
          </div>
          <div className="flex items-center gap-4 pt-4">
            <label className="flex items-center cursor-pointer">
              <Upload className="h-5 w-5 mr-2" />
              <span>Attach image</span>
              <Input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={loading} />
            </label>
            {image && <span className="text-xs text-secondaryText">{image.name}</span>}
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <Button onClick={handleGenerate} disabled={loading || !description} className="w-full h-12 text-lg">
            {loading ? "Generating..." : "Generate Ideas"}
          </Button>
        </CardFooter>
      </Card>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {results && (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hooks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.hooks.map((hook: string, i: number) => (
                    <li key={i} className="bg-gray-50 p-2 rounded text-sm flex justify-between items-center">
                      {hook}
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(hook)}>
                        Copy
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Script</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-2 rounded text-sm mb-2">{results.script}</div>
                <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(results.script)}>
                  Copy
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Visuals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.visuals.map((v: string, i: number) => (
                    <li key={i} className="bg-gray-50 p-2 rounded text-sm flex justify-between items-center">
                      {v}
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(v)}>
                        Copy
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.audio.map((a: string, i: number) => (
                    <li key={i} className="bg-gray-50 p-2 rounded text-sm flex justify-between items-center">
                      {a}
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(a)}>
                        Copy
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 bg-panel rounded-lg p-6 shadow-md border border-border">
            <h3 className="text-lg font-semibold mb-2">General Guidelines</h3>
            <div className="text-sm mb-2">{results.guidelines}</div>
            <div className="flex gap-4 mt-2">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}>Copy All</Button>
              <Button variant="outline">Save in Library</Button>
              <Button variant="outline">Share</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 