import { GovernanceConfig, TokenUsage, CostEstimate } from './types';
export declare class GovernanceService {
    private config;
    private tokenTracker;
    private costEstimator;
    private usageLimiter;
    constructor(config: GovernanceConfig);
    /**
     * Check if a request is allowed and estimate costs
     */
    authorizeRequest(userId: string, workspaceId: string, model: string, estimatedInputTokens: number, estimatedOutputTokens: number): Promise<{
        allowed: boolean;
        reason?: string;
        costEstimate: CostEstimate;
        remainingBudget: {
            tokens: number;
            cost: number;
        };
    }>;
    /**
     * Record actual usage after a successful operation
     */
    recordUsage(usage: Omit<TokenUsage, 'timestamp'>): Promise<void>;
    /**
     * Get usage statistics for a user
     */
    getUsageStats(userId: string, workspaceId: string, period?: 'daily' | 'monthly' | 'total'): Promise<{
        usage: {
            tokens: number;
            cost: number;
        };
        limits: {
            tokens: number;
            cost: number;
        };
        remaining: {
            tokens: number;
            cost: number;
        };
    }>;
    /**
     * Get usage history
     */
    getUsageHistory(userId: string, workspaceId: string, limit?: number): Promise<TokenUsage[]>;
    /**
     * Set custom limits for a user
     */
    setCustomLimits(userId: string, workspaceId: string, limits: Partial<{
        dailyTokens: number;
        monthlyTokens: number;
        dailyCost: number;
        monthlyCost: number;
    }>): Promise<void>;
    /**
     * Estimate cost without checking limits
     */
    estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate;
    /**
     * Get available models
     */
    getAvailableModels(): string[];
    /**
     * Reset usage counters (admin function)
     */
    resetUsage(userId: string, workspaceId: string, type?: 'daily' | 'monthly' | 'all'): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=governance-service.d.ts.map