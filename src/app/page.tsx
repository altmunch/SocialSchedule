import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  BarChart3,
  ListChecks,
} from "lucide-react";

const defaultPlans = [
  {
    id: 'free-plan',
    name: 'Free',
    amount: 0,
    interval: 'month',
    currency: 'usd',
    description: 'Perfect for getting started',
    features: [
      'Basic scheduling features',
      'Up to 5 meetings per month',
      'Email notifications',
    ],
  },
  {
    id: 'pro-plan',
    name: 'Pro',
    amount: 1500, // $15.00
    interval: 'month',
    currency: 'usd',
    description: 'Best for professionals',
    popular: true,
    features: [
      'All Free features',
      'Unlimited meetings',
      'Custom branding',
      'Advanced analytics',
      'Priority support',
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
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the perfect plan for your scheduling needs
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {plans.map((item) => (
            <PricingCard key={item.id} item={item} user={user} />
          ))}
        </div>
      </div>
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for efficient scheduling
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Streamline your scheduling process with our comprehensive feature set
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Calendar className="h-5 w-5 flex-none text-indigo-600" />
                Smart Calendar Integration
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Seamlessly sync with your existing calendars for efficient scheduling
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Clock className="h-5 w-5 flex-none text-indigo-600" />
                Automated Time Management
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Let our AI handle the complexities of time zone management and scheduling conflicts
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Sparkles className="h-5 w-5 flex-none text-indigo-600" />
                AI-Powered Optimization
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Intelligent scheduling suggestions based on your preferences and patterns
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Layers className="h-5 w-5 flex-none text-indigo-600" />
                Multi-Platform Support
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Access your schedule from any device with our cross-platform compatibility
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <BarChart3 className="h-5 w-5 flex-none text-indigo-600" />
                Analytics Dashboard
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Gain insights into your scheduling patterns with detailed analytics
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <ListChecks className="h-5 w-5 flex-none text-indigo-600" />
                Custom Workflows
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Create personalized scheduling workflows that match your needs
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <Footer />
    </main>
  );
}
