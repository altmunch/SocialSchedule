'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CreditCard, FileText, Clock, Shield, Check, X } from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  interval: 'monthly' | 'yearly';
  description: string;
  features: string[];
  isPopular?: boolean;
  stripeLinkEnv?: string;
};

export default function SubscriptionComponent({ navigate }: { navigate?: (url: string) => void } = {}) {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<string>('lite'); // Default to Lite plan
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const nav = navigate || ((url: string) => { window.open(url, '_blank'); });

  // Updated pricing structure to match the new schema
  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      price: 20,
      yearlyPrice: 200,
      interval: billingCycle,
      description: 'Essential features to get started.',
      features: [
        'Viral Blitz Cycle Framework (15 uses)',
        'Idea Generator Framework (15 uses)',
        '15 autoposts/month',
        'Basic analytics (no e-commerce)'
      ],
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_LITE_LINK'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 70,
      yearlyPrice: 600,
      interval: billingCycle,
      description: 'Advanced tools for growing businesses.',
      features: [
        'Viral Blitz Cycle Framework',
        'Idea Generator Framework (unlimited)',
        'Unlimited posts',
        '1 set of accounts',
        'E-commerce integration'
      ],
      isPopular: true,
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_PRO_LINK'
    },
    {
      id: 'team',
      name: 'Team',
      price: 500,
      yearlyPrice: 5000,
      interval: billingCycle,
      description: 'Collaborative features for larger teams.',
      features: [
        'Everything in Pro',
        'Manage unlimited accounts',
        'Brand Voice AI (for consistency)',
        'Team collaboration mode',
        'Advanced analytics & reporting'
      ],
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_TEAM_LINK'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    
    if (plan) {
      // For paid plans, redirect to appropriate Stripe checkout
      let stripeLink = '';
      
      if (plan.id === 'lite') {
        stripeLink = billingCycle === 'yearly'
          ? process.env.NEXT_PUBLIC_STRIPE_LITE_YEARLY_LINK || ''
          : process.env.NEXT_PUBLIC_STRIPE_LITE_MONTHLY_LINK || '';
      } else if (plan.id === 'pro') {
        if (billingCycle === 'yearly') {
          stripeLink = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK || '';
        } else {
          stripeLink = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK || '';
        }
      } else if (plan.id === 'team') {
        if (billingCycle === 'yearly') {
          stripeLink = process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK || '';
        } else {
          stripeLink = process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK || '';
        }
        // For team plans, store redirect to team dashboard
        try {
          localStorage.setItem('post_payment_redirect', '/team-dashboard');
        } catch (err) {
          console.error('Failed to set localStorage:', err);
          // Continue execution instead of throwing
        }
      }
      
      if (stripeLink) {
        try {
          nav(stripeLink);
        } catch (err) {
          console.error('Failed to navigate to Stripe:', err);
          // Fallback to updating plan locally
          setActivePlan(planId);
          setSuccessMessage('Navigation failed, but plan selection recorded.');
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      } else {
        // Fallback if env variable not set
        setActivePlan(planId);
        setSuccessMessage('Your subscription plan has been updated successfully.');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }
  };

  const formatPrice = (plan: Plan) => {
    // Lite, Pro, Team are paid plans
    const price = billingCycle === 'yearly' ? plan.yearlyPrice || plan.price : plan.price;
    return `$${price}${billingCycle === 'monthly' ? '/month' : '/year'}`;
  };

  // Mock invoice data
  const invoices = [
    { id: 'INV-001', date: '2025-05-01', amount: '$70.00', status: 'Paid' },
    { id: 'INV-002', date: '2025-04-01', amount: '$70.00', status: 'Paid' },
    { id: 'INV-003', date: '2025-03-01', amount: '$70.00', status: 'Paid' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription plan and billing</p>
      </div>

      <Tabs defaultValue="plans">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">
            <Shield className="h-4 w-4 mr-2" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mb-6">
            <div className="bg-[#1A1A1A] p-1 rounded-full inline-flex items-center border border-[#8D5AFF]/20">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full ${billingCycle === 'monthly' ? 'bg-[#8D5AFF] text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-full ${billingCycle === 'yearly' ? 'bg-[#8D5AFF] text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Yearly
                <Badge 
                  className={`ml-2 px-2 py-0.5 rounded-sm text-xs font-medium`}
                  style={
                    billingCycle === 'yearly'
                      ? { background: 'transparent', border: '1px solid rgba(255,255,255,0.7)', color: 'white' }
                      // Inline styles with !important for inactive state
                      : { 
                          backgroundColor: '#202020 !important', 
                          borderColor: '#353535 !important', 
                          color: 'rgb(156 163 175 / 1) !important', // gray-400
                          borderWidth: '1px !important',
                          borderStyle: 'solid !important'
                        }
                  }
                >
                  30% off
                </Badge>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border ${plan.isPopular ? 'border-[#8D5AFF] shadow-lg shadow-[#8D5AFF]/20' : 'border-[#8D5AFF]/20'} flex flex-col`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <Badge className="bg-[#8D5AFF] text-white">Popular</Badge>
                  </div>
                )}
                <CardHeader className="flex-grow-0">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="min-h-[20px]">{plan.description}</CardDescription>
                  <div className="mt-2 flex flex-col">
                    <div>
                      <span className="text-3xl font-bold">
                        {formatPrice(plan)}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.yearlyPrice && (
                      <div className="mt-1 block">
                        <span className="text-sm text-muted-foreground">
                          {plan.id === 'pro' ? '4 months free' : '2 months free'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-[#00e5a0] mr-2 shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${activePlan === plan.id ? 'bg-[#8D5AFF]/20 text-[#8D5AFF] border-[#8D5AFF]/30 hover:bg-[#8D5AFF]/20 cursor-default' : 'bg-[#8D5AFF] hover:bg-[#8D5AFF]/90 text-white'}`}
                    variant={activePlan === plan.id ? 'outline' : 'default'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={activePlan === plan.id}
                  >
                    {activePlan === plan.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment details and billing address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/2026</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Add Payment Method</Button>
                <Button variant="outline">Edit Billing Address</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Billing Cycle</CardTitle>
              <CardDescription>
                Your billing cycle determines when you're charged
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Billing Cycle</p>
                  <p className="text-sm text-gray-500">You are currently billed {billingCycle}</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 text-blue-800 rounded-md">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <p className="text-sm">Next billing date: June 1, 2025</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your previous invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 font-medium border-b">
                  <div>Invoice</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="grid grid-cols-4 p-4 text-sm">
                      <div className="text-blue-600 hover:underline cursor-pointer">
                        {invoice.id}
                      </div>
                      <div>{invoice.date}</div>
                      <div>{invoice.amount}</div>
                      <div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
