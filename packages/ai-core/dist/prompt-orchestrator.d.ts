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
export declare class PromptOrchestrator {
    private readonly promptTemplates;
    /**
     * Build a complete prompt for the given task and context
     * @param task - The classified task
     * @param context - Built context data
     * @param model - Selected model configuration
     * @returns Structured prompt template
     */
    buildPrompt(task: ClassifiedTask, context: ContextData, model: ModelConfig): Promise<PromptTemplate>;
    /**
     * Format context data into prompt-ready sections
     */
    private formatContextSections;
    /**
     * Inject variables into prompt template
     */
    private injectVariables;
    /**
     * Optimize prompts based on model capabilities and constraints
     */
    private optimizeForModel;
    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokenCount;
    /**
     * Truncate prompt while preserving structure
     */
    private truncatePrompt;
}
//# sourceMappingURL=prompt-orchestrator.d.ts.map