'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Download, 
  Upload,
  CheckSquare,
  Square,
  Zap,
  Calendar,
  RefreshCw,
  Users,
  X,
  AlertTriangle
} from 'lucide-react';
import { useTeamMode } from '@/providers/TeamModeProvider';

interface BulkOperationsPanelProps {
  selectedCount: number;
  onBulkAction: (action: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function BulkOperationsPanel({ selectedCount, onBulkAction, onClose, isLoading }: BulkOperationsPanelProps) {
  const { selectedClients, clients, clearSelection } = useTeamMode();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  
  if (selectedCount === 0) {
    return null;
  }

  const selectedClientsData = clients.filter(client => selectedClients.includes(client.id));

  const bulkOperations = [
    {
      id: 'accelerate',
      name: 'Run Accelerate Workflow',
      description: 'Optimize content for all selected clients',
      icon: Zap,
      color: 'text-mint'
    },
    {
      id: 'blitz',
      name: 'Schedule Bulk Posts',
      description: 'Create posting schedule for selected clients',
      icon: Calendar,
      color: 'text-lavender'
    },
    {
      id: 'cycle',
      name: 'Generate Analytics Reports',
      description: 'Create performance reports for selected clients',
      icon: RefreshCw,
      color: 'text-coral'
    },
    {
      id: 'pause',
      name: 'Pause All Workflows',
      description: 'Temporarily pause all active workflows',
      icon: Pause,
      color: 'text-info'
    },
    {
      id: 'export',
      name: 'Export Client Data',
      description: 'Download client information and metrics',
      icon: Download,
      color: 'text-muted-foreground'
    }
  ];

  const handleBulkOperation = async (operationId: string) => {
    if (!operationId) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate processing
    const totalSteps = selectedClients.length;
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProcessingProgress(((i + 1) / totalSteps) * 100);
    }
    
    setIsProcessing(false);
    setProcessingProgress(0);
    setSelectedOperation('');
    
    // In a real app, this would trigger the actual bulk operation
    console.log(`Bulk operation ${operationId} completed for ${selectedClients.length} clients`);
  };

  const getClientStatusCounts = () => {
    const counts = {
      active: 0,
      paused: 0,
      needs_attention: 0
    };
    
    selectedClientsData.forEach(client => {
      counts[client.status]++;
    });
    
    return counts;
  };

  const statusCounts = getClientStatusCounts();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            {/* Status breakdown */}
            <div className="flex items-center space-x-2 text-sm">
              {statusCounts.active > 0 && (
                <Badge className="bg-mint/20 text-mint border-mint">
                  {statusCounts.active} active
                </Badge>
              )}
              {statusCounts.paused > 0 && (
                <Badge className="bg-lavender/20 text-lavender border-lavender">
                  {statusCounts.paused} paused
                </Badge>
              )}
              {statusCounts.needs_attention > 0 && (
                <Badge className="bg-coral/20 text-coral border-coral">
                  {statusCounts.needs_attention} need attention
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={isProcessing}
            >
              Clear Selection
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Processing bulk operation...</span>
              <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {bulkOperations.map((operation) => {
            const IconComponent = operation.icon;
            const isSelected = selectedOperation === operation.id;
            
            return (
              <Card 
                key={operation.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!isProcessing) {
                    if (isSelected) {
                      handleBulkOperation(operation.id);
                    } else {
                      setSelectedOperation(operation.id);
                    }
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className={`h-4 w-4 ${operation.color}`} />
                    <span className="font-medium text-sm">{operation.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{operation.description}</p>
                  
                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <Button 
                        size="sm" 
                        className="w-full h-8"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Execute'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedOperation && !isProcessing && (
          <div className="mt-4 p-3 rounded-lg bg-info/10 border border-info/20">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-info mt-0.5" />
              <div>
                <p className="text-sm font-medium text-info">
                  Ready to execute bulk operation
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This action will affect {selectedClients.length} selected client{selectedClients.length !== 1 ? 's' : ''}. 
                  Click the operation card again to proceed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Client Preview */}
        {selectedClientsData.length > 0 && selectedClientsData.length <= 5 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-2">Selected clients:</p>
            <div className="flex flex-wrap gap-2">
              {selectedClientsData.map(client => (
                <Badge key={client.id} variant="outline" className="text-xs">
                  {client.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 