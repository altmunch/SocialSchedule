'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function OnboardingSuccessPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Your Dashboard!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          You're all set to start growing your social media presence. Here's what you can do next:
        </p>
        
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Create Your First Post</h3>
            <p className="mt-2 text-gray-600">Schedule your first social media post and reach your audience.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Connect More Accounts</h3>
            <p className="mt-2 text-gray-600">Add more social media accounts to manage all your profiles in one place.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Explore Analytics</h3>
            <p className="mt-2 text-gray-600">Track your performance and understand your audience better.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Invite Team Members</h3>
            <p className="mt-2 text-gray-600">Collaborate with your team to create and schedule content together.</p>
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleGetStarted}
            className="px-8 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
