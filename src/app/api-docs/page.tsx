'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Server, Database, Lock, Check, TerminalSquare } from 'lucide-react';
import Link from 'next/link';

import NavigationBar from '@/app/landing/components/NavigationBar';

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleCopyCode = (code: string, endpoint: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };
  
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-lightning-DEFAULT pt-16">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <motion.div 
            className="bg-[#0A0A0A] border border-white/5 rounded-xl p-12 text-center relative overflow-hidden shadow-xl"
          >
            <motion.h1 className="text-4xl font-bold text-white mb-6">
              API Documentation
            </motion.h1>
            <motion.p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
              Connect your application with ClipsCommerce
            </motion.p>
          </motion.div>
        </motion.div>
        
        {/* API Documentation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-black/30 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Documentation</h3>
              
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: <Server className="h-4 w-4" /> },
                  { id: 'authentication', label: 'Authentication', icon: <Lock className="h-4 w-4" /> },
                  { id: 'endpoints', label: 'API Endpoints', icon: <Code className="h-4 w-4" /> },
                  { id: 'webhooks', label: 'Webhooks', icon: <Database className="h-4 w-4" /> },
                  { id: 'libraries', label: 'Client Libraries', icon: <TerminalSquare className="h-4 w-4" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id 
                        ? 'bg-[#8D5AFF] text-white' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-black/30 border border-white/10 rounded-xl p-8">
              {/* Overview */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">ClipsCommerce API</h2>
                    <p className="text-white/70 mb-6">
                      The ClipsCommerce API enables you to integrate our powerful content optimization 
                      and scheduling capabilities directly into your application. This RESTful API 
                      provides endpoints for managing content, schedules, analytics, and more.
                    </p>
                    <div className="bg-black/50 border border-white/5 rounded-lg p-6 mb-8">
                      <p className="text-[#5afcc0] mb-2 font-medium">Base URL</p>
                      <code className="text-white/90 font-mono">https://api.socialschedule.com/v1</code>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Getting Started</h3>
                    <ol className="list-decimal pl-5 space-y-4 text-white/70">
                      <li>Register for an API key in your <Link href="/coming-soon" className="text-[#8D5AFF] hover:underline">account dashboard</Link></li>
                      <li>Set up authentication using your API key</li>
                      <li>Explore available endpoints to integrate with your application</li>
                      <li>Test your integration in the sandbox environment</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Rate Limiting</h3>
                    <p className="text-white/70 mb-4">
                      The API implements rate limiting to ensure fair usage. Different account tiers have different rate limits:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-white/90">Plan</th>
                            <th className="text-left py-3 px-4 text-white/90">Requests per minute</th>
                            <th className="text-left py-3 px-4 text-white/90">Daily limit</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/10">
                            <td className="py-3 px-4 text-white/70">Standard</td>
                            <td className="py-3 px-4 text-white/70">60</td>
                            <td className="py-3 px-4 text-white/70">10,000</td>
                          </tr>
                          <tr className="border-b border-white/10">
                            <td className="py-3 px-4 text-white/70">Professional</td>
                            <td className="py-3 px-4 text-white/70">120</td>
                            <td className="py-3 px-4 text-white/70">30,000</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-white/70">Enterprise</td>
                            <td className="py-3 px-4 text-white/70">300</td>
                            <td className="py-3 px-4 text-white/70">100,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Authentication */}
              {activeTab === 'authentication' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                    <p className="text-white/70 mb-6">
                      ClipsCommerce API uses API keys to authenticate requests. You can manage your API keys 
                      from your dashboard. Your API keys carry many privileges, so be sure to keep them secure.
                    </p>
                  </div>
                  
                  <div className="bg-black/50 border border-white/5 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[#5afcc0] font-medium">Authorization Header</p>
                      <button 
                        onClick={() => handleCopyCode('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                        className="text-white/60 hover:text-white"
                      >
                        {copiedEndpoint === 'auth-header' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <code className="text-white/90 font-mono block mb-6">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                    
                    <p className="text-white/70 text-sm">
                      All API requests must include this header with your API key.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">API Key Security</h3>
                    <ul className="list-disc pl-5 space-y-4 text-white/70">
                      <li>Never share your API keys in publicly accessible areas such as GitHub, client-side code, etc.</li>
                      <li>Keep your API keys secure. If you believe an API key has been compromised, regenerate it immediately from your dashboard.</li>
                      <li>Consider using environment variables to store API keys in your application.</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 bg-[#8D5AFF]/10 border border-[#8D5AFF]/30 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Important Note</h4>
                    <p className="text-white/80">
                      Never use your API key directly in client-side JavaScript. Instead, call the API from your server-side code.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* API Endpoints */}
              {activeTab === 'endpoints' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">API Endpoints</h2>
                    <p className="text-white/70 mb-8">
                      Below are the main endpoints available in the ClipsCommerce API. 
                      All requests should be made to the base URL <code className="text-[#5afcc0] font-mono">https://api.clipscommerce.com/v1</code> 
                      followed by the endpoint path.
                    </p>
                  </div>
                  
                  {/* Content Endpoints */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Content</h3>
                    
                    {/* GET content */}
                    <div className="border border-white/10 rounded-lg mb-6 overflow-hidden">
                      <div className="flex items-center bg-[#8D5AFF]/10 px-4 py-3">
                        <span className="bg-green-500 text-black font-mono text-xs font-bold px-2 py-1 rounded mr-3">GET</span>
                        <code className="text-white font-mono">/content</code>
                        <button 
                          onClick={() => handleCopyCode('GET https://api.socialschedule.com/v1/content', 'get-content')}
                          className="ml-auto text-white/60 hover:text-white"
                        >
                          {copiedEndpoint === 'get-content' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="p-4 bg-black/50">
                        <p className="text-white/70 mb-4">Retrieve a list of your content items</p>
                        <div className="bg-black/70 p-3 rounded-lg font-mono text-sm text-white/80">
                          <pre>{`{
  "data": [
    {
      "id": "cnt_12345",
      "title": "Summer Sale Promotion",
      "type": "video",
      "status": "scheduled",
      "created_at": "2023-06-01T12:00:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "per_page": 10
  }
}`}</pre>
                        </div>
                      </div>
                    </div>
                    
                    {/* POST content */}
                    <div className="border border-white/10 rounded-lg mb-6 overflow-hidden">
                      <div className="flex items-center bg-[#8D5AFF]/10 px-4 py-3">
                        <span className="bg-blue-500 text-black font-mono text-xs font-bold px-2 py-1 rounded mr-3">POST</span>
                        <code className="text-white font-mono">/content</code>
                        <button 
                          onClick={() => handleCopyCode('POST https://api.socialschedule.com/v1/content', 'post-content')}
                          className="ml-auto text-white/60 hover:text-white"
                        >
                          {copiedEndpoint === 'post-content' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="p-4 bg-black/50">
                        <p className="text-white/70 mb-4">Create a new content item</p>
                        <div className="bg-black/70 p-3 rounded-lg font-mono text-sm text-white/80">
                          <pre>{`// Request body
{
  "title": "New Product Launch",
  "type": "video",
  "file_url": "https://example.com/video.mp4",
  "caption": "Check out our new product!",
  "platforms": ["tiktok", "instagram"]
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Schedule Endpoints */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Schedules</h3>
                    
                    {/* GET schedules */}
                    <div className="border border-white/10 rounded-lg mb-6 overflow-hidden">
                      <div className="flex items-center bg-[#8D5AFF]/10 px-4 py-3">
                        <span className="bg-green-500 text-black font-mono text-xs font-bold px-2 py-1 rounded mr-3">GET</span>
                        <code className="text-white font-mono">/schedules</code>
                        <button 
                          onClick={() => handleCopyCode('GET https://api.socialschedule.com/v1/schedules', 'get-schedules')}
                          className="ml-auto text-white/60 hover:text-white"
                        >
                          {copiedEndpoint === 'get-schedules' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="p-4 bg-black/50">
                        <p className="text-white/70 mb-4">Retrieve a list of your scheduled posts</p>
                      </div>
                    </div>
                    
                    {/* POST schedule */}
                    <div className="border border-white/10 rounded-lg overflow-hidden">
                      <div className="flex items-center bg-[#8D5AFF]/10 px-4 py-3">
                        <span className="bg-blue-500 text-black font-mono text-xs font-bold px-2 py-1 rounded mr-3">POST</span>
                        <code className="text-white font-mono">/schedules</code>
                        <button 
                          onClick={() => handleCopyCode('POST https://api.socialschedule.com/v1/schedules', 'post-schedule')}
                          className="ml-auto text-white/60 hover:text-white"
                        >
                          {copiedEndpoint === 'post-schedule' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="p-4 bg-black/50">
                        <p className="text-white/70 mb-4">Create a new scheduled post</p>
                        <div className="bg-black/70 p-3 rounded-lg font-mono text-sm text-white/80">
                          <pre>{`// Request body
{
  "content_id": "cnt_12345",
  "platforms": ["tiktok", "instagram"],
  "publish_at": "2023-06-15T14:30:00Z",
  "optimize_timing": true
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Webhooks */}
              {activeTab === 'webhooks' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Webhooks</h2>
                    <p className="text-white/70 mb-6">
                      Webhooks allow you to receive real-time updates about events in your ClipsCommerce account. 
                      When a specified event occurs, we'll send an HTTP POST request to the URL you've configured.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Available Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { event: "content.created", description: "A new content item is created" },
                        { event: "content.updated", description: "A content item is updated" },
                        { event: "post.scheduled", description: "A post is scheduled" },
                        { event: "post.published", description: "A post is published" },
                        { event: "post.failed", description: "A post failed to publish" },
                        { event: "analytics.updated", description: "Analytics data is updated" }
                      ].map((item, index) => (
                        <div key={index} className="bg-black/40 border border-white/10 rounded-lg p-4">
                          <code className="text-[#5afcc0] font-mono text-sm mb-2 block">{item.event}</code>
                          <p className="text-white/70 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Webhook Format</h3>
                    <div className="bg-black/50 border border-white/5 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[#5afcc0] font-medium">Example Webhook Payload</p>
                        <button 
                          onClick={() => handleCopyCode('{\n  "event": "post.published",\n  "created_at": "2023-06-15T14:30:00Z",\n  "data": {\n    "post_id": "post_12345",\n    "content_id": "cnt_12345",\n    "platform": "tiktok",\n    "status": "published",\n    "url": "https://tiktok.com/...",\n    "analytics": {\n      "views": 0,\n      "likes": 0,\n      "comments": 0\n    }\n  }\n}', 'webhook-payload')}
                          className="text-white/60 hover:text-white"
                        >
                          {copiedEndpoint === 'webhook-payload' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <pre className="text-white/90 font-mono text-sm bg-black/70 p-4 rounded-lg overflow-x-auto">
{`{
  "event": "post.published",
  "created_at": "2023-06-15T14:30:00Z",
  "data": {
    "post_id": "post_12345",
    "content_id": "cnt_12345",
    "platform": "tiktok",
    "status": "published",
    "url": "https://tiktok.com/...",
    "analytics": {
      "views": 0,
      "likes": 0,
      "comments": 0
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Client Libraries */}
              {activeTab === 'libraries' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Client Libraries</h2>
                    <p className="text-white/70 mb-6">
                      We provide official client libraries for several programming languages to make integrating with 
                      the ClipsCommerce API easier. These libraries handle authentication, error handling, and request formatting for you.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        language: "JavaScript",
                        installCommand: "npm install clipscommerce-js",
                        example: `import { ClipsCommerce } from 'clipscommerce-js';

const client = new ClipsCommerce('YOUR_API_KEY');

// Get content
client.content.list()
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`
                      },
                      {
                        language: "Python",
                        installCommand: "pip install socialschedule",
                        example: `import socialschedule

client = socialschedule.Client('YOUR_API_KEY')

# Get content
response = client.content.list()
print(response.data)`
                      },
                      {
                        language: "PHP",
                        installCommand: "composer require clipscommerce/php-sdk",
                        example: `<?php
require_once 'vendor/autoload.php';

$client = new \\ClipsCommerce\\Client('YOUR_API_KEY');

// Get content
$response = $client->content->list();
print_r($response->data);`
                      },
                      {
                        language: "Ruby",
                        installCommand: "gem install clipscommerce",
                        example: `require 'clipscommerce'

client = ClipsCommerce::Client.new('YOUR_API_KEY')

# Get content
response = client.content.list
puts response.data`
                      }
                    ].map((lib, index) => (
                      <div key={index} className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                        <div className="bg-[#8D5AFF]/10 px-4 py-3 flex justify-between items-center">
                          <h3 className="font-bold text-white">{lib.language}</h3>
                          <button 
                            onClick={() => handleCopyCode(lib.installCommand, `install-${lib.language}`)}
                            className="text-white/60 hover:text-white"
                          >
                            {copiedEndpoint === `install-${lib.language}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="mb-4">
                            <p className="text-white/70 text-sm mb-2">Installation</p>
                            <code className="bg-black/70 p-2 rounded text-[#5afcc0] font-mono text-sm block">{lib.installCommand}</code>
                          </div>
                          <div>
                            <p className="text-white/70 text-sm mb-2">Example Usage</p>
                            <pre className="bg-black/70 p-3 rounded text-white/80 font-mono text-sm overflow-x-auto">{lib.example}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-[#5afcc0]/10 border border-[#5afcc0]/30 rounded-lg p-6">
                    <h3 className="font-bold text-white mb-3">Need help with integration?</h3>
                    <p className="text-white/80 mb-4">
                      Our developer support team is available to help you with any integration questions or issues.
                    </p>
                    <Link 
                      href="/coming-soon"
                      className="inline-flex items-center bg-[#5afcc0] hover:bg-[#5afcc0]/90 text-black px-4 py-2 rounded font-medium text-sm transition-all"
                    >
                      Contact Developer Support
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Footer */}
      <div className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <p className="text-white/40 text-sm">© {new Date().getFullYear()} ClipsCommerce. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
