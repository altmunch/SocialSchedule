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

export default function SubscriptionComponent() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<string>('lite'); // Default to Lite plan
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Updated pricing structure to match the new schema
  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      price: 20,
      yearlyPrice: 240, // $20 * 12
      interval: billingCycle,
      description: '$20/month',
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
      yearlyPrice: 840, // $70 * 12
      interval: billingCycle,
      description: '$70/month',
      features: [
        'Viral Blitz Cycle Framework',
        'Idea Generator Framework (unlimited)',
        'Unlimited posts',
        '1 set of accounts',
        'E-commerce integration'
      ],
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_PRO_LINK'
    },
    {
      id: 'team',
      name: 'Team',
      price: 500,
      yearlyPrice: 6000, // $500 * 12
      interval: billingCycle,
      description: '$500/month',
      features: [
        'Everything in Pro',
        'Manage unlimited accounts',
        'Brand Voice AI (for consistency)',
        'Team collaboration mode',
        'Advanced analytics & reporting'
      ],
      isPopular: true,
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
        localStorage.setItem('post_payment_redirect', '/team-dashboard');
      }
      
      if (stripeLink) {
        window.open(stripeLink, '_blank');
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
            <div className="bg-gray-100 p-1 rounded-full inline-flex items-center">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className="rounded-full"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className="rounded-full"
              >
                Yearly
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-0">
                  Save 20%
                </Badge>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.isPopular ? 'border-blue-500 shadow-md' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <Badge className="bg-blue-500">Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {formatPrice(plan)}
                    </span>
                    {billingCycle === 'yearly' && plan.yearlyPrice && (
                      <span className="text-sm text-green-600 ml-2">
                        Save 20%
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${activePlan === plan.id ? 'bg-gray-300 hover:bg-gray-300 cursor-default' : ''}`}
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
