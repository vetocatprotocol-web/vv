import { CostEstimate, GovernanceConfig } from './types';

export class CostEstimator {
  constructor(private config: GovernanceConfig) {}

  /**
   * Estimate cost for a given model and token usage
   */
  estimateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): CostEstimate {
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
  estimateBatchCosts(
    requests: Array<{ model: string; inputTokens: number; outputTokens: number }>
  ): CostEstimate[] {
    return requests.map(req =>
      this.estimateCost(req.model, req.inputTokens, req.outputTokens)
    );
  }

  /**
   * Get pricing information for a model
   */
  getPricing(model: string): { inputCostPerToken: number; outputCostPerToken: number; currency: string } | null {
    return this.config.pricing[model] || null;
  }

  /**
   * Get all available models with pricing
   */
  getAvailableModels(): string[] {
    return Object.keys(this.config.pricing);
  }

  /**
   * Calculate remaining budget for a user
   */
  calculateRemainingBudget(
    currentUsage: { tokens: number; cost: number },
    limits: { dailyTokens: number; dailyCost: number; monthlyTokens: number; monthlyCost: number },
    period: 'daily' | 'monthly' = 'monthly'
  ): { remainingTokens: number; remainingCost: number; isOverLimit: boolean } {
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
  wouldExceedBudget(
    model: string,
    estimatedInputTokens: number,
    estimatedOutputTokens: number,
    currentUsage: { tokens: number; cost: number },
    limits: { dailyTokens: number; dailyCost: number; monthlyTokens: number; monthlyCost: number },
    period: 'daily' | 'monthly' = 'monthly'
  ): { wouldExceed: boolean; estimatedTotalCost: number; estimatedTotalTokens: number } {
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