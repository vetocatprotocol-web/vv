import { ContextBuilder } from '@karyo/ai-core';
import { SemanticSearch } from './semantic-search';
import { ShortTermMemory } from './short-term-memory';
import { LongTermMemory } from './long-term-memory';
import { Task, ContextData } from '@karyo/ai-core';
/**
 * Memory Injector
 *
 * Integrates memory system with AI Core's context builder
 * Automatically injects relevant memories into AI prompts
 * Manages memory lifecycle and context enrichment
 */
export declare class MemoryInjector {
    private contextBuilder;
    private semanticSearch;
    private shortTermMemory;
    private longTermMemory;
    constructor(contextBuilder: ContextBuilder, semanticSearch: SemanticSearch, shortTermMemory: ShortTermMemory, longTermMemory: LongTermMemory);
    /**
     * Build enriched context with memory injection
     * @param taskOrContext - Either a Task object or context object
     * @param userId - User identifier (if taskOrContext is Task)
     * @param workspaceId - Workspace identifier (if taskOrContext is Task)
     * @param sessionId - Current session ID for short-term memory
     * @returns Enhanced context data
     */
    buildEnrichedContext(taskOrContext: Task | Record<string, any>, userId?: string, workspaceId?: string, sessionId?: string): Promise<ContextData | Record<string, any>>;
    /**
     * Build enriched context for a Task object
     */
    private buildEnrichedContextForTask;
    /**
     * Find memories relevant to the current task
     */
    private findRelevantMemories;
    /**
     * Store the current task interaction in short-term memory
     */
    private storeInteraction;
    /**
     * Store task execution result in long-term memory
     */
    storeTaskResult(task: Task, result: {
        success: boolean;
        output: any;
        executionTime: number;
    }, userId: string, workspaceId: string): Promise<void>;
    /**
     * Store task execution result in memory
     */
    storeExecutionResult(task: string, result: any, success: boolean): Promise<void>;
    /**
     * Find basic memories for context enrichment
     */
    private findBasicMemories;
    /**
     * Learn from user feedback and update memory patterns
     */
    learnFromFeedback(task: Task, feedback: {
        rating: number;
        comments?: string;
    }, userId: string, workspaceId: string): Promise<void>;
    /**
     * Extract and store user preferences from interactions
     */
    extractUserPreferences(interactions: Array<{
        task: Task;
        result: any;
        feedback?: any;
    }>, userId: string, workspaceId: string): Promise<void>;
    /**
     * Get memory insights for a user
     */
    getMemoryInsights(userId: string, workspaceId: string): Promise<{
        totalMemories: number;
        commonPatterns: string[];
        preferences: string[];
        recentActivity: string[];
    }>;
    /**
     * Remove duplicate memories
     */
    private deduplicateMemories;
    /**
     * Rank and limit memories by relevance
     */
    private rankAndLimitMemories;
    /**
     * Calculate memory relevance score
     */
    private calculateMemoryRelevance;
    /**
     * Reinforce positive patterns from successful tasks
     */
    private reinforcePositivePattern;
    /**
     * Identify areas for improvement from feedback
     */
    private identifyImprovementAreas;
    /**
     * Analyze interaction patterns to extract preferences
     */
    private analyzeInteractionPatterns;
}
//# sourceMappingURL=memory-injector.d.ts.map