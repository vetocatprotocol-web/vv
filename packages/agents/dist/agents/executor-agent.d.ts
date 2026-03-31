import { AgentExecutionContext, Tool, AgentResult } from '../types';
/**
 * Executor Agent
 *
 * Executes individual steps in an execution plan
 * Uses tools to perform actual work
 * Handles retries and error recovery
 * Supports parallel execution of independent steps
 */
export declare class ExecutorAgent {
    private tools;
    private maxRetries;
    /**
     * Register a tool for execution
     */
    registerTool(tool: Tool): void;
    /**
     * Execute an entire execution plan
     * @param context - The execution context with plan
     * @returns Complete execution result
     */
    executePlan(context: AgentExecutionContext): Promise<AgentResult>;
    /**
     * Execute steps respecting dependencies
     */
    private executeStepsInOrder;
    /**
     * Execute a single step with retry logic
     */
    private executeStep;
    /**
     * Execute step using the appropriate tool
     */
    private executeStepWithTool;
    /**
     * Aggregate outputs from all executed steps
     */
    private aggregateStepOutputs;
    /**
     * Evaluate the quality of execution
     */
    private evaluateQuality;
    /**
     * Utility delay function
     */
    private delay;
}
//# sourceMappingURL=executor-agent.d.ts.map