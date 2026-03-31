"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageLimiter = void 0;
const redis_1 = require("redis");
class UsageLimiter {
    constructor(config) {
        this.config = config;
        this.redis = (0, redis_1.createClient)({ url: config.redisUrl });
        this.setupConnection();
    }
    /**
     * Check if a user is within their usage limits
     */
    async checkLimits(userId, workspaceId, requestedTokens = 0, estimatedCost = 0) {
        const limits = await this.getLimits(userId, workspaceId);
        for (const limit of limits) {
            const projectedUsage = limit.current + (limit.type.includes('tokens') ? requestedTokens : estimatedCost);
            if (projectedUsage > limit.limit) {
                return {
                    allowed: false,
                    reason: `Usage limit exceeded for ${limit.type} (${projectedUsage}/${limit.limit})`,
                    limits,
                };
            }
        }
        return { allowed: true, limits };
    }
    /**
     * Update usage counters after a successful operation
     */
    async updateUsage(userId, workspaceId, tokens, cost) {
        const limits = await this.getLimits(userId, workspaceId);
        for (const limit of limits) {
            if (limit.type.includes('tokens')) {
                limit.current += tokens;
            }
            else {
                limit.current += cost;
            }
            await this.saveLimit(limit);
        }
    }
    /**
     * Check rate limits (requests per minute/hour)
     */
    async checkRateLimit(userId) {
        const rateLimit = await this.getRateLimit(userId);
        const now = new Date();
        // Reset counters if needed
        if (this.shouldResetMinute(rateLimit.lastResetMinute, now)) {
            rateLimit.currentMinuteCount = 0;
            rateLimit.lastResetMinute = now;
        }
        if (this.shouldResetHour(rateLimit.lastResetHour, now)) {
            rateLimit.currentHourCount = 0;
            rateLimit.lastResetHour = now;
        }
        // Check limits
        if (rateLimit.currentMinuteCount >= rateLimit.requestsPerMinute) {
            const resetIn = 60 - Math.floor((now.getTime() - rateLimit.lastResetMinute.getTime()) / 1000);
            return { allowed: false, resetIn };
        }
        if (rateLimit.currentHourCount >= rateLimit.requestsPerHour) {
            const resetIn = 3600 - Math.floor((now.getTime() - rateLimit.lastResetHour.getTime()) / 1000);
            return { allowed: false, resetIn };
        }
        // Increment counters
        rateLimit.currentMinuteCount++;
        rateLimit.currentHourCount++;
        await this.saveRateLimit(rateLimit);
        return { allowed: true };
    }
    /**
     * Set custom limits for a user
     */
    async setCustomLimits(userId, workspaceId, limits) {
        const currentLimits = await this.getLimits(userId, workspaceId);
        for (const limit of currentLimits) {
            if (limit.type === 'daily' && limit.limit.toString().includes('tokens') && limits.dailyTokens) {
                limit.limit = limits.dailyTokens;
            }
            else if (limit.type === 'monthly' && limit.limit.toString().includes('tokens') && limits.monthlyTokens) {
                limit.limit = limits.monthlyTokens;
            }
            else if (limit.type === 'daily' && limit.limit.toString().includes('cost') && limits.dailyCost) {
                limit.limit = limits.dailyCost;
            }
            else if (limit.type === 'monthly' && limit.limit.toString().includes('cost') && limits.monthlyCost) {
                limit.limit = limits.monthlyCost;
            }
            await this.saveLimit(limit);
        }
    }
    /**
     * Reset usage counters (for testing or manual reset)
     */
    async resetUsage(userId, workspaceId, type) {
        const limits = await this.getLimits(userId, workspaceId);
        for (const limit of limits) {
            if (!type || type === 'all' || limit.type === type) {
                limit.current = 0;
                limit.resetDate = new Date();
                await this.saveLimit(limit);
            }
        }
    }
    async getLimits(userId, workspaceId) {
        const key = `limits:${userId}:${workspaceId}`;
        const data = await this.redis.hGetAll(key);
        if (Object.keys(data).length === 0) {
            // Create default limits
            return this.createDefaultLimits(userId, workspaceId);
        }
        return Object.values(data).map((item) => JSON.parse(item));
    }
    async createDefaultLimits(userId, workspaceId) {
        const now = new Date();
        const limits = [
            {
                userId,
                workspaceId,
                type: 'daily',
                limit: this.config.defaultLimits.dailyTokens,
                current: 0,
                resetDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            },
            {
                userId,
                workspaceId,
                type: 'monthly',
                limit: this.config.defaultLimits.monthlyTokens,
                current: 0,
                resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
            {
                userId,
                workspaceId,
                type: 'daily',
                limit: this.config.defaultLimits.dailyCost,
                current: 0,
                resetDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            },
            {
                userId,
                workspaceId,
                type: 'monthly',
                limit: this.config.defaultLimits.monthlyCost,
                current: 0,
                resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
        ];
        // Save to Redis
        const key = `limits:${userId}:${workspaceId}`;
        const promises = limits.map((limit, index) => this.redis.hSet(key, index.toString(), JSON.stringify(limit)));
        await Promise.all(promises);
        return limits;
    }
    async saveLimit(limit) {
        const key = `limits:${limit.userId}:${limit.workspaceId}`;
        const limits = await this.getLimits(limit.userId, limit.workspaceId);
        const index = limits.findIndex(l => l.type === limit.type && l.limit === limit.limit);
        if (index >= 0) {
            await this.redis.hSet(key, index.toString(), JSON.stringify(limit));
        }
    }
    async getRateLimit(userId) {
        const key = `ratelimit:${userId}`;
        const data = await this.redis.hGetAll(key);
        if (Object.keys(data).length === 0) {
            // Create default rate limit
            const rateLimit = {
                userId,
                requestsPerMinute: 60,
                requestsPerHour: 1000,
                currentMinuteCount: 0,
                currentHourCount: 0,
                lastResetMinute: new Date(),
                lastResetHour: new Date(),
            };
            await this.saveRateLimit(rateLimit);
            return rateLimit;
        }
        return {
            userId,
            requestsPerMinute: parseInt(data.requestsPerMinute),
            requestsPerHour: parseInt(data.requestsPerHour),
            currentMinuteCount: parseInt(data.currentMinuteCount),
            currentHourCount: parseInt(data.currentHourCount),
            lastResetMinute: new Date(data.lastResetMinute),
            lastResetHour: new Date(data.lastResetHour),
        };
    }
    async saveRateLimit(rateLimit) {
        const key = `ratelimit:${rateLimit.userId}`;
        await this.redis.hSet(key, {
            requestsPerMinute: rateLimit.requestsPerMinute,
            requestsPerHour: rateLimit.requestsPerHour,
            currentMinuteCount: rateLimit.currentMinuteCount,
            currentHourCount: rateLimit.currentHourCount,
            lastResetMinute: rateLimit.lastResetMinute.toISOString(),
            lastResetHour: rateLimit.lastResetHour.toISOString(),
        });
    }
    shouldResetMinute(lastReset, now) {
        return (now.getTime() - lastReset.getTime()) >= 60 * 1000;
    }
    shouldResetHour(lastReset, now) {
        return (now.getTime() - lastReset.getTime()) >= 60 * 60 * 1000;
    }
    async setupConnection() {
        await this.redis.connect();
        this.redis.on('error', (err) => {
            console.error('UsageLimiter Redis error:', err);
        });
    }
    async close() {
        await this.redis.quit();
    }
}
exports.UsageLimiter = UsageLimiter;
//# sourceMappingURL=usage-limiter.js.map