import { TaskClassifier, ModelRouter, ContextBuilder, PromptOrchestrator, ClassifiedTask } from '@karyo/ai-core';
import { AgentExecutionContext } from '../types';
/**
 * Planner Agent
 *
 * Breaks down complex tasks into executable steps
 * Uses AI Core for task understanding and prompt generation
 * Creates structured execution plans for multi-step tasks
 */
export declare class PlannerAgent {
    private taskClassifier;
    private modelRouter;
    private contextBuilder;
    private promptOrchestrator;
    constructor(taskClassifier: TaskClassifier, modelRouter: ModelRouter, contextBuilder: ContextBuilder, promptOrchestrator: PromptOrchestrator);
    /**
     * Create an execution plan for a task
     * @param task - The task to plan
     * @param userTier - User's subscription tier
     * @returns Complete execution context with plan
     */
    createExecutionPlan(task: ClassifiedTask, userTier?: 'free' | 'premium' | 'enterprise'): Promise<AgentExecutionContext>;
    /**
     * Generate a detailed execution plan using AI
     */
    private generatePlan;
    /**
     * Break down task into executable steps
     * Uses task complexity and keywords to determine steps
     */
    private breakDownTask;
}
//# sourceMappingURL=planner-agent.d.ts.map