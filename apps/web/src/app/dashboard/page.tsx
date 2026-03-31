'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Bot,
  FileText,
  Building2,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Download,
  Upload,
  Loader2,
  Activity,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  progress: number;
  createdAt: string;
  result?: string;
}

interface Workspace {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  category: string;
  createdAt: string;
  avatar?: string;
}

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface SystemMetrics {
  activeTasks: number;
  totalAgents: number;
  dataProcessed: number;
  uptime: number;
  costToday: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeTasks: 0,
    totalAgents: 0,
    dataProcessed: 0,
    uptime: 0,
    costToday: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize data
    const loadDashboardData = async () => {
      try {
        // Load tasks
        const tasksResponse = await fetch('/api/tasks');
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }

        // Load agents
        const agentsResponse = await fetch('/api/agents');
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json();
          setAgents(agentsData);
        }

        // Load files
        const filesResponse = await fetch('/api/files');
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          setFiles(filesData);
        }

        // Load workspaces
        const workspacesResponse = await fetch('/api/workspaces');
        if (workspacesResponse.ok) {
          const workspacesData = await workspacesResponse.json();
          setWorkspaces(workspacesData);
        }

        // Load metrics
        const metricsResponse = await fetch('/api/metrics');
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const navigation = [
    { name: 'Overview', id: 'overview', icon: LayoutDashboard, current: activeTab === 'overview' },
    { name: 'Tasks', id: 'tasks', icon: CheckSquare, current: activeTab === 'tasks' },
    { name: 'Agents', id: 'agents', icon: Bot, current: activeTab === 'agents' },
    { name: 'Files', id: 'files', icon: FileText, current: activeTab === 'files' },
    { name: 'Workspaces', id: 'workspaces', icon: Building2, current: activeTab === 'workspaces' },
    { name: 'Analytics', id: 'analytics', icon: BarChart3, current: activeTab === 'analytics' },
    { name: 'Settings', id: 'settings', icon: Settings, current: activeTab === 'settings' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-blue-100 mt-1">Here's what's happening with your AI workspace today.</p>
          </div>
          <div className="hidden md:block">
            <Sparkles className="h-12 w-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dataProcessed}GB</div>
            <p className="text-xs text-muted-foreground">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              99.9% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest task executions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'running' ? 'bg-blue-500' :
                        task.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'running' ? 'secondary' :
                      task.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Agents</CardTitle>
            <CardDescription>Currently running AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {agents.filter(agent => agent.status === 'active').slice(0, 5).map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.type}</p>
                    </div>
                    <Badge variant="secondary">{agent.category}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-muted-foreground">Manage and monitor your AI tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>A list of all your tasks and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'running' ? 'secondary' :
                      task.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.type}</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  {task.status === 'running' && (
                    <Progress value={task.progress} className="mt-3" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agents</h2>
          <p className="text-muted-foreground">Manage your AI agents and their capabilities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={agent.avatar} />
                  <AvatarFallback>
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.type}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{agent.category}</Badge>
                <Badge variant={
                  agent.status === 'active' ? 'default' :
                  agent.status === 'inactive' ? 'secondary' : 'outline'
                }>
                  {agent.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Files</h2>
          <p className="text-muted-foreground">Manage your uploaded files and documents</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Files</CardTitle>
          <CardDescription>Your uploaded files and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkspaces = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workspaces</h2>
          <p className="text-muted-foreground">Manage your collaborative workspaces</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={workspace.avatar} />
                  <AvatarFallback>
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                  <CardDescription>{workspace.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Open Workspace
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Insights into your AI workspace performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Usage analytics
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Cost analytics
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-karyo-dark">
      {/* Header */}
      <header className="bg-karyo-darker border-b border-karyo-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-karyo-cyan">KARYO OS</h1>
              <span className="ml-2 text-sm text-karyo-text-secondary">AI-Native Workspace</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="karyo-input"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.role})
                  </option>
                ))}
              </select>
              {sessionActive ? (
                <button
                  onClick={endSession}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  End Session
                </button>
              ) : (
                <button
                  onClick={startSession}
                  className="bg-karyo-cyan text-karyo-dark px-4 py-2 rounded-md hover:bg-karyo-cyan-dark font-medium"
                >
                  Start Session
                </button>
              )}
              <button
                onClick={logout}
                className="bg-karyo-gray text-karyo-text px-4 py-2 rounded-md hover:bg-karyo-gray-light"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - AI Control */}
          <div className="lg:col-span-3 space-y-6">
            <AIControlPanel />
            <AgentStatus />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            {/* Task Input */}
            <TaskInput onSubmit={handleTaskSubmit} />

            {/* Execution Timeline */}
            <ExecutionTimeline />

            {/* Output Panel */}
            <OutputPanel />
          </div>

          {/* Right Sidebar - Session Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Session Status */}
            {sessionActive && sessionStartTime && (
              <div className="bg-karyo-gray rounded-lg p-4">
                <h3 className="text-lg font-semibold text-karyo-text mb-3">
                  Session Active
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-karyo-text-secondary">Started:</span>
                    <span className="text-karyo-text">{sessionStartTime.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-karyo-text-secondary">Duration:</span>
                    <span className="text-karyo-text">
                      {Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)} min
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Updates */}
            <div className="bg-karyo-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold text-karyo-text mb-3">
                System Events
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {realTimeUpdates.slice(-8).map((update, index) => (
                  <div key={index} className="text-sm text-karyo-text-secondary py-1 border-b border-karyo-gray-light last:border-b-0">
                    {update}
                  </div>
                ))}
              </div>
            </div>

            {/* File Vault */}
            <div className="bg-karyo-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold text-karyo-text mb-3">
                Digital Vault
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.length === 0 ? (
                  <div className="text-karyo-text-secondary text-sm">No files uploaded</div>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between py-2 border-b border-karyo-gray-light last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-karyo-text truncate">{file.name}</p>
                        <p className="text-xs text-karyo-text-secondary">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button className="text-karyo-cyan hover:text-karyo-cyan-dark text-sm ml-2">
                        Use with AI
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Integrations */}
            <IntegrationPanel workspaceId={selectedWorkspace} />
            <IntegrationTool workspaceId={selectedWorkspace} />
          </div>
        </div>
      </main>
    </div>
  );
}
