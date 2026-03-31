import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AIMode = 'auto' | 'assist' | 'manual';

export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
  duration?: number;
  output?: string;
  error?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'planner' | 'executor' | 'evaluator';
  status: 'idle' | 'active' | 'busy' | 'error';
  currentTask?: string;
  model?: string;
  cost?: number;
}

export interface TaskResult {
  id: string;
  content: string;
  type: 'text' | 'file' | 'data' | 'analysis';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AIWorkspaceState {
  // Current task state
  currentTask: {
    id: string | null;
    command: string;
    mode: AIMode;
    goal: string;
    data: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    createdAt: Date | null;
  };

  // Execution state
  executionSteps: ExecutionStep[];
  isExecuting: boolean;

  // AI agents state
  agents: AIAgent[];
  currentModel: string;
  totalCost: number;

  // Results state
  results: TaskResult[];

  // UI state
  selectedMode: AIMode;
  showLogs: boolean;
  showTimeline: boolean;

  // Actions
  setCurrentTask: (task: Partial<AIWorkspaceState['currentTask']>) => void;
  startExecution: (command: string, mode: AIMode, goal?: string, data?: string) => void;
  updateExecutionStep: (stepId: string, updates: Partial<ExecutionStep>) => void;
  addExecutionStep: (step: Omit<ExecutionStep, 'id' | 'timestamp'>) => void;
  completeExecution: (result?: TaskResult) => void;
  failExecution: (error: string) => void;
  resetExecution: () => void;

  updateAgent: (agentId: string, updates: Partial<AIAgent>) => void;
  setCurrentModel: (model: string) => void;
  addCost: (amount: number) => void;

  addResult: (result: TaskResult) => void;
  clearResults: () => void;

  setSelectedMode: (mode: AIMode) => void;
  toggleLogs: () => void;
  toggleTimeline: () => void;
}

export const useAIWorkspace = create<AIWorkspaceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentTask: {
        id: null,
        command: '',
        mode: 'manual',
        goal: '',
        data: '',
        status: 'idle',
        createdAt: null,
      },

      executionSteps: [],
      isExecuting: false,

      agents: [
        {
          id: 'planner-1',
          name: 'Task Planner',
          type: 'planner',
          status: 'idle',
        },
        {
          id: 'executor-1',
          name: 'Task Executor',
          type: 'executor',
          status: 'idle',
        },
        {
          id: 'evaluator-1',
          name: 'Result Evaluator',
          type: 'evaluator',
          status: 'idle',
        },
      ],

      currentModel: 'gpt-4',
      totalCost: 0,

      results: [],

      selectedMode: 'manual',
      showLogs: false,
      showTimeline: false,

      // Actions
      setCurrentTask: (task) =>
        set((state) => ({
          currentTask: { ...state.currentTask, ...task },
        })),

      startExecution: (command, mode, goal = '', data = '') => {
        const taskId = `task-${Date.now()}`;
        set({
          currentTask: {
            id: taskId,
            command,
            mode,
            goal,
            data,
            status: 'processing',
            createdAt: new Date(),
          },
          executionSteps: [],
          isExecuting: true,
          showTimeline: true,
        });
      },

      updateExecutionStep: (stepId, updates) =>
        set((state) => ({
          executionSteps: state.executionSteps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        })),

      addExecutionStep: (step) => {
        const newStep: ExecutionStep = {
          ...step,
          id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          executionSteps: [...state.executionSteps, newStep],
        }));
      },

      completeExecution: (result) => {
        set((state) => ({
          currentTask: { ...state.currentTask, status: 'completed' },
          isExecuting: false,
          results: result ? [...state.results, result] : state.results,
        }));
      },

      failExecution: (error) => {
        set((state) => ({
          currentTask: { ...state.currentTask, status: 'error' },
          isExecuting: false,
          executionSteps: state.executionSteps.map((step) =>
            step.status === 'running' ? { ...step, status: 'error', error } : step
          ),
        }));
      },

      resetExecution: () => {
        set({
          currentTask: {
            id: null,
            command: '',
            mode: 'manual',
            goal: '',
            data: '',
            status: 'idle',
            createdAt: null,
          },
          executionSteps: [],
          isExecuting: false,
          results: [],
        });
      },

      updateAgent: (agentId, updates) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId ? { ...agent, ...updates } : agent
          ),
        })),

      setCurrentModel: (model) =>
        set({ currentModel: model }),

      addCost: (amount) =>
        set((state) => ({ totalCost: state.totalCost + amount })),

      addResult: (result) =>
        set((state) => ({ results: [...state.results, result] })),

      clearResults: () =>
        set({ results: [] }),

      setSelectedMode: (mode) =>
        set({ selectedMode: mode }),

      toggleLogs: () =>
        set((state) => ({ showLogs: !state.showLogs })),

      toggleTimeline: () =>
        set((state) => ({ showTimeline: !state.showTimeline })),
    }),
    {
      name: 'ai-workspace-store',
    }
  )
);