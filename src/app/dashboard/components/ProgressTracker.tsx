'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

type StepId = 'scan' | 'arm' | 'dominate' | 'repeat';

interface Step {
  id: StepId;
  name: string;
  description: string;
}

interface ProgressTrackerProps {
  currentStep: StepId;
  completedSteps?: StepId[];
  onStepClick?: (step: StepId) => void;
}

const steps: Step[] = [
  { id: 'scan', name: 'Scan', description: 'Analyze trends' },
  { id: 'arm', name: 'Arm', description: 'Prepare content' },
  { id: 'dominate', name: 'Dominate', description: 'Execute & optimize' },
  { id: 'repeat', name: 'Repeat', description: 'Analyze results' },
];

export default function ProgressTracker({ currentStep, completedSteps = [], onStepClick }: ProgressTrackerProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  const handleStepClick = (step: StepId) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <nav aria-label="Progress" aria-live="polite">
      <ol className="flex flex-wrap items-center justify-center gap-y-4">
        {steps.map((step, stepIdx) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id) || currentStepIndex > stepIdx;
          const isLast = stepIdx === steps.length - 1;

          return (
            <li key={step.id} className={`flex flex-col sm:flex-row items-center ${!isLast ? 'flex-1' : 'flex-none'} min-w-[100px]`}>
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCurrent
                      ? 'border-2 border-indigo-600 bg-white text-indigo-600'
                      : isCompleted
                      ? 'bg-indigo-600 text-white'
                      : 'border-2 border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                  }`}
                  disabled={!onStepClick}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </button>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  {step.description}
                </span>
              </div>
              
              {!isLast && (
                <div 
                  className={`hidden sm:block flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} 
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
