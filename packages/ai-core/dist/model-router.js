"use strict";
// packages/ai-core/src/model-router.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRouter = void 0;
/**
 * Model Router Module
 *
 * Routes tasks to appropriate AI models based on complexity, cost, and availability
 * Supports cost-aware routing and future OpenRouter integration
 *
 * Extensible for dynamic model selection based on user tier, budget, etc.
 */
class ModelRouter {
    constructor() {
        this.modelConfigs = [
            {
                provider: 'openai',
                model: 'gpt-3.5-turbo',
                tier: 'free',
                maxTokens: 4096,
                costPerToken: 0.002,
            },
            {
                provider: 'openai',
                model: 'gpt-4',
                tier: 'low-cost',
                maxTokens: 8192,
                costPerToken: 0.03,
            },
            {
                provider: 'anthropic',
                model: 'claude-3-haiku',
                tier: 'high-end',
                maxTokens: 100000,
                costPerToken: 0.25,
            },
            // Future: Add more models via OpenRouter
        ];
        this.routingRules = {
            simple: 'free',
            medium: 'low-cost',
            complex: 'high-end',
        };
        /**
         * Future: Dynamic routing with OpenRouter
         * Query available models and select based on real-time metrics
         */
        // async routeWithOpenRouter(task: ClassifiedTask): Promise<ModelConfig> {
        //   // Implementation for OpenRouter integration
        // }
    }
    /**
     * Route a classified task to the optimal model
     * @param task - The classified task
     * @param userTier - User's subscription tier (affects model access)
     * @param budgetLimit - Optional budget constraint
     * @returns Selected model configuration
     */
    async routeToModel(task, userTier = 'free', budgetLimit) {
        const preferredTier = this.routingRules[task.complexity];
        // Get available models for user tier
        const availableModels = this.getAvailableModels(userTier);
        // Filter by preferred tier
        let candidates = availableModels.filter(model => model.tier === preferredTier);
        // If no models in preferred tier, fallback to higher tiers
        if (candidates.length === 0) {
            candidates = this.getFallbackModels(preferredTier, availableModels);
        }
        // Apply budget constraints
        if (budgetLimit) {
            candidates = this.filterByBudget(candidates, task.estimatedTokens, budgetLimit);
        }
        // Select the best model (lowest cost, highest capability)
        const selectedModel = this.selectOptimalModel(candidates, task);
        if (!selectedModel) {
            throw new Error(`No suitable model found for task complexity: ${task.complexity}`);
        }
        return selectedModel;
    }
    /**
     * Get models available for a user tier
     */
    getAvailableModels(userTier) {
        switch (userTier) {
            case 'free':
                return this.modelConfigs.filter(model => model.tier === 'free');
            case 'premium':
                return this.modelConfigs.filter(model => ['free', 'low-cost'].includes(model.tier));
            case 'enterprise':
                return this.modelConfigs; // All models
            default:
                return this.modelConfigs.filter(model => model.tier === 'free');
        }
    }
    /**
     * Get fallback models when preferred tier is unavailable
     */
    getFallbackModels(preferredTier, availableModels) {
        const tierHierarchy = ['free', 'low-cost', 'high-end'];
        const preferredIndex = tierHierarchy.indexOf(preferredTier);
        // Try higher tiers first
        for (let i = preferredIndex + 1; i < tierHierarchy.length; i++) {
            const higherTierModels = availableModels.filter(model => model.tier === tierHierarchy[i]);
            if (higherTierModels.length > 0) {
                return higherTierModels;
            }
        }
        // If no higher tiers, return all available
        return availableModels;
    }
    /**
     * Filter models by budget constraints
     */
    filterByBudget(models, estimatedTokens, budgetLimit) {
        return models.filter(model => {
            const estimatedCost = estimatedTokens * model.costPerToken;
            return estimatedCost <= budgetLimit;
        });
    }
    /**
     * Select the optimal model from candidates
     * Prioritizes: cost efficiency, capability, availability
     */
    selectOptimalModel(candidates, task) {
        if (candidates.length === 0)
            return null;
        // Sort by cost per token (ascending), then by max tokens (descending)
        return candidates.sort((a, b) => {
            if (a.costPerToken !== b.costPerToken) {
                return a.costPerToken - b.costPerToken;
            }
            return b.maxTokens - a.maxTokens;
        })[0];
    }
}
exports.ModelRouter = ModelRouter;
//# sourceMappingURL=model-router.js.map