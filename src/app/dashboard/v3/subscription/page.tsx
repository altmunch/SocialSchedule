'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, DollarSign, Receipt, TrendingUp, Sparkles, Users, Lock, CreditCard, Download, Clipboard, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider'; // Assuming useAuth provides user data

interface Plan {
  id: string;
  name: string;
  price: string;
  frequency: string;
  features: string[];
  isCurrent?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
  downloadLink: string;
}

export default function SubscriptionPage() {
  const { user } = useAuth(); // Mock user data
  const [activeTab, setActiveTab] = useState("pricing");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock data for plans and invoices
  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      price: '$19',
      frequency: '/month',
      features: [
        'Basic AI features',
        'Up to 5 video optimizations/month',
        'Limited analytics',
        'Community support',
      ],
      isCurrent: user?.user_metadata?.tier === 'lite',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$49',
      frequency: '/month',
      features: [
        'Advanced AI features',
        'Up to 50 video optimizations/month',
        'Full analytics & reports',
        'Priority support',
        'E-commerce integrations',
        'AI Content Strategies',
      ],
      isCurrent: user?.user_metadata?.tier === 'pro',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      frequency: '',
      features: [
        'Unlimited AI features',
        'Unlimited video optimizations',
        'Dedicated account manager',
        'Custom integrations',
        'On-site training',
        'Advanced security',
      ],
      isCurrent: user?.user_metadata?.tier === 'enterprise',
    },
  ];

  const invoices: Invoice[] = [
    { id: 'inv-001', date: '2024-05-01', amount: '$49.00', status: 'Paid', downloadLink: '#' },
    { id: 'inv-002', date: '2024-04-01', amount: '$49.00', status: 'Paid', downloadLink: '#' },
    { id: 'inv-003', date: '2024-03-01', amount: '$49.00', status: 'Paid', downloadLink: '#' },
    { id: 'inv-004', date: '2024-02-01', amount: '$19.00', status: 'Paid', downloadLink: '#' },
    { id: 'inv-005', date: '2024-01-01', amount: '$19.00', status: 'Paid', downloadLink: '#' },
  ];

  useEffect(() => {
    // Simulate data fetching
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await new Promise((res) => setTimeout(res, 1500));
      // Simulate API call to update subscription
      console.log(`Subscribing to ${planId}`);
      setMessage({ type: 'success', text: `Successfully subscribed to ${planId.toUpperCase()} plan!` });
      // In a real app, you'd update the user's tier here
      // user.user_metadata.tier = planId;
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update subscription. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await new Promise((res) => setTimeout(res, 1500));
      // Simulate API call to cancel subscription
      console.log('Cancelling subscription');
      setMessage({ type: 'success', text: 'Subscription cancelled successfully!' });
      // In a real app, you'd update the user's tier here
      // user.user_metadata.tier = 'free';
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderPricingPlans = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={`bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl ${plan.isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500' : ''}`}>
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {plan.name}
              {plan.isCurrent && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500 text-white">Current Plan</span>}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {plan.id === 'enterprise' ? 'Tailored solutions for large businesses.' : 'Perfect for individuals and small teams.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="text-center mb-4">
              <span className="text-5xl font-extrabold text-white">{plan.price}</span>
              <span className="text-slate-400 text-lg">{plan.frequency}</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-0 mt-6">
            {plan.isCurrent ? (
              <Button 
                variant="outline" 
                onClick={handleCancelSubscription} 
                disabled={loading} 
                className="w-full border-red-500 text-red-400 hover:bg-red-500/20"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                {loading ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            ) : plan.id === 'enterprise' ? (
              <Button 
                onClick={() => alert('Contact sales for Enterprise plan')}
                className="w-full btn-secondary flex items-center gap-2"
              >
                <Users className="h-4 w-4" /> Contact Sales
              </Button>
            ) : (
              <Button 
                onClick={() => handleSubscribe(plan.id)} 
                disabled={loading} 
                className="w-full btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                {loading ? "Subscribing..." : "Choose Plan"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderBillingHistory = () => (
    <Card className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Receipt className="h-6 w-6 text-emerald-400" /> Billing History
        </CardTitle>
        <CardDescription className="text-slate-400">View your past invoices and payment details.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="text-xs uppercase bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-lg">Invoice ID</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={invoice.id} className={`border-b border-gray-700 ${
                    index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
                  } hover:bg-gray-700/70`}>
                    <td className="px-6 py-4 font-medium text-white">{invoice.id}</td>
                    <td className="px-6 py-4">{invoice.date}</td>
                    <td className="px-6 py-4">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${invoice.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-0 mt-6 flex justify-between items-center">
        <Button className="btn-secondary flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Update Payment Method
        </Button>
        <Button className="btn-secondary flex items-center gap-2">
          <Clipboard className="h-4 w-4" /> View All Invoices
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="single-view p-6 bg-gradient-to-br from-gray-900 to-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            Subscription & Billing
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your plan, view billing history, and update payment details.
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-700 text-emerald-300' : 'bg-red-900/20 border-red-700 text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs for Pricing and Billing */}
        <Tabs defaultValue="pricing" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
            <TabsTrigger value="pricing" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Pricing Plans
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Billing & Invoices
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pricing" className="mt-6">
            {loading ? <div className="flex items-center justify-center h-48"><Loader2 className="h-10 w-10 animate-spin text-indigo-400" /></div> : renderPricingPlans()}
          </TabsContent>
          <TabsContent value="billing" className="mt-6">
            {loading ? <div className="flex items-center justify-center h-48"><Loader2 className="h-10 w-10 animate-spin text-indigo-400" /></div> : renderBillingHistory()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
