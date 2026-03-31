// packages/ai-core/src/prompt-orchestrator.ts

import { ClassifiedTask, ContextData, PromptTemplate, ModelConfig } from './types';

/**
 * Prompt Orchestrator Module
 *
 * Dynamically builds structured prompts based on:
 * - Task complexity and requirements
 * - Selected model capabilities
 * - Available context data
 * - User preferences and history
 *
 * Supports versioned prompts and modular template system
 */
export class PromptOrchestrator {
  private readonly promptTemplates = {
    simple: {
      systemPrompt: `You are a helpful AI assistant for KARYO OS.
Keep responses clear, concise, and directly address the user's request.
Focus on being practical and actionable.`,

      userPrompt: `Task: {taskDescription}

Please complete this task efficiently.`,
    },

    medium: {
      systemPrompt: `You are an intelligent assistant in KARYO OS, capable of handling moderately complex tasks.
Provide well-structured responses with clear steps when needed.
Consider the user's context and preferences for better assistance.

User Context:
{userContext}

Relevant Information:
{memoryContext}`,

      userPrompt: `Task: {taskDescription}

Requirements:
- Provide a structured response
- Consider the context provided
- Be thorough but not verbose

Please proceed with the task.`,
    },

    complex: {
      systemPrompt: `You are an advanced AI agent in KARYO OS, specialized in complex task execution.
You have access to comprehensive context and can break down complex problems into manageable steps.

User Profile:
{userContext}

Historical Context:
{memoryContext}

Task History:
{taskHistory}

Guidelines:
- Break complex tasks into clear, actionable steps
- Provide detailed analysis when required
- Suggest optimizations and best practices
- Maintain high quality and accuracy
- Ask for clarification if needed`,

      userPrompt: `Complex Task: {taskDescription}

Please execute this task with the following approach:
1. Analyze the requirements thoroughly
2. Break down into specific steps
3. Execute each step methodically
4. Provide comprehensive results
5. Suggest follow-up actions if applicable

Begin execution:`,
    },
  };

  /**
   * Build a complete prompt for the given task and context
   * @param task - The classified task
   * @param context - Built context data
   * @param model - Selected model configuration
   * @returns Structured prompt template
   */
  async buildPrompt(
    task: ClassifiedTask,
    context: ContextData,
    model: ModelConfig
  ): Promise<PromptTemplate> {
    const template = this.promptTemplates[task.complexity];

    // Format context sections
    const formattedContext = this.formatContextSections(context);

    // Build system prompt with context injection
    const systemPrompt = this.injectVariables(template.systemPrompt, {
      userContext: formattedContext.userContext,
      memoryContext: formattedContext.memoryContext,
      taskHistory: formattedContext.taskHistory,
    });

    // Build user prompt
    const userPrompt = this.injectVariables(template.userPrompt, {
      taskDescription: task.description,
    });

    // Add model-specific optimizations
    const optimizedPrompt = await this.optimizeForModel(systemPrompt, userPrompt, model);

    return {
      systemPrompt: optimizedPrompt.systemPrompt,
      userPrompt: optimizedPrompt.userPrompt,
      variables: {
        taskId: task.id,
        complexity: task.complexity,
        model: model.model,
        estimatedTokens: task.estimatedTokens,
      },
    };
  }

  /**
   * Format context data into prompt-ready sections
   */
  private formatContextSections(context: ContextData): {
    userContext: string;
    memoryContext: string;
    taskHistory: string;
  } {
    const userContext = Object.entries(context.userContext)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    const memoryContext = context.memoryContext.length > 0
      ? context.memoryContext.join('\n- ')
      : 'No relevant memories found';

    const taskHistory = context.taskHistory.length > 0
      ? context.taskHistory
          .map(task => `${task.description} (${task.metadata?.status || 'unknown'})`)
          .join('\n- ')
      : 'No recent task history';

    return {
      userContext,
      memoryContext,
      taskHistory,
    };
  }

  /**
   * Inject variables into prompt template
   */
  private injectVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }

  /**
   * Optimize prompts based on model capabilities and constraints
   */
  private async optimizeForModel(
    systemPrompt: string,
    userPrompt: string,
    model: ModelConfig
  ): Promise<{ systemPrompt: string; userPrompt: string }> {
    let optimizedSystem = systemPrompt;
    let optimizedUser = userPrompt;

    // Model-specific optimizations
    switch (model.provider) {
      case 'openai':
        if (model.model.includes('gpt-4')) {
          // GPT-4 can handle longer, more complex prompts
          optimizedSystem += '\n\nLeverage your advanced reasoning capabilities for optimal results.';
        } else {
          // GPT-3.5 benefits from clearer instructions
          optimizedSystem += '\n\nKeep responses focused and efficient.';
        }
        break;

      case 'anthropic':
        // Claude benefits from explicit thinking instructions
        optimizedSystem += '\n\nThink step-by-step and show your reasoning when appropriate.';
        break;

      default:
        // Generic optimization
        optimizedSystem += '\n\nProvide clear, actionable responses.';
    }

    // Token limit considerations
    const totalTokens = this.estimateTokenCount(optimizedSystem + optimizedUser);
    if (totalTokens > model.maxTokens * 0.8) {
      // Truncate if approaching limits
      optimizedSystem = this.truncatePrompt(optimizedSystem, model.maxTokens * 0.3);
      optimizedUser = this.truncatePrompt(optimizedUser, model.maxTokens * 0.4);
    }

    return {
      systemPrompt: optimizedSystem,
      userPrompt: optimizedUser,
    };
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate prompt while preserving structure
   */
  private truncatePrompt(prompt: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokenCount(prompt);
    if (estimatedTokens <= maxTokens) return prompt;

    // Simple truncation - in production, use more sophisticated truncation
    const targetLength = maxTokens * 4;
    return prompt.substring(0, targetLength) + '\n\n[Content truncated for token limits]';
  }

  /**
   * Future: Dynamic prompt engineering with A/B testing
   * Version prompts and measure effectiveness
   */
  // async abTestPrompts(task: ClassifiedTask): Promise<PromptTemplate[]> {
  //   // Generate multiple prompt variations for testing
  // }

  /**
   * Future: Integration with LangChain prompt templates
   * Use LangChain's advanced templating features
   */
  // async buildWithLangChain(task: ClassifiedTask, context: ContextData): Promise<PromptTemplate> {
  //   // Implementation with LangChain PromptTemplate
  // }
}