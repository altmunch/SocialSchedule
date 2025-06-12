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
};

export default function SubscriptionComponent() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<string>('pro'); // In a real app, fetch from user profile
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Using the same pricing structure as the landing page
  const plans: Plan[] = [
    {
      id: 'pro',
      name: 'Pro',
      price: 70,
      yearlyPrice: 600,
      interval: billingCycle,
      description: 'Entry-level for premium, niche service',
      features: [
        'Content Optimizing Engine ("Accelerate")',
        'Precise Automated Posting ("Blitz")',
        'Viral Cycle of Improvements ("Cycle")',
        'Comprehensive Field Research ("Scan")',
        'Retention-Boosting Hashtag Generator',
        'Manage up to 3 social accounts',
        'Basic content analytics dashboard',
        'Template Generator Bonus ($399 value)'
      ]
    },
    {
      id: 'team',
      name: 'Team',
      price: 100,
      yearlyPrice: 900,
      interval: billingCycle,
      description: 'For teams or heavy users, added features',
      features: [
        'Everything in Pro, plus:',
        'Team collaboration features',
        'Custom Brand Voice AI',
        'Priority posting during peak hours',
        'Advanced content performance metrics',
        'Manage up to 10 social accounts',
        'Content calendar with team workflows',
        'Hook Creator Bonus ($500 value)'
      ],
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 160,
      yearlyPrice: 1500,
      interval: billingCycle,
      description: 'For custom integrations or high-volume needs',
      features: [
        'Everything in Team, plus:',
        'Direct e-commerce platform integration',
        'Dedicated account manager',
        'Advanced analytics and reporting',
        'Unlimited social accounts',
        'Custom API integrations',
        'White-glove onboarding',
        'Custom AI model training for your brand'
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    // In a real app, this would open a checkout process or change plan
    setActivePlan(planId);
    setSuccessMessage('Your subscription plan has been updated successfully.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const formatPrice = (plan: Plan) => {
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
