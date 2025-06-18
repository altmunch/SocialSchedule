'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, Calendar, ArrowRight, DollarSign, Users, TrendingUp, CheckCircle, Timer } from 'lucide-react';

export default function SimplifiedLanding() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-6 bg-slate-800">
        <div className="text-2xl font-bold text-white">ClipsCommerce</div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild className="text-white hover:bg-slate-800 border-white">
            <a href="/sign-in">Sign In</a>
          </Button>
          <Button asChild className="bg-orange-500 text-white hover:bg-orange-500 border-0">
            <a href="/sign-up">Get Started</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center bg-slate-800 text-white py-20 px-4">
        <div className="bg-orange-500 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 mb-6">
          <Timer className="h-4 w-4" />
          <span className="text-sm font-semibold">
            LIMITED TIME: {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')}:
            {timeLeft.seconds.toString().padStart(2, '0')} Left!
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Go Viral. Sell More. Save Hours.
        </h1>
        <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto text-white/90">
          Instantly generate viral content ideas, optimize for reach, and autopost everywhere—no guesswork, no burnout.
        </p>
        <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-500 text-lg px-8 py-4 font-semibold shadow-lg mb-4" asChild>
          <a href="/sign-up">
            <DollarSign className="mr-2 h-5 w-5" />
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </Button>
        <div className="text-sm text-white/70">Cancel anytime. 30-day money-back guarantee.</div>
      </section>

      {/* Social Proof Numbers */}
      <section className="w-full bg-white py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-orange-500">47K+</div>
            <div className="text-sm text-slate-800">Happy Creators</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-orange-500">$2.3M</div>
            <div className="text-sm text-slate-800">Revenue Generated</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-orange-500">340%</div>
            <div className="text-sm text-slate-800">Avg Growth Rate</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-orange-500">98.7%</div>
            <div className="text-sm text-slate-800">Success Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border border-slate-100 shadow-sm">
            <Lightbulb className="h-10 w-10 text-orange-500 mb-4" />
            <h3 className="font-bold text-xl mb-2 text-slate-800">Viral Ideas</h3>
            <p className="text-slate-800 text-base">AI suggests proven hooks and scripts that drive sales—not just likes.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border border-slate-100 shadow-sm">
            <Sparkles className="h-10 w-10 text-orange-500 mb-4" />
            <h3 className="font-bold text-xl mb-2 text-slate-800">AI Optimization</h3>
            <p className="text-slate-800 text-base">Descriptions, hashtags, and formats that get you seen and shared—automatically.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border border-slate-100 shadow-sm">
            <Calendar className="h-10 w-10 text-orange-500 mb-4" />
            <h3 className="font-bold text-xl mb-2 text-slate-800">Autoposting</h3>
            <p className="text-slate-800 text-base">Schedule once. Post everywhere. Grow while you sleep.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-slate-800 text-white py-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Go Viral?</h2>
        <p className="text-lg mb-8 text-white/90">Join 47,000+ creators using ClipsCommerce to grow sales and save time.</p>
        <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-500 text-lg px-8 py-4 font-semibold shadow-lg" asChild>
          <a href="/sign-up">
            <DollarSign className="mr-2 h-5 w-5" />
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </Button>
        <div className="text-sm text-white/70 mt-4">Cancel anytime. 30-day money-back guarantee.</div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-slate-800 text-white py-6 text-center text-xs">
        © 2024 ClipsCommerce. All rights reserved.
      </footer>
    </div>
  );
}