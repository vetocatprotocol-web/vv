// packages/memory/src/memory-injector.ts

import { ContextBuilder } from '@karyo/ai-core';
import { SemanticSearch } from './semantic-search';
import { ShortTermMemory } from './short-term-memory';
import { LongTermMemory } from './long-term-memory';
import { Task, ContextData } from '@karyo/ai-core';
import { MemoryEntry } from './types';

/**
 * Memory Injector
 *
 * Integrates memory system with AI Core's context builder
 * Automatically injects relevant memories into AI prompts
 * Manages memory lifecycle and context enrichment
 */
export class MemoryInjector {
  constructor(
    private contextBuilder: ContextBuilder,
    private semanticSearch: SemanticSearch,
    private shortTermMemory: ShortTermMemory,
    private longTermMemory: LongTermMemory
  ) {}

  /**
   * Build enriched context with memory injection
   * @param taskOrContext - Either a Task object or context object
   * @param userId - User identifier (if taskOrContext is Task)
   * @param workspaceId - Workspace identifier (if taskOrContext is Task)
   * @param sessionId - Current session ID for short-term memory
   * @returns Enhanced context data
   */
  async buildEnrichedContext(
    taskOrContext: Task | Record<string, any>,
    userId?: string,
    workspaceId?: string,
    sessionId?: string
  ): Promise<ContextData | Record<string, any>> {
    if (typeof taskOrContext === 'object' && taskOrContext.id && taskOrContext.description) {
      // Task object
      const task = taskOrContext as Task;
      return await this.buildEnrichedContextForTask(task, userId!, workspaceId!, sessionId);
    } else {
      // Context object
      const context = taskOrContext as Record<string, any>;
      const { task, userId: uid, workspaceId: wid, sessionId: sid } = context;

      if (task && uid && wid) {
        return await this.buildEnrichedContextForTask(task, uid, wid, sid);
      }

      // For simple context enrichment without full task
      const enrichedContext = { ...context };

      // Add basic memory injection if userId and workspaceId available
      if (uid && wid) {
        const memoryContext = await this.findBasicMemories(uid, wid, sid);
        enrichedContext.memoryContext = memoryContext.map(m => m.content);
      }

      return enrichedContext;
    }
  }

  /**
   * Build enriched context for a Task object
   */
  private async buildEnrichedContextForTask(
    task: Task,
    userId: string,
    workspaceId: string,
    sessionId?: string
  ): Promise<ContextData> {
    // Get base context from AI Core
    const baseContext = await this.contextBuilder.buildContext(task, userId, workspaceId);

    // Find relevant memories
    const memoryContext = await this.findRelevantMemories(task, userId, workspaceId, sessionId);

    // Inject memories into context
    const enrichedContext: ContextData = {
      ...baseContext,
      memoryContext: [
        ...baseContext.memoryContext,
        ...memoryContext.map(m => m.content),
      ],
    };

    // Store this interaction in short-term memory
    if (sessionId) {
      await this.storeInteraction(task, userId, workspaceId, sessionId);
    }

    return enrichedContext;
  }

  /**
   * Find memories relevant to the current task
   */
  private async findRelevantMemories(
    task: Task,
    userId: string,
    workspaceId: string,
    sessionId?: string
  ): Promise<MemoryEntry[]> {
    const relevantMemories: MemoryEntry[] = [];

    // 1. Find contextual memories using semantic search
    const contextResults = await this.semanticSearch.findContext(
      task.description,
      userId,
      workspaceId
    );
    relevantMemories.push(...contextResults.entries);

    // 2. Find recent short-term memories from current session
    if (sessionId) {
      const sessionQuery = {
        userId,
        workspaceId,
        tags: [`session:${sessionId}`],
        limit: 5,
      };
      const sessionResults = await this.shortTermMemory.query(sessionQuery);
      relevantMemories.push(...sessionResults.entries);
    }

    // 3. Find user behavior patterns
    const patternResults = await this.semanticSearch.findPatterns(userId, 'task_execution');
    relevantMemories.push(...patternResults.entries.slice(0, 3)); // Limit patterns

    // 4. Find similar past tasks
    const similarTasks = await this.semanticSearch.findSimilar(
      task.description,
      {
        userId,
        workspaceId,
        type: 'task',
        topK: 3,
        threshold: 0.6,
      }
    );
    relevantMemories.push(...similarTasks.entries);

    // Remove duplicates and limit total memories
    const uniqueMemories = this.deduplicateMemories(relevantMemories);
    return this.rankAndLimitMemories(uniqueMemories, 10);
  }

  /**
   * Store the current task interaction in short-term memory
   */
  private async storeInteraction(
    task: Task,
    userId: string,
    workspaceId: string,
    sessionId: string
  ): Promise<void> {
    const interactionEntry = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      workspaceId,
      type: 'interaction' as const,
      content: `User initiated task: ${task.description}`,
      metadata: {
        taskId: task.id,
        action: 'task_started',
      },
      timestamp: new Date(),
      sessionId,
      ttl: 3600, // 1 hour TTL
      tags: ['interaction', 'task_start', `session:${sessionId}`],
    };

