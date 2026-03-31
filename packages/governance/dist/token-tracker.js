"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenTracker = void 0;
const redis_1 = require("redis");
class TokenTracker {
    constructor(config) {
        this.config = config;
        this.redis = (0, redis_1.createClient)({ url: config.redisUrl });
        this.setupConnection();
    }
    async trackUsage(usage) {
        const tokenUsage = {
            ...usage,
            timestamp: new Date(),
        };
        const key = `usage:${usage.userId}:${usage.workspaceId}`;
        const dailyKey = `${key}:daily:${this.getDateString()}`;
        const monthlyKey = `${key}:monthly:${this.getMonthString()}`;
        // Store individual usage record
        const usageRecord = JSON.stringify(tokenUsage);
        await this.redis.lPush(`${key}:history`, usageRecord);
        // Update daily aggregates
        await this.redis.hIncrBy(dailyKey, 'tokens', usage.tokens);
        await this.redis.hIncrByFloat(dailyKey, 'cost', usage.cost);
        await this.redis.expire(dailyKey, 86400); // 24 hours
        // Update monthly aggregates
        await this.redis.hIncrBy(monthlyKey, 'tokens', usage.tokens);
        await this.redis.hIncrByFloat(monthlyKey, 'cost', usage.cost);
        await this.redis.expire(monthlyKey, 2592000); // 30 days
        // Update total aggregates
        await this.redis.hIncrBy(`${key}:total`, 'tokens', usage.tokens);
        await this.redis.hIncrByFloat(`${key}:total`, 'cost', usage.cost);
    }
    async getUsage(userId, workspaceId, period = 'monthly') {
        const key = `usage:${userId}:${workspaceId}`;
        let periodKey;
        if (period === 'daily') {
            periodKey = `${key}:daily:${this.getDateString()}`;
        }
        else if (period === 'monthly') {
            periodKey = `${key}:monthly:${this.getMonthString()}`;
        }
        else {
            periodKey = `${key}:total`;
        }
        const [tokens, cost] = await Promise.all([
            this.redis.hGet(periodKey, 'tokens'),
            this.redis.hGet(periodKey, 'cost'),
        ]);
        return {
            tokens: parseInt(tokens || '0'),
            cost: parseFloat(cost || '0'),
        };
    }
    async getUsageHistory(userId, workspaceId, limit = 100) {
        const key = `usage:${userId}:${workspaceId}:history`;
        const records = await this.redis.lRange(key, 0, limit - 1);
        return records.map((record) => JSON.parse(record)).reverse();
    }
    async resetUsage(userId, workspaceId, period) {
        const key = `usage:${userId}:${workspaceId}`;
        if (period === 'daily') {
            const dailyKey = `${key}:daily:${this.getDateString()}`;
            await this.redis.del(dailyKey);
        }
        else {
            const monthlyKey = `${key}:monthly:${this.getMonthString()}`;
            await this.redis.del(monthlyKey);
        }
    }
    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    getMonthString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    async setupConnection() {
        await this.redis.connect();
        this.redis.on('error', (err) => {
            console.error('TokenTracker Redis error:', err);
        });
    }
    async close() {
        await this.redis.quit();
    }
}
exports.TokenTracker = TokenTracker;
//# sourceMappingURL=token-tracker.js.map