import { TokenTracker } from './token-tracker';
import { CostEstimator } from './cost-estimator';
import { UsageLimiter } from './usage-limiter';
import { GovernanceConfig, TokenUsage, CostEstimate } from './types';

export class GovernanceService {
  private tokenTracker: TokenTracker;
  private costEstimator: CostEstimator;
  private usageLimiter: UsageLimiter;

  constructor(private config: GovernanceConfig) {
    this.tokenTracker = new TokenTracker(config);
    this.costEstimator = new CostEstimator(config);
    this.usageLimiter = new UsageLimiter(config);
  }

  /**
   * Check if a request is allowed and estimate costs
   */
  async authorizeRequest(
    userId: string,
    workspaceId: string,
    model: string,
    estimatedInputTokens: number,
    estimatedOutputTokens: number
  ): Promise<{
    allowed: boolean;
    reason?: string;
    costEstimate: CostEstimate;
    remainingBudget: { tokens: number; cost: number };
  }> {
    // Estimate cost
    const costEstimate = this.costEstimator.estimateCost(model, estimatedInputTokens, estimatedOutputTokens);

    // Check rate limits
    const rateLimitCheck = await this.usageLimiter.checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        reason: `Rate limit exceeded. Reset in ${rateLimitCheck.resetIn} seconds.`,
        costEstimate,
        remainingBudget: { tokens: 0, cost: 0 },
      };
    }

    // Check usage limits
    const limitCheck = await this.usageLimiter.checkLimits(
      userId,
      workspaceId,
      estimatedInputTokens + estimatedOutputTokens,
      costEstimate.estimatedCost
    );

    if (!limitCheck.allowed) {
      return {
        allowed: false,
        reason: limitCheck.reason,
        costEstimate,
        remainingBudget: { tokens: 0, cost: 0 },
      };
    }

    // Get current usage for remaining budget calculation
    const currentUsage = await this.tokenTracker.getUsage(userId, workspaceId, 'monthly');
    const remainingBudget = this.costEstimator.calculateRemainingBudget(
      currentUsage,
      {
        dailyTokens: this.config.defaultLimits.dailyTokens,
        dailyCost: this.config.defaultLimits.dailyCost,
        monthlyTokens: this.config.defaultLimits.monthlyTokens,
        monthlyCost: this.config.defaultLimits.monthlyCost,
      },
      'monthly'
    );

    return {
      allowed: true,
      costEstimate,
      remainingBudget: {
        tokens: remainingBudget.remainingTokens,
        cost: remainingBudget.remainingCost,
      },
    };
  }

  /**
   * Record actual usage after a successful operation
   */
  async recordUsage(usage: Omit<TokenUsage, 'timestamp'>): Promise<void> {
    // Track usage
    await this.tokenTracker.trackUsage(usage);

    // Update limits
    await this.usageLimiter.updateUsage(
      usage.userId,
      usage.workspaceId,
      usage.tokens,
      usage.cost
    );
  }

  /**
   * Get usage statistics for a user
   */
  async getUsageStats(
    userId: string,
    workspaceId: string,
    period: 'daily' | 'monthly' | 'total' = 'monthly'
  ): Promise<{
    usage: { tokens: number; cost: number };
    limits: { tokens: number; cost: number };
    remaining: { tokens: number; cost: number };
  }> {
    const usage = await this.tokenTracker.getUsage(userId, workspaceId, period);
    const limits = period === 'daily'
      ? { tokens: this.config.defaultLimits.dailyTokens, cost: this.config.defaultLimits.dailyCost }
      : { tokens: this.config.defaultLimits.monthlyTokens, cost: this.config.defaultLimits.monthlyCost };

    const remaining = {
      tokens: Math.max(0, limits.tokens - usage.tokens),
      cost: Math.max(0, limits.cost - usage.cost),
    };

    return { usage, limits, remaining };
  }

  /**
   * Get usage history
   */
  async getUsageHistory(
    userId: string,
    workspaceId: string,
    limit: number = 50
  ): Promise<TokenUsage[]> {
    return await this.tokenTracker.getUsageHistory(userId, workspaceId, limit);
  }

  /**
   * Set custom limits for a user
   */
  async setCustomLimits(
    userId: string,
    workspaceId: string,
    limits: Partial<{
      dailyTokens: number;
      monthlyTokens: number;
      dailyCost: number;
      monthlyCost: number;
    }>
  ): Promise<void> {
    await this.usageLimiter.setCustomLimits(userId, workspaceId, limits);
  }

  /**
   * Estimate cost without checking limits
   */
  estimateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): CostEstimate {
    return this.costEstimator.estimateCost(model, inputTokens, outputTokens);
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return this.costEstimator.getAvailableModels();
  }

  /**
   * Reset usage counters (admin function)
   */
  async resetUsage(
    userId: string,
    workspaceId: string,
    type?: 'daily' | 'monthly' | 'all'
  ): Promise<void> {
    await this.usageLimiter.resetUsage(userId, workspaceId, type);
    if (type === 'all' || type === 'daily') {
      await this.tokenTracker.resetUsage(userId, workspaceId, 'daily');
    }
    if (type === 'all' || type === 'monthly') {
      await this.tokenTracker.resetUsage(userId, workspaceId, 'monthly');
    }
  }

  async close(): Promise<void> {
    await Promise.all([
      this.tokenTracker.close(),
      this.usageLimiter.close(),
    ]);
  }
}