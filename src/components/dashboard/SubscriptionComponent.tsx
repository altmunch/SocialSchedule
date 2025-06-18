'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  CheckCircle,
  Star,
  Download,
  CreditCard,
  FileText,
  Calendar,
  DollarSign,
  Crown,
  Zap,
  Users,
  Target,
  MoreHorizontal,
  Receipt,
  TrendingUp,
  Shield,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const plans = [
  {
    id: 'lite',
    name: 'Lite',
    price: 29,
    yearlyPrice: 290,
    interval: 'monthly',
    description: 'Perfect for creators getting started',
    features: [
      '10 content optimizations/month',
      '50 scheduled posts/month',
      'Basic analytics',
      'Email support',
      'Instagram & TikTok integration'
    ],
    icon: Zap,
    color: 'text-emerald-500'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    yearlyPrice: 790,
    interval: 'monthly',
    description: 'For growing businesses and agencies',
    features: [
      'Unlimited content optimizations',
      'Unlimited scheduled posts',
      'Advanced analytics & insights',
      'Priority support',
      'All platform integrations',
      'Competitor analysis',
      'Custom templates',
      'Team collaboration'
    ],
    isPopular: true,
    icon: Crown,
    color: 'text-orange-500'
  },
  {
    id: 'team',
    name: 'Team',
    price: 199,
    yearlyPrice: 1990,
    interval: 'monthly',
    description: 'For large teams and enterprises',
    features: [
      'Manage unlimited accounts',
      'Brand Voice AI (for consistency)'
    ],
    icon: Users,
    color: 'text-violet-500'
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
      {...other}
      className="py-6"
    >
      {value === index && children}
    </div>
  );
}

export default function SubscriptionComponent() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [animationStage, setAnimationStage] = useState(0);

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2, 3];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 200);
    });
  }, []);

  const currentPlan = user?.user_metadata?.subscription_tier || 'lite';

  // Mock billing data - in real app, fetch from API
  const billingInfo = {
    currentPlan: 'Pro Plan',
    nextBillingDate: '2024-02-15',
    billingPeriod: 'Monthly',
    paymentMethod: '**** **** **** 4242',
    billingEmail: user?.email || 'user@example.com'
  };

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 79,
      status: 'paid',
      description: 'Pro Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 79,
      status: 'paid',
      description: 'Pro Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 79,
      status: 'paid',
      description: 'Pro Plan - Monthly',
      downloadUrl: '#'
    }
  ];

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlanSelect = (planId: string) => {
    // Handle plan selection logic
    console.log('Selected plan:', planId);
  };

  const handleInvoiceView = (invoice: any) => {
    setSelectedInvoice(invoice);
    setInvoiceDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-orange-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Compact Header */}
      <div className="text-center mb-10 fade-in opacity-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
          Subscription & Billing
        </h1>
        <p className="text-lg text-gray-400 mt-2 max-w-3xl mx-auto">
          Manage your plan, view billing history, and update payment methods.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex justify-center fade-in opacity-100">
        <div className="inline-flex rounded-md shadow-sm bg-gray-800 p-1" role="group">
          <button
            type="button"
            className={`px-6 py-3 text-lg font-medium rounded-l-md transition-all duration-300
              ${tabValue === 0 ? 'bg-gradient-to-r from-violet-600 to-emerald-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => handleTabChange(0)}
          >
            Subscription Plan
          </button>
          <button
            type="button"
            className={`px-6 py-3 text-lg font-medium rounded-r-md transition-all duration-300
              ${tabValue === 1 ? 'bg-gradient-to-r from-violet-600 to-emerald-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => handleTabChange(1)}
          >
            Billing History
          </button>
        </div>
      </div>

      <TabPanel value={tabValue} index={0}>
        {/* Current Plan & Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-xl p-8 space-y-6 fade-in opacity-100">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-violet-400" />
              Your Current Plan
            </h2>
            <div className="flex flex-col items-start space-y-3">
              <span className="text-xl font-semibold text-emerald-400">
                {billingInfo.currentPlan}
              </span>
              <p className="text-gray-300">Next Billing: {billingInfo.nextBillingDate}</p>
              <p className="text-gray-300">Period: {billingInfo.billingPeriod}</p>
              <p className="text-gray-300">Payment: {billingInfo.paymentMethod}</p>
              <p className="text-gray-300">Email: {billingInfo.billingEmail}</p>
            </div>
            <Button className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-md shadow-lg transition-all duration-300">
              Cancel Subscription
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Billing Period Toggle */}
            <div className="flex justify-center mb-6 fade-in opacity-100">
              <div className="inline-flex rounded-md shadow-sm bg-gray-800 p-1" role="group">
                <button
                  type="button"
                  className={`px-5 py-2 text-md font-medium rounded-l-md transition-all duration-300
                    ${billingPeriod === 'monthly' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700'}`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  className={`px-5 py-2 text-md font-medium rounded-r-md transition-all duration-300
                    ${billingPeriod === 'yearly' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700'}`}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  Yearly Billing (Save 20%)
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                const price = billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice;
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-gray-800 rounded-lg shadow-xl p-6 space-y-4
                      transition-all duration-400 ease-in-out transform hover:scale-105
                      ${plan.isPopular ? 'border-2 border-emerald-500 ring-4 ring-emerald-500 ring-opacity-50' : 'border border-gray-700'}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`h-8 w-8 ${plan.color}`} />
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                    <div className="text-white">
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="text-xl text-gray-400">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full py-3 font-semibold rounded-md shadow-lg transition-all duration-300
                        ${currentPlan === plan.name.replace(' Plan', '') ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white'}`}
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={currentPlan === plan.name.replace(' Plan', '')}
                    >
                      {currentPlan === plan.name.replace(' Plan', '') ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Billing History */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-6 fade-in opacity-100">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <Receipt className="h-8 w-8 text-emerald-400" />
            Billing History
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)} text-white`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleInvoiceView(invoice)}
                        className="text-violet-400 hover:text-violet-500 transition-colors duration-200"
                      >
                        View
                      </button>
                      <a href={invoice.downloadUrl} className="ml-4 text-emerald-400 hover:text-emerald-500 transition-colors duration-200">
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TabPanel>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-xl border border-gray-700 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-violet-400 mb-2">Invoice Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Details for invoice {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="mt-4 space-y-3 text-gray-300">
              <p><strong>Invoice ID:</strong> {selectedInvoice.id}</p>
              <p><strong>Date:</strong> {selectedInvoice.date}</p>
              <p><strong>Description:</strong> {selectedInvoice.description}</p>
              <p><strong>Amount:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInvoice.status)} text-white`}>
                {getStatusText(selectedInvoice.status)}
              </span></p>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={() => setInvoiceDialogOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md">
              Close
            </Button>
            <a href={selectedInvoice?.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-md">
                Download PDF
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
