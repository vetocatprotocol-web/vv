import { UsageLimit, GovernanceConfig } from './types';
export declare class UsageLimiter {
    private config;
    private redis;
    constructor(config: GovernanceConfig);
    /**
     * Check if a user is within their usage limits
     */
    checkLimits(userId: string, workspaceId: string, requestedTokens?: number, estimatedCost?: number): Promise<{
        allowed: boolean;
        reason?: string;
        limits: UsageLimit[];
    }>;
    /**
     * Update usage counters after a successful operation
     */
    updateUsage(userId: string, workspaceId: string, tokens: number, cost: number): Promise<void>;
    /**
     * Check rate limits (requests per minute/hour)
     */
    checkRateLimit(userId: string): Promise<{
        allowed: boolean;
        resetIn?: number;
    }>;
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
     * Reset usage counters (for testing or manual reset)
     */
    resetUsage(userId: string, workspaceId: string, type?: 'daily' | 'monthly' | 'all'): Promise<void>;
    private getLimits;
    private createDefaultLimits;
    private saveLimit;
    private getRateLimit;
    private saveRateLimit;
    private shouldResetMinute;
    private shouldResetHour;
    private setupConnection;
    close(): Promise<void>;
}
//# sourceMappingURL=usage-limiter.d.ts.map