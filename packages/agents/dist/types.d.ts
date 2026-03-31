import { ClassifiedTask, ModelConfig, ContextData, PromptTemplate } from '@karyo/ai-core';
export interface AgentStep {
    id: string;
    description: string;
    tool?: string;
    parameters?: Record<string, any>;
    dependencies?: string[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    output?: any;
    error?: string;
    retryCount?: number;
}
export interface ExecutionPlan {
    taskId: string;
    steps: AgentStep[];
    totalSteps: number;
    completedSteps: number;
    status: 'planning' | 'executing' | 'completed' | 'failed';
}
export interface AgentExecutionContext {
    task: ClassifiedTask;
    model: ModelConfig;
    context: ContextData;
    prompt: PromptTemplate;
    executionPlan: ExecutionPlan;
}
export interface AgentResult {
    success: boolean;
    output: any;
    steps: AgentStep[];
    totalTokens: number;
    executionTime: number;
    quality: 'low' | 'medium' | 'high';
    feedback?: string;
}
export interface Tool {
    name: string;
    description: string;
    execute: (parameters: Record<string, any>) => Promise<any>;
    validateParameters?: (parameters: Record<string, any>) => boolean;
}
export type AgentType = 'planner' | 'executor' | 'evaluator';
export interface AgentConfig {
    type: AgentType;
    maxRetries: number;
    timeout: number;
    tools?: Tool[];
}
//# sourceMappingURL=types.d.ts.map