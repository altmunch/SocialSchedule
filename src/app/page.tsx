import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  Clock3,
  Hash,
  Music,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  // Aliases
  Clock3 as Clock3Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Feature Icons with gradient
const FeatureIcon = ({ 
  icon: Icon, 
  className 
}: { 
  icon: React.ElementType, 
  className?: string 
}) => (
  <div className={cn("flex items-center justify-center w-full h-full", className)}>
    <Icon className="h-6 w-6 text-white" />
  </div>
);

const defaultPlans = [
  {
    id: 'dominator-pro',
    name: 'Dominator Pro',
    amount: 29700, // $297.00
    interval: 'month',
    currency: 'usd',
    description: 'For elite individuals & influencers',
    popular: true,
    features: [
      'AI "Hook Hunter" with viral swipe file',
      '48-hour early trend alerts',
      'Engagement Energy Score dashboard',
      '1-hour monthly strategy call',
      'Priority AI caption & hashtag generation'
    ],
  },
  {
    id: 'dominator-team',
    name: 'Dominator Team',
    amount: 99700, // $997.00
    interval: 'month',
    currency: 'usd',
    description: 'For small teams & power agencies',
    features: [
      'Everything in Pro',
      '3 seats included (+$199/user)',
      'White-label reporting',
      'Competitor content spy tool',
      'Dedicated Slack support',
      'Bi-weekly trend deep dives'
    ],
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use default plans instead of fetching from Supabase
  const plans = defaultPlans;

  return (
    <div className="flex min-h-screen flex-col bg-dominator-black">
      <Navbar />
      <Hero />
      
      {/* Social Proof & Results */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-b from-dominator-black to-dominator-dark/80">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-dominator-dark/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background)))]"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 bg-dominator-blue/10 text-dominator-blue hover:bg-dominator-blue/20 border border-dominator-blue/20">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              <span>Trusted by 10,000+ creators</span>
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-dominator-light sm:text-5xl glow-text">
              Real Results, <span className="gradient-text">Real Growth</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join thousands of creators and businesses already <span className="font-medium text-white">dominating</span> social media
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { 
                icon: TrendingUp, 
                stat: '30%+', 
                label: 'Increase in view duration',
                highlight: 'Higher watch time'
              },
              { 
                icon: Users, 
                stat: '2x', 
                label: 'Follower growth',
                highlight: 'Faster than average'
              },
              { 
                icon: Zap, 
                stat: '3x', 
                label: 'Engagement Energy Score',
                highlight: 'Viral potential'
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="relative p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 text-center group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-magenta-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative z-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-magenta-400 p-3 text-white mb-4 shadow-lg shadow-cyan-500/30">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{item.stat}</p>
                  <p className="text-sm font-medium text-gray-400">{item.label}</p>
                  <p className="mt-2 text-xs text-cyan-400 font-medium">{item.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Dominator Loop */}
      <div className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span>Proprietary Technology</span>
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The <span className="gradient-text">Dominator Loop</span>™
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Our proprietary 4-step system that guarantees social media growth
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-12">
              {[
                {
                  step: '01',
                  title: 'Performance Pulse',
                  icon: BarChart2,
                  description: 'AI scans past posts to identify best-performing content, optimal posting times, and audience engagement patterns.',
                  highlight: 'Proprietary metric: "Engagement Energy Score" measuring virality potential',
                  gradient: 'from-cyan-500 to-cyan-600'
                },
                {
                  step: '02',
                  title: 'AI SEO Alchemist',
                  icon: Hash,
                  description: 'Auto-generates captions with high-traffic keywords and predicts trending hashtags before they peak.',
                  highlight: 'Tests 3 caption variations per post to maximize engagement',
                  gradient: 'from-green-500 to-cyan-500'
                },
                {
                  step: '03',
                  title: 'Sonic Boom',
                  icon: Music,
                  description: 'Detects rising audios in your niche 48 hours before they trend, suggesting sounds based on similar creators\' success.',
                  highlight: 'Emotional trigger analysis for maximum engagement',
                  gradient: 'from-purple-500 to-magenta-500'
                },
                {
                  step: '04',
                  title: 'Hook Hunter',
                  icon: BookOpen,
                  description: 'Generates 5 hooks per post using proven templates and analyzes competitor hooks to create irresistible content.',
                  highlight: 'Learns from your top-performing hooks',
                  gradient: 'from-amber-500 to-pink-500'
                }
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
                    <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-${item.gradient.split(' ')[0]}/20`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="mt-4 sm:mt-0 flex-1">
                      <div className="flex items-center">
                        <span className="bg-gradient-to-r from-dominator-blue to-dominator-magenta bg-clip-text text-transparent">30X</span> their engagement
                        <span className="text-sm font-medium text-gray-400">{item.step}</span>
                        <div className="ml-4 h-px flex-1 bg-gradient-to-r from-gray-700/50 to-gray-700/0"></div>
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-gray-300">{item.description}</p>
                      <div className="mt-3 inline-flex items-center text-sm font-medium text-cyan-400">
                        <span>{item.highlight}</span>
                        <ArrowUpRight className="ml-1.5 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="absolute left-8 top-full h-8 w-0.5 bg-gradient-to-b from-cyan-500/30 to-transparent -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="relative py-24 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              <span>Simple, Transparent Pricing</span>
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose Your <span className="gradient-text">Dominator</span> Plan
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Scale your social media dominance. Cancel or switch plans anytime.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
            {plans.map((item, index) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              Need a custom plan for your team?{' '}
              <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300">
                Contact sales
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* Features */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Powerful Features
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to dominate social media
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform combines AI intelligence with powerful automation to maximize your social media impact
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  icon: <Calendar className="h-6 w-6 text-indigo-600" />,
                  title: 'AI-Powered Scheduling',
                  description: 'Algorithm that determines optimal posting times based on platform-specific analytics and automatically queues content'
                },
                {
                  icon: <BarChart2 className="h-6 w-6 text-indigo-600" />,
                  title: 'Visual Content Calendar',
                  description: 'Drag-and-drop interface showing scheduled posts across platforms with color-coding by status/platform'
                },
                {
                  icon: <Zap className="h-6 w-6 text-indigo-600" />,
                  title: 'Platform Customization',
                  description: 'Tailor a single post for different platforms (adjusting text length, hashtags, image dimensions)'
                },
                {
                  icon: <BarChart2 className="h-6 w-6 text-indigo-600" />,
                  title: 'Analytics Dashboard',
                  description: 'Simple metrics display showing post performance, engagement rates, and best performing content types'
                },
                {
                  icon: <Clock3 className="h-6 w-6 text-indigo-600" />,
                  title: 'Queue Management',
                  description: 'Easily review, edit and rearrange pending posts before they go live'
                },
                {
                  icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
                  title: 'Performance Guarantee',
                  description: 'Next month free if there has not been improvement in your metrics'
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    {feature.icon}
                    {feature.title}
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-700">
        <div className="mx-auto max-w-2xl py-16 px-6 text-center sm:py-20 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dominate social media?</span>
            <span className="block">Start your 14-day free trial today.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
            Join thousands of creators and businesses growing their audience with our AI-powered platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#pricing"
              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-dominator-blue to-dominator-magenta px-6 py-3 text-sm font-semibold text-dominator-black shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Get Started Free</span>
              <span className="absolute inset-0 bg-gradient-to-r from-dominator-blue/0 via-white/20 to-dominator-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>
            <a 
              href="#how-it-works" 
              className="group flex items-center text-sm font-semibold leading-6 text-dominator-light hover:text-dominator-blue transition-colors"
            >
              See how it works
              <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
