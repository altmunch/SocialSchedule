'use client';

import { BoltIcon, ChartBarIcon, Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline';

const actions = [
  {
    title: 'New Campaign',
    icon: PlusIcon,
    description: 'Launch a new domination campaign',
    href: '#',
    iconBackground: 'bg-indigo-100',
    iconForeground: 'text-indigo-600',
  },
  {
    title: 'Quick Post',
    icon: BoltIcon,
    description: 'Create a one-time post',
    href: '#',
    iconBackground: 'bg-green-100',
    iconForeground: 'text-green-600',
  },
  {
    title: 'Analytics',
    icon: ChartBarIcon,
    description: 'View performance metrics',
    href: '#',
    iconBackground: 'bg-purple-100',
    iconForeground: 'text-purple-600',
  },
  {
    title: 'Settings',
    icon: Cog6ToothIcon,
    description: 'Configure your account',
    href: '#',
    iconBackground: 'bg-gray-100',
    iconForeground: 'text-gray-600',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.title}
              href={action.href}
              className="group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 p-2 rounded-md ${action.iconBackground} ${action.iconForeground}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
