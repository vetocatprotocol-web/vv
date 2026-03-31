import { createClient, RedisClientType } from 'redis';
import { UsageLimit, RateLimit, GovernanceConfig } from './types';

export class UsageLimiter {
  private redis: RedisClientType;

  constructor(private config: GovernanceConfig) {
    this.redis = createClient({ url: config.redisUrl });
    this.setupConnection();
  }

  /**
   * Check if a user is within their usage limits
   */
  async checkLimits(
    userId: string,
    workspaceId: string,
    requestedTokens: number = 0,
    estimatedCost: number = 0
  ): Promise<{ allowed: boolean; reason?: string; limits: UsageLimit[] }> {
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
  async updateUsage(
    userId: string,
    workspaceId: string,
    tokens: number,
    cost: number
  ): Promise<void> {
    const limits = await this.getLimits(userId, workspaceId);

    for (const limit of limits) {
      if (limit.type.includes('tokens')) {
        limit.current += tokens;
      } else {
        limit.current += cost;
      }

      await this.saveLimit(limit);
    }
  }

  /**
   * Check rate limits (requests per minute/hour)
   */
  async checkRateLimit(userId: string): Promise<{ allowed: boolean; resetIn?: number }> {
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
    const currentLimits = await this.getLimits(userId, workspaceId);

    for (const limit of currentLimits) {
      if (limit.type === 'daily' && limit.limit.toString().includes('tokens') && limits.dailyTokens) {
        limit.limit = limits.dailyTokens;
      } else if (limit.type === 'monthly' && limit.limit.toString().includes('tokens') && limits.monthlyTokens) {
        limit.limit = limits.monthlyTokens;
      } else if (limit.type === 'daily' && limit.limit.toString().includes('cost') && limits.dailyCost) {
        limit.limit = limits.dailyCost;
      } else if (limit.type === 'monthly' && limit.limit.toString().includes('cost') && limits.monthlyCost) {
        limit.limit = limits.monthlyCost;
      }

      await this.saveLimit(limit);
    }
  }

  /**
   * Reset usage counters (for testing or manual reset)
   */
  async resetUsage(userId: string, workspaceId: string, type?: 'daily' | 'monthly' | 'all'): Promise<void> {
    const limits = await this.getLimits(userId, workspaceId);

    for (const limit of limits) {
      if (!type || type === 'all' || limit.type === type) {
        limit.current = 0;
        limit.resetDate = new Date();
        await this.saveLimit(limit);
      }
    }
  }

  private async getLimits(userId: string, workspaceId: string): Promise<UsageLimit[]> {
    const key = `limits:${userId}:${workspaceId}`;
    const data = await this.redis.hGetAll(key);

    if (Object.keys(data).length === 0) {
      // Create default limits
      return this.createDefaultLimits(userId, workspaceId);
    }

    return Object.values(data).map((item: string) => JSON.parse(item));
  }

  private async createDefaultLimits(userId: string, workspaceId: string): Promise<UsageLimit[]> {
    const now = new Date();
    const limits: UsageLimit[] = [
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
    const promises = limits.map((limit, index) =>
      this.redis.hSet(key, index.toString(), JSON.stringify(limit))
    );
    await Promise.all(promises);

    return limits;
  }

  private async saveLimit(limit: UsageLimit): Promise<void> {
    const key = `limits:${limit.userId}:${limit.workspaceId}`;
    const limits = await this.getLimits(limit.userId, limit.workspaceId!);
    const index = limits.findIndex(l => l.type === limit.type && l.limit === limit.limit);

    if (index >= 0) {
      await this.redis.hSet(key, index.toString(), JSON.stringify(limit));
    }
  }

  private async getRateLimit(userId: string): Promise<RateLimit> {
    const key = `ratelimit:${userId}`;
    const data = await this.redis.hGetAll(key);

    if (Object.keys(data).length === 0) {
      // Create default rate limit
      const rateLimit: RateLimit = {
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

  private async saveRateLimit(rateLimit: RateLimit): Promise<void> {
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

  private shouldResetMinute(lastReset: Date, now: Date): boolean {
    return (now.getTime() - lastReset.getTime()) >= 60 * 1000;
  }

  private shouldResetHour(lastReset: Date, now: Date): boolean {
    return (now.getTime() - lastReset.getTime()) >= 60 * 60 * 1000;
  }

  private async setupConnection(): Promise<void> {
    await this.redis.connect();

    this.redis.on('error', (err) => {
      console.error('UsageLimiter Redis error:', err);
    });
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}