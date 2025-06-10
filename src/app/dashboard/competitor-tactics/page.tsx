"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function CompetitorTacticsPage() {
  const [competitor, setCompetitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      // Simulate API call to competitor tactics workflow
      await new Promise((res) => setTimeout(res, 2000));
      setResults({
        hooks: ["How X brand doubled engagement in 30 days", "The secret behind Y's viral campaign"],
        strategies: ["Consistent posting at peak hours", "Leveraging trending audio"],
        insights: ["Competitor focuses on short, high-energy videos", "Frequent use of call-to-action overlays"],
      });
    } catch (err: any) {
      setError("Failed to analyze competitor tactics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background text-text flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-creative">Competitor Tactics</h1>
        <p className="text-secondaryText">Analyze and visualize competitor strategies, hooks, and actionable insights.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Enter a competitor or select from the list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Competitor name or handle..."
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleAnalyze} disabled={loading || !competitor} className="w-full">
            {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Analyzing...</> : "Analyze"}
          </Button>
        </CardContent>
      </Card>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {results && (
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Hooks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.hooks.map((hook: string, i: number) => (
                  <li key={i} className="bg-gray-50 p-2 rounded text-sm">{hook}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.strategies.map((s: string, i: number) => (
                  <li key={i} className="bg-gray-50 p-2 rounded text-sm">{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.insights.map((ins: string, i: number) => (
                  <li key={i} className="bg-gray-50 p-2 rounded text-sm">{ins}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 