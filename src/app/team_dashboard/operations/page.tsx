'use client';

import { useState, useEffect, useRef } from 'react';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClientDetailView } from '@/components/team-dashboard/ClientDetailView';
import { BulkOperationsPanel } from '@/components/team-dashboard/BulkOperationsPanel';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List as ListIcon, 
  ChevronDown,
  Users,
  Zap,
  Activity,
  Calendar,
  MoreHorizontal,
  CheckSquare,
  Square,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: any;
  isSelected: boolean;
  onSelect: () => void;
}

const ClientCard = ({ client, isSelected, onSelect }: ClientCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'needs_attention': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getWorkflowStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-200 hover:shadow-md cursor-pointer",
      isSelected ? "ring-2 ring-mint bg-mint/5" : ""
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="p-1"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-mint" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-mint to-lavender rounded-full flex items-center justify-center text-sm font-semibold text-white">
              {client.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.industry}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(client.status)}>
            {client.status.replace('_', ' ')}
          </Badge>
          {getWorkflowStatusIcon(client.workflowStatus)}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-semibold text-foreground">
              {client.avgEngagement}%
            </span>
            <span className="text-sm">{getTrendIcon(client.engagementTrend)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Engagement</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {client.totalPosts}
          </div>
          <p className="text-xs text-muted-foreground">Posts</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-semibold text-foreground">
              ${(client.revenue / 1000).toFixed(1)}k
            </span>
            <span className="text-sm">{getTrendIcon(client.revenueTrend)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Revenue</p>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Platforms:</span>
        {client.connectedPlatforms.map((platform: string) => (
          <Badge key={platform} variant="outline" className="text-xs">
            {platform}
          </Badge>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Accelerate
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Schedule
          </Button>
        </div>
        
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default function ClientOperationsPage() {
  const {
    clients,
    totalClientCount,
    selectedClients,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    toggleClientSelection,
    selectAllClients,
    clearSelection,
    loadMoreClients,
    isLoading
  } = useTeamMode();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && clients.length < totalClientCount) {
          loadMoreClients(clients.length, clients.length + 49);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [clients.length, totalClientCount, isLoading, loadMoreClients]);

  const bulkActions = [
    { name: 'Run Accelerate', action: () => console.log('Bulk Accelerate'), icon: Zap },
    { name: 'Schedule Posts', action: () => console.log('Bulk Schedule'), icon: Calendar },
    { name: 'Update Status', action: () => console.log('Bulk Status'), icon: Activity },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search and Filter Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Portfolio</h1>
            <p className="text-muted-foreground">
              Manage {totalClientCount.toLocaleString()} client accounts
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              showFilters ? "rotate-180" : ""
            )} />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Industry</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>All Industries</option>
                  <option>Technology</option>
                  <option>Fashion</option>
                  <option>Food & Beverage</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Paused</option>
                  <option>Needs Attention</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Platform</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>All Platforms</option>
                  <option>TikTok</option>
                  <option>Instagram</option>
                  <option>YouTube</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Performance</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>All Performance</option>
                  <option>High (&gt;5%)</option>
                  <option>Medium (2-5%)</option>
                  <option>Low (&lt;2%)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedClients.length > 0 && (
          <div className="mt-4 p-3 bg-mint/10 border border-mint/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedClients.length} clients selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {bulkActions.map((action) => (
                <Button
                  key={action.name}
                  size="sm"
                  variant="outline"
                  onClick={action.action}
                  className="gap-1"
                >
                  <action.icon className="h-3 w-3" />
                  {action.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isSelected={selectedClients.includes(client.id)}
              onSelect={() => toggleClientSelection(client.id)}
            />
          ))}
        </div>

        {/* Loading indicator and infinite scroll trigger */}
        <div ref={loadingRef} className="py-8 text-center">
          {isLoading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mint mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading more clients...</p>
            </div>
          ) : clients.length < totalClientCount ? (
            <p className="text-sm text-muted-foreground">Scroll down to load more clients</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              All {totalClientCount.toLocaleString()} clients loaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 