"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const token_tracker_1 = require("./token-tracker");
const cost_estimator_1 = require("./cost-estimator");
const usage_limiter_1 = require("./usage-limiter");
class GovernanceService {
    constructor(config) {
        this.config = config;
        this.tokenTracker = new token_tracker_1.TokenTracker(config);
        this.costEstimator = new cost_estimator_1.CostEstimator(config);
        this.usageLimiter = new usage_limiter_1.UsageLimiter(config);
    }
    /**
     * Check if a request is allowed and estimate costs
     */
    async authorizeRequest(userId, workspaceId, model, estimatedInputTokens, estimatedOutputTokens) {
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
        const limitCheck = await this.usageLimiter.checkLimits(userId, workspaceId, estimatedInputTokens + estimatedOutputTokens, costEstimate.estimatedCost);
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
        const remainingBudget = this.costEstimator.calculateRemainingBudget(currentUsage, {
            dailyTokens: this.config.defaultLimits.dailyTokens,
            dailyCost: this.config.defaultLimits.dailyCost,
            monthlyTokens: this.config.defaultLimits.monthlyTokens,
            monthlyCost: this.config.defaultLimits.monthlyCost,
        }, 'monthly');
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
    async recordUsage(usage) {
        // Track usage
        await this.tokenTracker.trackUsage(usage);
        // Update limits
        await this.usageLimiter.updateUsage(usage.userId, usage.workspaceId, usage.tokens, usage.cost);
    }
    /**
     * Get usage statistics for a user
     */
    async getUsageStats(userId, workspaceId, period = 'monthly') {
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
    async getUsageHistory(userId, workspaceId, limit = 50) {
        return await this.tokenTracker.getUsageHistory(userId, workspaceId, limit);
    }
    /**
     * Set custom limits for a user
     */
    async setCustomLimits(userId, workspaceId, limits) {
        await this.usageLimiter.setCustomLimits(userId, workspaceId, limits);
    }
    /**
     * Estimate cost without checking limits
     */
    estimateCost(model, inputTokens, outputTokens) {
        return this.costEstimator.estimateCost(model, inputTokens, outputTokens);
    }
    /**
     * Get available models
     */
    getAvailableModels() {
        return this.costEstimator.getAvailableModels();
    }
    /**
     * Reset usage counters (admin function)
     */
    async resetUsage(userId, workspaceId, type) {
        await this.usageLimiter.resetUsage(userId, workspaceId, type);
        if (type === 'all' || type === 'daily') {
            await this.tokenTracker.resetUsage(userId, workspaceId, 'daily');
        }
        if (type === 'all' || type === 'monthly') {
            await this.tokenTracker.resetUsage(userId, workspaceId, 'monthly');
        }
    }
    async close() {
        await Promise.all([
            this.tokenTracker.close(),
            this.usageLimiter.close(),
        ]);
    }
}
exports.GovernanceService = GovernanceService;
//# sourceMappingURL=governance-service.js.map