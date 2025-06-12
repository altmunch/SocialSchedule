'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Play, 
  Pause, 
  SkipForward, 
  Edit3, 
  Trash2, 
  Plus,
  Zap,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle2,
  Users,
  Settings,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledWorkflow {
  id: string;
  name: string;
  workflowType: 'accelerate' | 'blitz' | 'cycle' | 'custom';
  schedule: {
    type: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    date?: Date;
  };
  targets: {
    type: 'all' | 'filtered' | 'selected';
    filters?: Record<string, any>;
    clientIds?: string[];
  };
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runHistory: {
    date: Date;
    status: 'success' | 'failed' | 'partial';
    clientsProcessed: number;
    errors?: string[];
  }[];
  createdAt: Date;
}

export function WorkflowScheduler() {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ScheduledWorkflow | null>(null);

  // Mock scheduled workflows
  const [scheduledWorkflows, setScheduledWorkflows] = useState<ScheduledWorkflow[]>([
    {
      id: 'wf-1',
      name: 'Daily Content Optimization',
      workflowType: 'accelerate',
      schedule: {
        type: 'daily',
        time: '09:00'
      },
      targets: {
        type: 'filtered',
        filters: { status: ['active'], engagement: [0, 5] }
      },
      isActive: true,
      lastRun: new Date('2025-01-20T09:00:00'),
      nextRun: new Date('2025-01-21T09:00:00'),
      runHistory: [
        {
          date: new Date('2025-01-20T09:00:00'),
          status: 'success',
          clientsProcessed: 245
        },
        {
          date: new Date('2025-01-19T09:00:00'),
          status: 'success',
          clientsProcessed: 238
        }
      ],
      createdAt: new Date('2025-01-01')
    },
    {
      id: 'wf-2',
      name: 'Weekly Performance Reports',
      workflowType: 'cycle',
      schedule: {
        type: 'weekly',
        time: '08:00',
        daysOfWeek: [1] // Monday
      },
      targets: {
        type: 'all'
      },
      isActive: true,
      lastRun: new Date('2025-01-20T08:00:00'),
      nextRun: new Date('2025-01-27T08:00:00'),
      runHistory: [
        {
          date: new Date('2025-01-20T08:00:00'),
          status: 'success',
          clientsProcessed: 1234
        }
      ],
      createdAt: new Date('2025-01-05')
    },
    {
      id: 'wf-3',
      name: 'High Priority Client Blitz',
      workflowType: 'blitz',
      schedule: {
        type: 'weekly',
        time: '10:30',
        daysOfWeek: [2, 4] // Tuesday, Thursday
      },
      targets: {
        type: 'filtered',
        filters: { tags: ['High Priority', 'VIP Client'] }
      },
      isActive: false,
      lastRun: new Date('2025-01-16T10:30:00'),
      nextRun: new Date('2025-01-21T10:30:00'),
      runHistory: [
        {
          date: new Date('2025-01-16T10:30:00'),
          status: 'partial',
          clientsProcessed: 45,
          errors: ['API rate limit exceeded for 3 clients']
        }
      ],
      createdAt: new Date('2025-01-10')
    }
  ]);

  // New workflow form state
  const [newWorkflow, setNewWorkflow] = useState<Partial<ScheduledWorkflow>>({
    name: '',
    workflowType: 'accelerate',
    schedule: {
      type: 'daily',
      time: '09:00'
    },
    targets: {
      type: 'all'
    },
    isActive: true
  });

  const workflowTypeIcons = {
    accelerate: Zap,
    blitz: Target,
    cycle: RefreshCw,
    custom: Settings
  };

  const workflowTypeColors = {
    accelerate: 'text-mint bg-mint/10 border-mint/20',
    blitz: 'text-lavender bg-lavender/10 border-lavender/20',
    cycle: 'text-coral bg-coral/10 border-coral/20',
    custom: 'text-info bg-info/10 border-info/20'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-mint bg-mint/10 border-mint/20';
      case 'failed': return 'text-coral bg-coral/10 border-coral/20';
      case 'partial': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getScheduleDescription = (schedule: ScheduledWorkflow['schedule']) => {
    const time = schedule.time;
    
    switch (schedule.type) {
      case 'once':
        return `Once on ${schedule.date ? format(schedule.date, 'MMM dd, yyyy') : 'TBD'} at ${time}`;
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        const days = schedule.daysOfWeek?.map(day => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
        ).join(', ');
        return `Weekly on ${days || 'TBD'} at ${time}`;
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth || 1} at ${time}`;
      default:
        return 'No schedule set';
    }
  };

  const getTargetDescription = (targets: ScheduledWorkflow['targets']) => {
    switch (targets.type) {
      case 'all':
        return 'All clients';
      case 'filtered':
        const filterCount = Object.keys(targets.filters || {}).length;
        return `Filtered clients (${filterCount} filter${filterCount !== 1 ? 's' : ''})`;
      case 'selected':
        return `${targets.clientIds?.length || 0} selected clients`;
      default:
        return 'No targets set';
    }
  };

  const toggleWorkflowStatus = (id: string) => {
    setScheduledWorkflows(workflows => 
      workflows.map(wf => 
        wf.id === id ? { ...wf, isActive: !wf.isActive } : wf
      )
    );
  };

  const duplicateWorkflow = (workflow: ScheduledWorkflow) => {
    const duplicated = {
      ...workflow,
      id: `wf-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      isActive: false,
      lastRun: undefined,
      nextRun: undefined,
      runHistory: [],
      createdAt: new Date()
    };
    setScheduledWorkflows([...scheduledWorkflows, duplicated]);
  };

  const deleteWorkflow = (id: string) => {
    setScheduledWorkflows(workflows => workflows.filter(wf => wf.id !== id));
  };

  const runWorkflowNow = (id: string) => {
    // Simulate running workflow
    console.log(`Running workflow ${id} now...`);
  };

  const createWorkflow = () => {
    if (!newWorkflow.name) return;

    const workflow: ScheduledWorkflow = {
      id: `wf-${Date.now()}`,
      name: newWorkflow.name,
      workflowType: newWorkflow.workflowType || 'accelerate',
      schedule: newWorkflow.schedule || { type: 'daily', time: '09:00' },
      targets: newWorkflow.targets || { type: 'all' },
      isActive: newWorkflow.isActive || true,
      runHistory: [],
      createdAt: new Date()
    };

    setScheduledWorkflows([...scheduledWorkflows, workflow]);
    setNewWorkflow({
      name: '',
      workflowType: 'accelerate',
      schedule: { type: 'daily', time: '09:00' },
      targets: { type: 'all' },
      isActive: true
    });
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-creative">Workflow Scheduler</h2>
          <p className="text-muted-foreground">
            Automate workflows across your client portfolio
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          New Scheduled Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scheduled">Scheduled Workflows</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {scheduledWorkflows.map((workflow) => {
              const IconComponent = workflowTypeIcons[workflow.workflowType];
              
              return (
                <Card key={workflow.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 rounded-lg ${workflowTypeColors[workflow.workflowType]}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">{workflow.name}</h3>
                            <Badge className={workflow.isActive ? 'bg-mint/20 text-mint border-mint' : 'bg-muted'}>
                              {workflow.isActive ? 'Active' : 'Paused'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {workflow.workflowType}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Schedule:</span>
                              <p className="font-medium">{getScheduleDescription(workflow.schedule)}</p>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Targets:</span>
                              <p className="font-medium">{getTargetDescription(workflow.targets)}</p>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Next Run:</span>
                              <p className="font-medium">
                                {workflow.nextRun ? 
                                  format(workflow.nextRun, 'MMM dd, HH:mm') : 
                                  'Not scheduled'
                                }
                              </p>
                            </div>
                          </div>
                          
                          {workflow.lastRun && (
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>
                                Last run: {format(workflow.lastRun, 'MMM dd, HH:mm')}
                              </span>
                              {workflow.runHistory.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    workflow.runHistory[0].status === 'success' ? 'bg-mint' :
                                    workflow.runHistory[0].status === 'failed' ? 'bg-coral' : 'bg-warning'
                                  }`}></div>
                                  <span>
                                    {workflow.runHistory[0].clientsProcessed} clients processed
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runWorkflowNow(workflow.id)}
                          disabled={!workflow.isActive}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run Now
                        </Button>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48" align="end">
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSelectedWorkflow(workflow)}
                              >
                                <Edit3 className="h-3 w-3 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => duplicateWorkflow(workflow)}
                              >
                                <Copy className="h-3 w-3 mr-2" />
                                Duplicate
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-coral hover:text-coral"
                                onClick={() => deleteWorkflow(workflow.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {scheduledWorkflows.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No Scheduled Workflows</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first automated workflow to get started
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {scheduledWorkflows.flatMap(wf => 
              wf.runHistory.map(run => ({ ...run, workflowName: wf.name, workflowType: wf.workflowType }))
            )
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 20)
            .map((run, index) => {
              const IconComponent = workflowTypeIcons[run.workflowType];
              
              return (
                <Card key={index} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded ${workflowTypeColors[run.workflowType]}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{run.workflowName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(run.date, 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {run.clientsProcessed} clients processed
                          </p>
                          {run.errors && run.errors.length > 0 && (
                            <p className="text-xs text-coral">
                              {run.errors.length} error{run.errors.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        
                        <Badge className={getStatusColor(run.status)}>
                          {run.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {run.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {run.status === 'partial' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {run.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Daily Content Boost',
                description: 'Run accelerate workflow daily for active clients',
                type: 'accelerate',
                schedule: 'Daily at 9:00 AM',
                popular: true
              },
              {
                name: 'Weekly Analytics',
                description: 'Generate performance reports every Monday',
                type: 'cycle',
                schedule: 'Weekly on Monday at 8:00 AM',
                popular: true
              },
              {
                name: 'High-Priority Blitz',
                description: 'Optimize VIP clients twice weekly',
                type: 'blitz',
                schedule: 'Tue & Thu at 10:30 AM',
                popular: false
              }
            ].map((template, index) => {
              const IconComponent = workflowTypeIcons[template.type as keyof typeof workflowTypeIcons];
              
              return (
                <Card key={index} className="border-border hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded ${workflowTypeColors[template.type as keyof typeof workflowTypeColors]}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Schedule: {template.schedule}
                          </p>
                          
                          <Button size="sm" className="w-full">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Form */}
      {showCreateForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Create Scheduled Workflow</CardTitle>
            <CardDescription>
              Set up automated workflows to run on a schedule
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="Enter workflow name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workflow-type">Workflow Type</Label>
                  <Select
                    value={newWorkflow.workflowType}
                    onValueChange={(value) => setNewWorkflow({ 
                      ...newWorkflow, 
                      workflowType: value as ScheduledWorkflow['workflowType']
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accelerate">Accelerate - Content Optimization</SelectItem>
                      <SelectItem value="blitz">Blitz - Rapid Publishing</SelectItem>
                      <SelectItem value="cycle">Cycle - Analytics & Reports</SelectItem>
                      <SelectItem value="custom">Custom Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select
                    value={newWorkflow.schedule?.type}
                    onValueChange={(value) => setNewWorkflow({ 
                      ...newWorkflow, 
                      schedule: { 
                        ...newWorkflow.schedule, 
                        type: value as ScheduledWorkflow['schedule']['type']
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Run Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={newWorkflow.schedule?.time}
                    onChange={(e) => setNewWorkflow({ 
                      ...newWorkflow, 
                      schedule: { 
                        ...newWorkflow.schedule, 
                        time: e.target.value 
                      }
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newWorkflow.isActive}
                  onCheckedChange={(checked) => setNewWorkflow({ 
                    ...newWorkflow, 
                    isActive: checked 
                  })}
                />
                <Label>Start workflow immediately</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={createWorkflow} disabled={!newWorkflow.name}>
                  Create Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 