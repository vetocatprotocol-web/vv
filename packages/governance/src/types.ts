export interface TokenUsage {
  userId: string;
  workspaceId: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: Date;
  operation: string;
}

export interface UsageLimit {
  userId: string;
  workspaceId?: string;
  type: 'daily' | 'monthly' | 'total';
  limit: number;
  current: number;
  resetDate: Date;
}

export interface CostEstimate {
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  currency: string;
}

export interface GovernanceConfig {
  redisUrl: string;
  defaultLimits: {
    dailyTokens: number;
    monthlyTokens: number;
    dailyCost: number;
    monthlyCost: number;
  };
  pricing: {
    [model: string]: {
      inputCostPerToken: number;
      outputCostPerToken: number;
      currency: string;
    };
  };
}

export interface RateLimit {
  userId: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  currentMinuteCount: number;
  currentHourCount: number;
  lastResetMinute: Date;
  lastResetHour: Date;
}