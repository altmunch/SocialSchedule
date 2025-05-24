'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import DashboardLayout from './components/DashboardLayout';
import ProgressTracker from './components/ProgressTracker';
import ScanStep from './components/steps/ScanStep';
import ArmStep from './components/steps/ArmStep';
import DominateStep from './components/steps/DominateStep';
import RepeatStep from './components/steps/RepeatStep';
import { Loader2 } from 'lucide-react';

type Step = 'scan' | 'arm' | 'dominate' | 'repeat';

const steps: { id: Step; name: string; description: string }[] = [
  { id: 'scan', name: 'Scan', description: 'Analyze trends and opportunities' },
  { id: 'arm', name: 'Arm', description: 'Prepare content and strategy' },
  { id: 'dominate', name: 'Dominate', description: 'Execute and optimize' },
  { id: 'repeat', name: 'Repeat', description: 'Analyze and iterate' },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('scan');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/sign-in?redirected=true`);
    } else if (user) {
      setIsLoading(false);
    }
  }, [user, loading, router]);

  // Handle any auth errors from the URL
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError) {
      setError('Authentication error. Please sign in again.');
      // Clear the error from the URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      router.replace(`/dashboard?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  const handleStepComplete = (step: Step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    
    // Move to next step
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as Step);
    }
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'scan':
        return <ScanStep onComplete={() => handleStepComplete('scan')} />;
      case 'arm':
        return <ArmStep onComplete={() => handleStepComplete('arm')} />;
      case 'dominate':
        return (
          <DominateStep 
            platform="instagram" 
            postContent="" 
            postMetadata={{}}
            onComplete={() => handleStepComplete('dominate')} 
          />
        );
      case 'repeat':
        return <RepeatStep onComplete={() => handleStepComplete('repeat')} />;
      default:
        return <ScanStep onComplete={() => handleStepComplete('scan')} />;
    }
  };

  return (
    <DashboardLayout>
      <main className="flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Auto-Domination Mode</h1>
          <p className="text-gray-600">Follow the steps to optimize your social media presence</p>
        </div>
        
        {/* Progress Tracker */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <ProgressTracker 
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={(step) => {
              // Only allow clicking on completed steps or the next step
              const currentIndex = steps.findIndex(s => s.id === currentStep);
              const stepIndex = steps.findIndex(s => s.id === step);
              
              if (stepIndex <= currentIndex || completedSteps.includes(steps[stepIndex - 1]?.id)) {
                setCurrentStep(step as Step);
              }
            }} 
          />
        </div>
        
        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderStep()}
        </div>
      </main>
    </DashboardLayout>
  );
}


