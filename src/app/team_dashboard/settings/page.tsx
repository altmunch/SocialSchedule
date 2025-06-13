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
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Zap,
  Globe,
  Clock,
  Key,
  AlertTriangle,
  CheckCircle2,
  Save,
  Upload,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  lastActive: Date;
  permissions: string[];
}

interface ApiIntegration {
  id: string;
  name: string;
  status: 'connected' | 'error' | 'disconnected';
  lastSync: Date;
  isEnabled: boolean;
}

export default function TeamSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Team settings state
  const [teamSettings, setTeamSettings] = useState({
    teamName: 'ClipsCommerce Team',
    defaultTimeZone: 'America/New_York',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    autoRefreshInterval: 30,
    dataRetentionDays: 365,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableBulkOperations: true,
    requireApprovalForBulkOps: false,
    maxConcurrentWorkflows: 10,
    defaultWorkflowTimeout: 300
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailDigests: true,
    clientAlerts: true,
    workflowNotifications: true,
    performanceReports: true,
    systemMaintenance: true,
    securityAlerts: true,
    digestFrequency: 'daily',
    alertThreshold: 'medium'
  });

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'admin',
      lastActive: new Date('2025-01-20T14:30:00'),
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'manager',
      lastActive: new Date('2025-01-20T10:15:00'),
      permissions: ['read', 'write', 'manage_workflows']
    },
    {
      id: 'user-3',
      name: 'Bob Wilson',
      email: 'bob@company.com',
      role: 'analyst',
      lastActive: new Date('2025-01-19T16:45:00'),
      permissions: ['read', 'analytics']
    }
  ]);

  // API integrations
  const [apiIntegrations, setApiIntegrations] = useState<ApiIntegration[]>([
    {
      id: 'instagram-api',
      name: 'Instagram Business API',
      status: 'connected',
      lastSync: new Date('2025-01-20T15:00:00'),
      isEnabled: true
    },
    {
      id: 'tiktok-api',
      name: 'TikTok for Business API',
      status: 'connected',
      lastSync: new Date('2025-01-20T14:45:00'),
      isEnabled: true
    },
    {
      id: 'openai-api',
      name: 'OpenAI API',
      status: 'connected',
      lastSync: new Date('2025-01-20T15:10:00'),
      isEnabled: true
    },
    {
      id: 'analytics-api',
      name: 'Google Analytics 4',
      status: 'error',
      lastSync: new Date('2025-01-19T12:30:00'),
      isEnabled: false
    }
  ]);

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-coral/20 text-coral border-coral';
      case 'manager': return 'bg-lavender/20 text-lavender border-lavender';
      case 'analyst': return 'bg-mint/20 text-mint border-mint';
      case 'viewer': return 'bg-info/20 text-info border-info';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-mint/20 text-mint border-mint';
      case 'error': return 'bg-coral/20 text-coral border-coral';
      case 'disconnected': return 'bg-warning/20 text-warning border-warning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-creative">Team Settings</h1>
          <p className="text-muted-foreground">
            Configure your team dashboard preferences and permissions
          </p>
        </div>
        
        <Button onClick={saveSettings} disabled={isSaving} className="bg-primary text-primary-foreground">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Basic Settings</span>
                </CardTitle>
                <CardDescription>Core team configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={teamSettings.teamName}
                    onChange={(e) => setTeamSettings({ 
                      ...teamSettings, 
                      teamName: e.target.value 
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timezone">Default Time Zone</Label>
                  <Select
                    value={teamSettings.defaultTimeZone}
                    onValueChange={(value) => setTeamSettings({ 
                      ...teamSettings, 
                      defaultTimeZone: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={teamSettings.defaultCurrency}
                    onValueChange={(value) => setTeamSettings({ 
                      ...teamSettings, 
                      defaultCurrency: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Performance Settings */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
                <CardDescription>System performance and refresh settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="refresh-interval">Auto Refresh Interval (seconds)</Label>
                  <Select
                    value={teamSettings.autoRefreshInterval.toString()}
                    onValueChange={(value) => setTeamSettings({ 
                      ...teamSettings, 
                      autoRefreshInterval: parseInt(value) 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="0">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">Enable live data updates</p>
                  </div>
                  <Switch
                    checked={teamSettings.enableRealTimeUpdates}
                    onCheckedChange={(checked) => setTeamSettings({ 
                      ...teamSettings, 
                      enableRealTimeUpdates: checked 
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Advanced Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed analytics processing</p>
                  </div>
                  <Switch
                    checked={teamSettings.enableAnalytics}
                    onCheckedChange={(checked) => setTeamSettings({ 
                      ...teamSettings, 
                      enableAnalytics: checked 
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Toggles */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>Enable or disable specific team dashboard features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bulk Operations</Label>
                      <p className="text-sm text-muted-foreground">Allow bulk client operations</p>
                    </div>
                    <Switch
                      checked={teamSettings.enableBulkOperations}
                      onCheckedChange={(checked) => setTeamSettings({ 
                        ...teamSettings, 
                        enableBulkOperations: checked 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Approval Required</Label>
                      <p className="text-sm text-muted-foreground">Require approval for bulk operations</p>
                    </div>
                    <Switch
                      checked={teamSettings.requireApprovalForBulkOps}
                      onCheckedChange={(checked) => setTeamSettings({ 
                        ...teamSettings, 
                        requireApprovalForBulkOps: checked 
                      })}
                      disabled={!teamSettings.enableBulkOperations}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-workflows">Max Concurrent Workflows</Label>
                    <Select
                      value={teamSettings.maxConcurrentWorkflows.toString()}
                      onValueChange={(value) => setTeamSettings({ 
                        ...teamSettings, 
                        maxConcurrentWorkflows: parseInt(value) 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 workflows</SelectItem>
                        <SelectItem value="10">10 workflows</SelectItem>
                        <SelectItem value="20">20 workflows</SelectItem>
                        <SelectItem value="50">50 workflows</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="workflow-timeout">Default Workflow Timeout (seconds)</Label>
                    <Input
                      id="workflow-timeout"
                      type="number"
                      value={teamSettings.defaultWorkflowTimeout}
                      onChange={(e) => setTeamSettings({ 
                        ...teamSettings, 
                        defaultWorkflowTimeout: parseInt(e.target.value) || 300 
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Members</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
          
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="space-y-0">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border-b border-border last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                      
                      <div className="text-sm text-muted-foreground">
                        Last active: {member.lastActive.toLocaleDateString('en-US')}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-coral hover:text-coral">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">API Integrations</h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiIntegrations.map((integration) => (
              <Card key={integration.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{integration.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {integration.status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {integration.status}
                      </Badge>
                      <Switch
                        checked={integration.isEnabled}
                        onCheckedChange={(checked) => {
                          setApiIntegrations(prev => prev.map(api => 
                            api.id === integration.id 
                              ? { ...api, isEnabled: checked }
                              : api
                          ));
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span>{integration.lastSync.toLocaleString('en-US')}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">API Key:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">
                          {showApiKeys[integration.id] ? 'sk-1234567890abcdef...' : '••••••••••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKeys(prev => ({
                            ...prev,
                            [integration.id]: !prev[integration.id]
                          }))}
                        >
                          {showApiKeys[integration.id] ? 
                            <EyeOff className="h-3 w-3" /> : 
                            <Eye className="h-3 w-3" />
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Test Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Digest</Label>
                      <p className="text-sm text-muted-foreground">Daily summary of activity</p>
                    </div>
                    <Switch
                      checked={notifications.emailDigests}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        emailDigests: checked 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Client Alerts</Label>
                      <p className="text-sm text-muted-foreground">Issues requiring attention</p>
                    </div>
                    <Switch
                      checked={notifications.clientAlerts}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        clientAlerts: checked 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Workflow Updates</Label>
                      <p className="text-sm text-muted-foreground">Workflow completion/failure notifications</p>
                    </div>
                    <Switch
                      checked={notifications.workflowNotifications}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        workflowNotifications: checked 
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">System Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performance Reports</Label>
                      <p className="text-sm text-muted-foreground">Weekly performance summaries</p>
                    </div>
                    <Switch
                      checked={notifications.performanceReports}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        performanceReports: checked 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Security-related notifications</p>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        securityAlerts: checked 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="alert-threshold">Alert Threshold</Label>
                    <Select
                      value={notifications.alertThreshold}
                      onValueChange={(value) => setNotifications({ 
                        ...notifications, 
                        alertThreshold: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - All notifications</SelectItem>
                        <SelectItem value="medium">Medium - Important only</SelectItem>
                        <SelectItem value="high">High - Critical only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Advanced data and system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                <Select
                  value={teamSettings.dataRetentionDays.toString()}
                  onValueChange={(value) => setTeamSettings({ 
                    ...teamSettings, 
                    dataRetentionDays: parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                    <SelectItem value="-1">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Data Export & Import</h4>
                
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Export includes all client data, analytics, and configuration settings. 
                  Import allows restoration from previous exports.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium text-coral">Danger Zone</h4>
                
                <div className="p-4 rounded-lg border border-coral/20 bg-coral/5">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-coral mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-coral">Reset Team Dashboard</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        This will reset all team settings to defaults. Client data will be preserved.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 border-coral text-coral hover:bg-coral hover:text-white">
                        Reset Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 