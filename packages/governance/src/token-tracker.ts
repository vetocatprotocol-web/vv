import { createClient, RedisClientType } from 'redis';
import { TokenUsage, GovernanceConfig } from './types';

export class TokenTracker {
  private redis: RedisClientType;

  constructor(private config: GovernanceConfig) {
    this.redis = createClient({ url: config.redisUrl });
    this.setupConnection();
  }

  async trackUsage(usage: Omit<TokenUsage, 'timestamp'>): Promise<void> {
    const tokenUsage: TokenUsage = {
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

  async getUsage(
    userId: string,
    workspaceId: string,
    period: 'daily' | 'monthly' | 'total' = 'monthly'
  ): Promise<{ tokens: number; cost: number }> {
    const key = `usage:${userId}:${workspaceId}`;

    let periodKey: string;
    if (period === 'daily') {
      periodKey = `${key}:daily:${this.getDateString()}`;
    } else if (period === 'monthly') {
      periodKey = `${key}:monthly:${this.getMonthString()}`;
    } else {
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

  async getUsageHistory(
    userId: string,
    workspaceId: string,
    limit: number = 100
  ): Promise<TokenUsage[]> {
    const key = `usage:${userId}:${workspaceId}:history`;
    const records = await this.redis.lRange(key, 0, limit - 1);

    return records.map((record: string) => JSON.parse(record)).reverse();
  }

  async resetUsage(userId: string, workspaceId: string, period: 'daily' | 'monthly'): Promise<void> {
    const key = `usage:${userId}:${workspaceId}`;

    if (period === 'daily') {
      const dailyKey = `${key}:daily:${this.getDateString()}`;
      await this.redis.del(dailyKey);
    } else {
      const monthlyKey = `${key}:monthly:${this.getMonthString()}`;
      await this.redis.del(monthlyKey);
    }
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getMonthString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private async setupConnection(): Promise<void> {
    await this.redis.connect();

    this.redis.on('error', (err) => {
      console.error('TokenTracker Redis error:', err);
    });
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}