import { CostEstimate, GovernanceConfig } from './types';
export declare class CostEstimator {
    private config;
    constructor(config: GovernanceConfig);
    /**
     * Estimate cost for a given model and token usage
     */
    estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate;
    /**
     * Estimate cost for multiple models (batch estimation)
     */
    estimateBatchCosts(requests: Array<{
        model: string;
        inputTokens: number;
        outputTokens: number;
    }>): CostEstimate[];
    /**
     * Get pricing information for a model
     */
    getPricing(model: string): {
        inputCostPerToken: number;
        outputCostPerToken: number;
        currency: string;
    } | null;
    /**
     * Get all available models with pricing
     */
    getAvailableModels(): string[];
    /**
     * Calculate remaining budget for a user
     */
    calculateRemainingBudget(currentUsage: {
        tokens: number;
        cost: number;
    }, limits: {
        dailyTokens: number;
        dailyCost: number;
        monthlyTokens: number;
        monthlyCost: number;
    }, period?: 'daily' | 'monthly'): {
        remainingTokens: number;
        remainingCost: number;
        isOverLimit: boolean;
    };
    /**
     * Estimate if a request would exceed budget
     */
    wouldExceedBudget(model: string, estimatedInputTokens: number, estimatedOutputTokens: number, currentUsage: {
        tokens: number;
        cost: number;
    }, limits: {
        dailyTokens: number;
        dailyCost: number;
        monthlyTokens: number;
        monthlyCost: number;
    }, period?: 'daily' | 'monthly'): {
        wouldExceed: boolean;
        estimatedTotalCost: number;
        estimatedTotalTokens: number;
    };
}
//# sourceMappingURL=cost-estimator.d.ts.map