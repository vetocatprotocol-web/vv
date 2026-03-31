"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostEstimator = void 0;
class CostEstimator {
    constructor(config) {
        this.config = config;
    }
    /**
     * Estimate cost for a given model and token usage
     */
    estimateCost(model, inputTokens, outputTokens) {
        const pricing = this.config.pricing[model];
        if (!pricing) {
            throw new Error(`Pricing not found for model: ${model}`);
        }
        const inputCost = inputTokens * pricing.inputCostPerToken;
        const outputCost = outputTokens * pricing.outputCostPerToken;
        const totalCost = inputCost + outputCost;
        return {
            model,
            inputTokens,
            outputTokens,
            estimatedCost: totalCost,
            currency: pricing.currency,
        };
    }
    /**
     * Estimate cost for multiple models (batch estimation)
     */
    estimateBatchCosts(requests) {
        return requests.map(req => this.estimateCost(req.model, req.inputTokens, req.outputTokens));
    }
    /**
     * Get pricing information for a model
     */
    getPricing(model) {
        return this.config.pricing[model] || null;
    }
    /**
     * Get all available models with pricing
     */
    getAvailableModels() {
        return Object.keys(this.config.pricing);
    }
    /**
     * Calculate remaining budget for a user
     */
    calculateRemainingBudget(currentUsage, limits, period = 'monthly') {
        const tokenLimit = period === 'daily' ? limits.dailyTokens : limits.monthlyTokens;
        const costLimit = period === 'daily' ? limits.dailyCost : limits.monthlyCost;
        const remainingTokens = Math.max(0, tokenLimit - currentUsage.tokens);
        const remainingCost = Math.max(0, costLimit - currentUsage.cost);
        const isOverLimit = currentUsage.tokens > tokenLimit || currentUsage.cost > costLimit;
        return {
            remainingTokens,
            remainingCost,
            isOverLimit,
        };
    }
    /**
     * Estimate if a request would exceed budget
     */
    wouldExceedBudget(model, estimatedInputTokens, estimatedOutputTokens, currentUsage, limits, period = 'monthly') {
        const estimate = this.estimateCost(model, estimatedInputTokens, estimatedOutputTokens);
        const totalTokens = currentUsage.tokens + estimatedInputTokens + estimatedOutputTokens;
        const totalCost = currentUsage.cost + estimate.estimatedCost;
        const tokenLimit = period === 'daily' ? limits.dailyTokens : limits.monthlyTokens;
        const costLimit = period === 'daily' ? limits.dailyCost : limits.monthlyCost;
        const wouldExceed = totalTokens > tokenLimit || totalCost > costLimit;
        return {
            wouldExceed,
            estimatedTotalCost: totalCost,
            estimatedTotalTokens: totalTokens,
        };
    }
}
exports.CostEstimator = CostEstimator;
//# sourceMappingURL=cost-estimator.js.map