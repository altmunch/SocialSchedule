'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ScanStepProps {
  onComplete: () => void;
}

export default function ScanStep({ onComplete }: ScanStepProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScan = () => {
    setIsScanning(true);
    setProgress(0);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15);
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          onComplete(); // Trigger completion callback
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Scan for Opportunities</h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze current trends and find the best opportunities for engagement
          </p>
        </div>
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Scanning...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="-ml-1 mr-2 h-4 w-4" />
              Start Scan
            </>
          )}
        </button>
      </div>

      {isScanning || progress > 0 ? (
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-right">
            {progress}% complete
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No scan results</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Start Scan" to analyze current trends and opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
