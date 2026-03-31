import { ModelConfig, ClassifiedTask } from './types';
/**
 * Model Router Module
 *
 * Routes tasks to appropriate AI models based on complexity, cost, and availability
 * Supports cost-aware routing and future OpenRouter integration
 *
 * Extensible for dynamic model selection based on user tier, budget, etc.
 */
export declare class ModelRouter {
    private readonly modelConfigs;
    private readonly routingRules;
    /**
     * Route a classified task to the optimal model
     * @param task - The classified task
     * @param userTier - User's subscription tier (affects model access)
     * @param budgetLimit - Optional budget constraint
     * @returns Selected model configuration
     */
    routeToModel(task: ClassifiedTask, userTier?: 'free' | 'premium' | 'enterprise', budgetLimit?: number): Promise<ModelConfig>;
    /**
     * Get models available for a user tier
     */
    private getAvailableModels;
    /**
     * Get fallback models when preferred tier is unavailable
     */
    private getFallbackModels;
    /**
     * Filter models by budget constraints
     */
    private filterByBudget;
    /**
     * Select the optimal model from candidates
     * Prioritizes: cost efficiency, capability, availability
     */
    private selectOptimalModel;
}
//# sourceMappingURL=model-router.d.ts.map