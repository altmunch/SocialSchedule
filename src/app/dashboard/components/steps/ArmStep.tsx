'use client';

import { useState } from 'react';
import { DocumentTextIcon, PhotoIcon, VideoCameraIcon, LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const contentTypes = [
  {
    id: 'post',
    name: 'Text Post',
    icon: DocumentTextIcon,
    description: 'Create a text-based post',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'image',
    name: 'Image',
    icon: PhotoIcon,
    description: 'Upload an image',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'video',
    name: 'Video',
    icon: VideoCameraIcon,
    description: 'Upload a video',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'link',
    name: 'Link',
    icon: LinkIcon,
    description: 'Share a link',
    color: 'bg-yellow-100 text-yellow-600',
  },
];

interface ArmStepProps {
  onComplete: () => void;
}

export default function ArmStep({ onComplete }: ArmStepProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !content.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onComplete(); // Trigger completion callback
      
      // Reset success after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Arm Your Content</h2>
        <p className="mt-1 text-sm text-gray-500">
          Prepare your content and strategy for maximum impact
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`relative rounded-lg border ${
              selectedType === type.id ? 'ring-2 ring-indigo-500' : 'border-gray-200'
            } bg-white p-4 shadow-sm focus:outline-none`}
          >
            <div className="flex items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${type.color}`}>
                <type.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-900">{type.name}</p>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            </div>
            {selectedType === type.id && (
              <div className="absolute right-4 top-4">
                <CheckCircleIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedType && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="mt-1">
              <textarea
                rows={4}
                name="content"
                id="content"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={`Enter your ${contentTypes.find(t => t.id === selectedType)?.name.toLowerCase()} content here...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Content'}
            </button>
          </div>
          
          {isSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Content saved successfully!</p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