    await this.shortTermMemory.store(interactionEntry);
  }

  /**
   * Store task execution result in long-term memory
   */
  async storeTaskResult(
    task: Task,
    result: { success: boolean; output: any; executionTime: number },
    userId: string,
    workspaceId: string
  ): Promise<void> {
    const taskMemory = {
      id: `task_result_${task.id}`,
      userId,
      workspaceId,
      type: 'context' as const,
      content: `Task "${task.description}" completed with result: ${JSON.stringify(result.output)}`,
      metadata: {
        taskId: task.id,
        success: result.success,
        executionTime: result.executionTime,
        outputType: typeof result.output,
      },
      timestamp: new Date(),
      tags: ['task', 'result', result.success ? 'success' : 'failure'],
      importance: result.success ? 0.7 : 0.5, // Successful tasks are more important
      accessCount: 0,
      lastAccessed: new Date(),
      consolidationCount: 0,
    };

    await this.longTermMemory.store(taskMemory);

    // Also update short-term memory if there's an active session
    // (This would be enhanced with session tracking)
  }

  /**
   * Store task execution result in memory
   */
  async storeExecutionResult(
    task: string,
    result: any,
    success: boolean
  ): Promise<void> {
    const taskMemory = {
      id: `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'system', // Default, could be parameterized
      workspaceId: 'default',
      type: 'context' as const,
      content: `Task execution: "${task}" - ${success ? 'Success' : 'Failed'}: ${JSON.stringify(result)}`,
      metadata: {
        task,
        success,
        resultType: typeof result,
      },
      timestamp: new Date(),
      tags: ['execution', success ? 'success' : 'failure'],
      importance: success ? 0.6 : 0.4,
      accessCount: 0,
      lastAccessed: new Date(),
      consolidationCount: 0,
    };

    await this.longTermMemory.store(taskMemory);
  }

  /**
   * Find basic memories for context enrichment
   */
  private async findBasicMemories(
    userId: string,
    workspaceId: string,
    sessionId?: string
  ): Promise<MemoryEntry[]> {
    const memories: MemoryEntry[] = [];

    // Get recent short-term memories
    if (sessionId) {
      const sessionQuery = {
        userId,
        workspaceId,
        tags: [`session:${sessionId}`],
        limit: 3,
      };
      const sessionResults = await this.shortTermMemory.query(sessionQuery);
      memories.push(...sessionResults.entries);
    }

    // Get user patterns
    const patternResults = await this.semanticSearch.findPatterns(userId, 'general');
    memories.push(...patternResults.entries.slice(0, 2));

    return this.deduplicateMemories(memories);
  }

  /**
   * Learn from user feedback and update memory patterns
   */
  async learnFromFeedback(
    task: Task,
    feedback: { rating: number; comments?: string },
    userId: string,
    workspaceId: string
  ): Promise<void> {
    // Store feedback in long-term memory
    const feedbackMemory = {
      id: `feedback_${task.id}_${Date.now()}`,
      userId,
      workspaceId,
      type: 'pattern' as const,
      content: `User feedback on task "${task.description}": Rating ${feedback.rating}/5${feedback.comments ? `. Comments: ${feedback.comments}` : ''}`,
      metadata: {
        taskId: task.id,
        rating: feedback.rating,
        feedbackType: 'user_rating',
      },
      timestamp: new Date(),
      tags: ['feedback', 'user_preference', `rating_${feedback.rating}`],
      importance: 0.8, // Feedback is highly important for learning
      accessCount: 0,
      lastAccessed: new Date(),
      consolidationCount: 0,
    };

    await this.longTermMemory.store(feedbackMemory);

    // Update task success patterns
    if (feedback.rating >= 4) {
      await this.reinforcePositivePattern(task, userId, workspaceId);
    } else {
      await this.identifyImprovementAreas(task, feedback, userId, workspaceId);
    }
  }

  /**
   * Extract and store user preferences from interactions
   */
  async extractUserPreferences(
    interactions: Array<{ task: Task; result: any; feedback?: any }>,
    userId: string,
    workspaceId: string
  ): Promise<void> {
    // Analyze interaction patterns to extract preferences
    const preferences = this.analyzeInteractionPatterns(interactions);

    for (const preference of preferences) {
      const preferenceMemory = {
        id: `preference_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        workspaceId,
        type: 'pattern' as const,
        content: `User preference: ${preference.description}`,
        metadata: {
          preferenceType: preference.type,
          confidence: preference.confidence,
          examples: preference.examples,
        },
        timestamp: new Date(),
        tags: ['preference', 'user_behavior', preference.type],
        importance: 0.9, // Preferences are very important
        accessCount: 0,
        lastAccessed: new Date(),
        consolidationCount: 0,
      };

      await this.longTermMemory.store(preferenceMemory);
    }
  }

  /**
   * Get memory insights for a user
   */
  async getMemoryInsights(userId: string, workspaceId: string): Promise<{
    totalMemories: number;
    commonPatterns: string[];
    preferences: string[];
    recentActivity: string[];
  }> {
    // Get memory statistics
    const stmStats = await this.shortTermMemory.getStats(userId);
    const ltmStats = await this.longTermMemory.getStats();

    // Find common patterns
    const patterns = await this.semanticSearch.findPatterns(userId);
    const commonPatterns = patterns.entries
      .slice(0, 5)
      .map(p => p.content.substring(0, 100) + '...');

    // Find user preferences
    const preferences = await this.longTermMemory.query({
      userId,
      workspaceId,
      type: 'pattern',
      tags: ['preference'],
      limit: 5,
    });

    // Get recent activity
    const recentActivity = await this.shortTermMemory.query({
      userId,
      workspaceId,
      limit: 5,
    });

    return {
      totalMemories: stmStats.entries + ltmStats.entries,
      commonPatterns,
      preferences: preferences.entries.map(p => p.content),
      recentActivity: recentActivity.entries.map(a => a.content),
    };
  }

  /**
   * Remove duplicate memories
   */
  private deduplicateMemories(memories: MemoryEntry[]): MemoryEntry[] {
    const seen = new Set<string>();
    return memories.filter(memory => {
      if (seen.has(memory.id)) return false;
      seen.add(memory.id);
      return true;
    });
  }

  /**
   * Rank and limit memories by relevance
   */
  private rankAndLimitMemories(memories: MemoryEntry[], limit: number): MemoryEntry[] {
    // Sort by recency and importance
    memories.sort((a, b) => {
      const aScore = this.calculateMemoryRelevance(a);
      const bScore = this.calculateMemoryRelevance(b);
      return bScore - aScore;
    });

    return memories.slice(0, limit);
  }

  /**
   * Calculate memory relevance score
   */
  private calculateMemoryRelevance(memory: MemoryEntry): number {
    let score = 0;

    // Recency score (newer is better)
    const ageInHours = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 1 - ageInHours / 24); // Decay over 24 hours

    // Type-based scoring
    switch (memory.type) {
      case 'task':
        score += 0.8;
        break;
      case 'pattern':
        score += 0.6;
        break;
      case 'context':
        score += 0.7;
        break;
      case 'interaction':
        score += 0.5;
        break;
    }

    // Importance boost (for long-term memories)
    if ('importance' in memory) {
      score += (memory as any).importance * 0.3;
    }

    return score;
  }

  /**
   * Reinforce positive patterns from successful tasks
   */
  private async reinforcePositivePattern(
    task: Task,
    userId: string,
    workspaceId: string
  ): Promise<void> {
    // Extract successful patterns and store them
    const patternMemory = {
      id: `success_pattern_${task.id}`,
      userId,
      workspaceId,
      type: 'pattern' as const,
      content: `Successful task pattern: ${task.description}`,
      metadata: {
        patternType: 'success',
        taskId: task.id,
      },
      timestamp: new Date(),
      tags: ['pattern', 'success', 'reinforce'],
      importance: 0.8,
      accessCount: 0,
      lastAccessed: new Date(),
      consolidationCount: 0,
    };

    await this.longTermMemory.store(patternMemory);
  }

  /**
   * Identify areas for improvement from feedback
   */
  private async identifyImprovementAreas(
    task: Task,
    feedback: { rating: number; comments?: string },
    userId: string,
    workspaceId: string
  ): Promise<void> {
    const improvementMemory = {
      id: `improvement_${task.id}`,
      userId,
      workspaceId,
      type: 'pattern' as const,
      content: `Improvement needed for: ${task.description}. Feedback: ${feedback.comments || 'Low rating'}`,
      metadata: {
        patternType: 'improvement',
        taskId: task.id,
        rating: feedback.rating,
      },
      timestamp: new Date(),
      tags: ['pattern', 'improvement', 'feedback'],
      importance: 0.7,
      accessCount: 0,
      lastAccessed: new Date(),
      consolidationCount: 0,
    };

    await this.longTermMemory.store(improvementMemory);
  }

  /**
   * Analyze interaction patterns to extract preferences
   */
  private analyzeInteractionPatterns(interactions: Array<{ task: Task; result: any; feedback?: any }>): Array<{
    type: string;
    description: string;
    confidence: number;
    examples: string[];
  }> {
    // Simple pattern analysis (can be enhanced with ML)
    const preferences: Array<{
      type: string;
      description: string;
      confidence: number;
      examples: string[];
    }> = [];

    // Analyze successful vs failed tasks
    const successfulTasks = interactions.filter(i => i.result?.success);
    const failedTasks = interactions.filter(i => !i.result?.success);

    if (successfulTasks.length > failedTasks.length * 2) {
      preferences.push({
        type: 'task_complexity',
        description: 'User prefers handling complex tasks successfully',
        confidence: 0.8,
        examples: successfulTasks.slice(0, 3).map(t => t.task.description),
      });
    }

    // Analyze response times
    const fastResponses = interactions.filter(i => i.result?.executionTime < 30000);
    if (fastResponses.length > interactions.length * 0.7) {
      preferences.push({
        type: 'response_speed',
        description: 'User prefers fast response times',
        confidence: 0.7,
        examples: fastResponses.slice(0, 2).map(t => t.task.description),
      });
    }

    return preferences;
  }
}