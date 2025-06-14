'use client';

import React, { useState, useEffect } from 'react';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { AdvancedClientFilters } from '@/components/team-dashboard/AdvancedClientFilters';
import { BulkOperationsPanel } from '@/components/team-dashboard/BulkOperationsPanel';
import { ClientDetailView } from '@/components/team-dashboard/ClientDetailView';
import { TeamSidebar } from '@/components/team-dashboard/TeamSidebar';
import { TeamHeader } from '@/components/team-dashboard/TeamHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

// Mock client data for demonstration
interface Client {
  id: string;
  name: string;
  email: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  status: 'active' | 'paused' | 'pending' | 'error';
  engagement: number;
  followers: number;
  revenue: number;
  lastActivity: Date;
  workflowsActive: number;
  tags: string[];
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    platform: 'tiktok',
    status: 'active',
    engagement: 8.5,
    followers: 125000,
    revenue: 15420,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    workflowsActive: 3,
    tags: ['high-performer', 'fashion']
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    platform: 'instagram',
    status: 'active',
    engagement: 6.2,
    followers: 89000,
    revenue: 8750,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    workflowsActive: 2,
    tags: ['tech', 'gaming']
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    platform: 'youtube',
    status: 'paused',
    engagement: 4.1,
    followers: 45000,
    revenue: 3200,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    workflowsActive: 0,
    tags: ['lifestyle', 'wellness']
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    email: 'alex@example.com',
    platform: 'tiktok',
    status: 'error',
    engagement: 2.8,
    followers: 67000,
    revenue: 1850,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    workflowsActive: 1,
    tags: ['food', 'cooking']
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa@example.com',
    platform: 'instagram',
    status: 'active',
    engagement: 9.2,
    followers: 156000,
    revenue: 22100,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    workflowsActive: 4,
    tags: ['high-performer', 'beauty', 'skincare']
  }
];

export default function TeamOperationsPage() {
  const { user } = useAuth();
  const { 
    totalClientCount, 
    selectedClients, 
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    refreshClients,
    clearSelection
  } = useTeamMode();

  const [clients, setClients] = useState<Client[]>(mockClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(mockClients);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    platform: '',
    engagement: '',
    tags: [] as string[]
  });

  useEffect(() => {
    setCurrentTab('operations');
  }, [setCurrentTab]);

  useEffect(() => {
    // Apply filters
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(client => client.status === filters.status);
    }

    if (filters.platform) {
      filtered = filtered.filter(client => client.platform === filters.platform);
    }

    if (filters.engagement) {
      const [min, max] = filters.engagement.split('-').map(Number);
      filtered = filtered.filter(client => 
        client.engagement >= min && (max ? client.engagement <= max : true)
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(client => 
        filters.tags.some(tag => client.tags.includes(tag))
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, filters]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClientIds.length === filteredClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(filteredClients.map(client => client.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'activate':
          setClients(prev => prev.map(client => 
            selectedClientIds.includes(client.id) 
              ? { ...client, status: 'active' as const }
              : client
          ));
          break;
        case 'pause':
          setClients(prev => prev.map(client => 
            selectedClientIds.includes(client.id) 
              ? { ...client, status: 'paused' as const }
              : client
          ));
          break;
        case 'delete':
          setClients(prev => prev.filter(client => !selectedClientIds.includes(client.id)));
          break;
      }
      
      setSelectedClientIds([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-mint" />;
      case 'paused': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEngagementTrend = (engagement: number) => {
    if (engagement >= 8) return <TrendingUp className="h-4 w-4 text-mint" />;
    if (engagement <= 3) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex h-screen bg-background">
      <TeamSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeamHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-creative">Client Operations</h1>
                <p className="text-muted-foreground">
                  Manage {totalClientCount.toLocaleString()} clients across all platforms
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={refreshClients}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            {/* Filters */}
            <AdvancedClientFilters
              onFiltersChange={handleFiltersChange}
              clientCount={clients.length}
              filteredCount={filteredClients.length}
            />

            {/* Bulk Operations Panel */}
            {selectedClientIds.length > 0 && (
              <BulkOperationsPanel
                isVisible={selectedClientIds.length > 0}
                onClose={() => setSelectedClientIds([])}
              />
            )}

            {/* Client List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Clients ({filteredClients.length})</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedClientIds.length === filteredClients.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                        selectedClientIds.includes(client.id) ? 'bg-mint/10 border-mint' : 'border-border'
                      }`}
                      onClick={() => handleClientSelect(client.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedClientIds.includes(client.id)}
                            onChange={() => handleClientSelect(client.id)}
                            className="rounded border-border"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{client.name}</h3>
                              {getStatusIcon(client.status)}
                              <Badge variant="outline" className="text-xs">
                                {client.platform}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                {getEngagementTrend(client.engagement)}
                                <span>{client.engagement}% engagement</span>
                              </span>
                              <span>{client.followers.toLocaleString()} followers</span>
                              <span>${client.revenue.toLocaleString()} revenue</span>
                              <span>{formatTimeAgo(client.lastActivity)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-sm">
                              <Zap className="h-4 w-4 text-lavender" />
                              <span>{client.workflowsActive} active</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {client.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs mr-1">
                                  {tag}
                                </Badge>
                              ))}
                              {client.tags.length > 2 && (
                                <span className="text-muted-foreground">+{client.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(client);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredClients.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No clients found matching your filters</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setFilters({ status: '', platform: '', engagement: '', tags: [] });
                          setSearchQuery('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailView
          clientId={selectedClient.id}
          onBack={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
} 