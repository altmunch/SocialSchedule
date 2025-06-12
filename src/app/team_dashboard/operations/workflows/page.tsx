'use client';

import { useState } from 'react';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowTemplateManager } from '@/components/team-dashboard/WorkflowTemplateManager';
import { WorkflowScheduler } from '@/components/team-dashboard/WorkflowScheduler';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Calendar,
  Activity,
  BarChart3,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Timer
} from 'lucide-react';

interface ActiveWorkflow {
  id: string;
  name: string;
  type: 'accelerate' | 'blitz' | 'cycle';
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  clientsAffected: number;
  startTime: Date;
  estimatedCompletion: Date;
  error?: string;
}

export default function WorkflowsPage() {
  const { clients } = useTeamMode();
  const [activeTab, setActiveTab] = useState('active');

  // Mock active workflows
  const [activeWorkflows] = useState<ActiveWorkflow[]>([
    {
      id: '1',
      name: 'Daily Accelerate Optimization',
      type: 'accelerate',
      status: 'running',
      progress: 67,
      clientsAffected: 245,
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      estimatedCompletion: new Date(Date.now() + 1800000), // 30 minutes from now
    },
    {
      id: '2',
      name: 'Weekend Blitz Campaign',
      type: 'blitz',
      status: 'running',
      progress: 23,
      clientsAffected: 180,
      startTime: new Date(Date.now() - 1800000), // 30 minutes ago
      estimatedCompletion: new Date(Date.now() + 5400000), // 1.5 hours from now
    },
    {
      id: '3',
      name: 'Weekly Performance Cycle',
      type: 'cycle',
      status: 'paused',
      progress: 45,
      clientsAffected: 1200,
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      estimatedCompletion: new Date(Date.now() + 3600000), // 1 hour from now
    },
    {
      id: '4',
      name: 'Emergency Content Push',
      type: 'blitz',
      status: 'completed',
      progress: 100,
      clientsAffected: 89,
      startTime: new Date(Date.now() - 14400000), // 4 hours ago
      estimatedCompletion: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: '5',
      name: 'Content Analysis Batch',
      type: 'cycle',
      status: 'failed',
      progress: 15,
      clientsAffected: 567,
      startTime: new Date(Date.now() - 10800000), // 3 hours ago
      estimatedCompletion: new Date(Date.now() + 1800000), // 30 minutes from now
      error: 'API rate limit exceeded'
    }
  ]);

  const getStatusIcon = (status: ActiveWorkflow['status']) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-mint" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Square className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ActiveWorkflow['status']) => {
    switch (status) {
      case 'running': return 'bg-mint/20 text-mint border-mint';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getWorkflowIcon = (type: ActiveWorkflow['type']) => {
    switch (type) {
      case 'accelerate': return <Zap className="h-4 w-4" />;
      case 'blitz': return <Calendar className="h-4 w-4" />;
      case 'cycle': return <Activity className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const formatDuration = (date: Date) => {
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeRemaining = (estimatedCompletion: Date) => {
    const now = new Date();
    const diff = estimatedCompletion.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  // Statistics
  const runningWorkflows = activeWorkflows.filter(w => w.status === 'running').length;
  const completedToday = activeWorkflows.filter(w => 
    w.status === 'completed' && 
    new Date(w.startTime).toDateString() === new Date().toDateString()
  ).length;
  const totalClientsProcessed = activeWorkflows
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.clientsAffected, 0);
  const avgProcessingTime = '23 minutes'; // Mock data

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">Manage automated workflows and monitor execution across your client portfolio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{runningWorkflows}</p>
              </div>
              <div className="p-3 bg-mint/20 rounded-full">
                <Play className="h-6 w-6 text-mint" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedToday}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients Processed</p>
                <p className="text-2xl font-bold">{totalClientsProcessed.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-lavender/20 rounded-full">
                <Users className="h-6 w-6 text-lavender" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{avgProcessingTime}</p>
              </div>
              <div className="p-3 bg-coral/20 rounded-full">
                <Timer className="h-6 w-6 text-coral" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Active Workflows */}
          <div className="space-y-4">
            {activeWorkflows.map(workflow => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getWorkflowIcon(workflow.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <Badge variant="outline" className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)}
                            <span className="ml-1 capitalize">{workflow.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{workflow.clientsAffected} clients</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Running for {formatDuration(workflow.startTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="h-4 w-4" />
                            <span>{getTimeRemaining(workflow.estimatedCompletion)}</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{workflow.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-mint h-2 rounded-full transition-all duration-300"
                              style={{ width: `${workflow.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Error Message */}
                        {workflow.error && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-sm text-red-800">
                              <AlertCircle className="h-4 w-4" />
                              <span>Error: {workflow.error}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {workflow.status === 'running' && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {workflow.status === 'paused' && (
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {(workflow.status === 'running' || workflow.status === 'paused') && (
                        <Button variant="outline" size="sm">
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {activeWorkflows.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No Active Workflows</h3>
                    <p className="text-muted-foreground">Start a new workflow to automate your client operations</p>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <WorkflowTemplateManager />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <WorkflowScheduler />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Workflow Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Workflow Performance</span>
                </CardTitle>
                <CardDescription>Success rates and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="text-sm font-medium text-mint">94.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Duration</span>
                    <span className="text-sm font-medium">23 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clients per Hour</span>
                    <span className="text-sm font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium text-coral">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Workflow Types</span>
                </CardTitle>
                <CardDescription>Distribution of workflow executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-mint" />
                      <span className="text-sm">Accelerate</span>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-lavender" />
                      <span className="text-sm">Blitz</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-coral" />
                      <span className="text-sm">Cycle</span>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow History</CardTitle>
              <CardDescription>Last 10 completed workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeWorkflows.filter(w => w.status === 'completed' || w.status === 'failed').map(workflow => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getWorkflowIcon(workflow.type)}
                      <div>
                        <p className="font-medium text-sm">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {workflow.clientsAffected} clients • {formatDuration(workflow.startTime)} duration
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1 capitalize">{workflow.status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 