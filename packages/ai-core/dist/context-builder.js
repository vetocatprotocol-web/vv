"use strict";
// packages/ai-core/src/context-builder.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
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
class ContextBuilder {
    /**
     * Build complete context for a task
     * @param task - The current task
     * @param userId - User identifier
     * @param workspaceId - Workspace identifier
     * @returns Compiled context data
     */
    async buildContext(task, userId, workspaceId) {
        // Parallel context gathering for performance
        const [userContext, memoryContext, taskHistory] = await Promise.all([
            this.getUserContext(userId),
            this.getMemoryContext(task, workspaceId),
            this.getTaskHistory(userId, workspaceId),
        ]);
        return {
            userContext,
            memoryContext,
            taskHistory,
        };
    }
    /**
     * Retrieve user-specific context
     * Includes preferences, behavior patterns, settings
     */
    async getUserContext(userId) {
        // Future: Integrate with user service/database
        // For now, return mock data structure
        return {
            preferences: {
                language: 'id',
                timezone: 'Asia/Jakarta',
                preferredFormats: ['PDF', 'Markdown'],
            },
            behaviorPatterns: {
                workHours: '09:00-17:00',
                commonTasks: ['analysis', 'reporting'],
                productivity: 'high',
            },
            settings: {
                aiAssistance: true,
                notifications: true,
            },
        };
    }
    /**
     * Retrieve relevant memory context from vector database
     * Uses semantic search to find related historical data
     */
    async getMemoryContext(task, workspaceId) {
        // Future: Integrate with vector database (Qdrant/Weaviate)
        // Perform semantic search based on task description
        const taskKeywords = this.extractTaskKeywords(task.description);
        const relevantMemories = [];
        // Mock semantic search results
        // In production, this would query the vector DB
        if (taskKeywords.includes('analyze') || taskKeywords.includes('data')) {
            relevantMemories.push('Previous data analysis showed trends in Q4 sales');
            relevantMemories.push('User prefers detailed breakdowns with visualizations');
        }
        if (taskKeywords.includes('report') || taskKeywords.includes('summary')) {
            relevantMemories.push('Last report was generated in PDF format');
            relevantMemories.push('User typically includes executive summaries');
        }
        return relevantMemories;
    }
    /**
     * Retrieve recent task history for context
     * Provides continuity and learning from past executions
     */
    async getTaskHistory(userId, workspaceId) {
        // Future: Query task database with filters
        // Return last N tasks, similar tasks, successful patterns
        // Mock task history
        return [
            {
                id: 'task-001',
                description: 'Analyze monthly sales data',
                userId,
                workspaceId,
                metadata: { status: 'completed', outcome: 'successful' },
            },
            {
                id: 'task-002',
                description: 'Generate quarterly report',
                userId,
                workspaceId,
                metadata: { status: 'completed', outcome: 'successful' },
            },
        ];
    }
    /**
     * Extract keywords from task description for memory search
     */
    extractTaskKeywords(description) {
        const keywords = description.toLowerCase().split(/\s+/);
        // Filter out common stop words and return relevant keywords
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        return keywords.filter(word => !stopWords.includes(word) && word.length > 2);
    }
    /**
     * Format context data for prompt injection
     * Converts structured context into readable text
     */
    formatContextForPrompt(context) {
        let formattedContext = '';
        // User context
        formattedContext += 'User Context:\n';
        formattedContext += `- Language: ${context.userContext.preferences?.language || 'en'}\n`;
        formattedContext += `- Preferred formats: ${context.userContext.preferences?.preferredFormats?.join(', ') || 'N/A'}\n`;
        formattedContext += `- Work hours: ${context.userContext.behaviorPatterns?.workHours || 'N/A'}\n\n`;
        // Memory context
        if (context.memoryContext.length > 0) {
            formattedContext += 'Relevant Memories:\n';
            context.memoryContext.forEach(memory => {
                formattedContext += `- ${memory}\n`;
            });
            formattedContext += '\n';
        }
        // Task history
        if (context.taskHistory.length > 0) {
            formattedContext += 'Recent Task History:\n';
            context.taskHistory.slice(-3).forEach(task => {
                formattedContext += `- ${task.description} (${task.metadata?.status || 'unknown'})\n`;
            });
            formattedContext += '\n';
        }
        return formattedContext;
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=context-builder.js.map