import { TaskClassifier, ModelRouter, ContextBuilder, PromptOrchestrator, Task } from '@karyo/ai-core';
import { AgentResult, Tool } from './types';
/**
 * Agent Loop Engine
 *
 * Orchestrates the complete agent execution cycle:
 * 1. Plan → 2. Execute → 3. Evaluate → 4. Repeat (if needed)
 *
 * Supports multi-agent expansion and failure handling
 * Integrates with AI Core for intelligent task processing
 */
export declare class AgentLoop {
    private taskClassifier;
    private modelRouter;
    private contextBuilder;
    private promptOrchestrator;
    private planner;
    private executor;
    private evaluator;
    private maxIterations;
    private tools;
    constructor(taskClassifier: TaskClassifier, modelRouter: ModelRouter, contextBuilder: ContextBuilder, promptOrchestrator: PromptOrchestrator);
    /**
     * Execute a task through the complete agent loop
     * @param task - The task to execute
     * @param userTier - User's subscription tier
     * @returns Final execution result
     */
    executeTask(task: Task, userTier?: 'free' | 'premium' | 'enterprise'): Promise<AgentResult>;
    /**
     * Register a tool for use by the executor agent
     */
    registerTool(tool: Tool): void;
    /**
     * Get available tools
     */
    getAvailableTools(): Tool[];
    /**
     * Configure loop parameters
     */
    configure(options: {
        maxIterations?: number;
        executorRetries?: number;
    }): void;
    /**
     * Register default built-in tools
     */
    private registerDefaultTools;
}
//# sourceMappingURL=agent-loop.d.ts.map