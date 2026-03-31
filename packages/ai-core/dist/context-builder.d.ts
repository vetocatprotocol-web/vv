import { Task, ContextData } from './types';
/**
 * Context Builder Module
 *
 * Builds comprehensive context for AI tasks by injecting:
 * - User context (preferences, behavior patterns)
 * - Memory context (relevant historical data)
 * - Task history (previous tasks and outcomes)
 *
 * Designed for integration with memory system and vector databases
 */
export declare class ContextBuilder {
    /**
     * Build complete context for a task
     * @param task - The current task
     * @param userId - User identifier
     * @param workspaceId - Workspace identifier
     * @returns Compiled context data
     */
    buildContext(task: Task, userId: string, workspaceId: string): Promise<ContextData>;
    /**
     * Retrieve user-specific context
     * Includes preferences, behavior patterns, settings
     */
    private getUserContext;
    /**
     * Retrieve relevant memory context from vector database
     * Uses semantic search to find related historical data
     */
    private getMemoryContext;
    /**
     * Retrieve recent task history for context
     * Provides continuity and learning from past executions
     */
    private getTaskHistory;
    /**
     * Extract keywords from task description for memory search
     */
    private extractTaskKeywords;
    /**
     * Format context data for prompt injection
     * Converts structured context into readable text
     */
    formatContextForPrompt(context: ContextData): string;
}
//# sourceMappingURL=context-builder.d.ts.map