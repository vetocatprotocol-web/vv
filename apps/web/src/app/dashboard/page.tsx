'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import TaskInput from '@/components/ai/TaskInput';
import ExecutionTimeline from '@/components/ai/ExecutionTimeline';
import AIControlPanel from '@/components/ai/AIControlPanel';
import AgentStatus from '@/components/ai/AgentStatus';
import OutputPanel from '@/components/ai/OutputPanel';
import { IntegrationPanel, IntegrationTool } from '@/components/integrations';
import { useAIWorkspace } from '@/lib/store';

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
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  category: string;
  createdAt: string;
}

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  // AI Workspace store
  const {
    addExecutionStep,
    updateExecutionStep,
    completeExecution,
    failExecution,
    updateAgent,
    addCost,
    addResult,
    currentTask
  } = useAIWorkspace();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setRealTimeUpdates(prev => [...prev, 'Connected to real-time updates']);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setRealTimeUpdates(prev => [...prev, 'Disconnected from real-time updates']);
    });

    socketRef.current.on('taskStatusChanged', (data) => {
      console.log('Task status changed:', data);
      setRealTimeUpdates(prev => [...prev, `Task "${data.title}" status: ${data.status} (${data.progress}%)`]);

      // Update AI workspace state
      if (data.status === 'running') {
        addExecutionStep({
          title: 'Task Execution',
          description: `Executing: ${data.title}`,
          status: 'running',
        });
      } else if (data.status === 'completed') {
        updateExecutionStep('step-1', { status: 'completed', output: data.result });
        completeExecution(data.result ? {
          id: `result-${Date.now()}`,
          content: data.result,
          type: 'text',
          timestamp: new Date(),
        } : undefined);
      }
    });

    socketRef.current.on('agentStatusChanged', (data) => {
      console.log('Agent status changed:', data);
      setRealTimeUpdates(prev => [...prev, `Agent "${data.name}" status: ${data.status}`]);

      // Update agent status in AI workspace
      updateAgent(data.id, { status: data.status });
    });

    fetchWorkspaces();
    fetchAgents();
    fetchFiles();
    startSession();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/workspaces/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setWorkspaces(data);
      if (data.length > 0) {
        setSelectedWorkspace(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const startSession = () => {
    setSessionActive(true);
    setSessionStartTime(new Date());
    setRealTimeUpdates(prev => [...prev, 'AI Workspace session started']);
  };

  const endSession = () => {
    setSessionActive(false);
    setSessionStartTime(null);
    setRealTimeUpdates(prev => [...prev, 'AI Workspace session ended']);
  };

  const handleTaskSubmit = async (command: string, mode: string, goal?: string, data?: string) => {
    try {
      // Simulate AI processing steps
      addExecutionStep({
        title: 'Command Analysis',
        description: 'Analyzing your request and determining execution strategy',
        status: 'running',
      });

      setTimeout(() => {
        updateExecutionStep('step-1', { status: 'completed' });
        addExecutionStep({
          title: 'Agent Assignment',
          description: `Assigning ${mode} mode execution`,
          status: 'running',
        });
      }, 1000);

      setTimeout(() => {
        updateExecutionStep('step-2', { status: 'completed' });
        addExecutionStep({
          title: 'Task Execution',
          description: 'Executing your request with AI assistance',
          status: 'running',
        });
      }, 2000);

      // Simulate API call
      const response = await fetch('http://localhost:3001/api/v1/command/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          command,
          workspaceId: selectedWorkspace,
          mode,
          goal,
          data,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Complete execution
        updateExecutionStep('step-3', {
          status: 'completed',
          output: `Task completed successfully: ${result.message || 'Done'}`
        });

        completeExecution({
          id: `result-${Date.now()}`,
          content: result.result || `Successfully executed: ${command}`,
          type: 'text',
          timestamp: new Date(),
          metadata: { mode, goal, data }
        });

        addCost(0.0025); // Simulate cost
      } else {
        failExecution(result.message || 'Task execution failed');
      }
    } catch (error) {
      console.error('Error executing task:', error);
      failExecution('Network error occurred');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-karyo-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-cyan text-6xl mb-4">🚀</div>
          <div className="text-karyo-cyan text-xl font-semibold">Initializing KARYO OS</div>
          <div className="text-karyo-text-secondary mt-2">Loading AI Workspace...</div>
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
