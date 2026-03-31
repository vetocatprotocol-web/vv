import { CostEstimator } from '../cost-estimator';

describe('CostEstimator', () => {
  let costEstimator: CostEstimator;

  const mockConfig = {
    redisUrl: 'redis://localhost:6379',
    defaultLimits: {
      dailyTokens: 10000,
      monthlyTokens: 100000,
      dailyCost: 10,
      monthlyCost: 100,
    },
    pricing: {
      'gpt-4': {
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006,
        currency: 'USD',
      },
      'gpt-3.5-turbo': {
        inputCostPerToken: 0.0000015,
        outputCostPerToken: 0.000002,
        currency: 'USD',
      },
    },
  };

  beforeEach(() => {
    costEstimator = new CostEstimator(mockConfig);
  });

  it('should estimate cost correctly for GPT-4', () => {
    const estimate = costEstimator.estimateCost('gpt-4', 1000, 500);

    expect(estimate.model).toBe('gpt-4');
    expect(estimate.inputTokens).toBe(1000);
    expect(estimate.outputTokens).toBe(500);
    expect(estimate.currency).toBe('USD');
    expect(estimate.estimatedCost).toBeCloseTo(0.06, 2); // (1000 * 0.00003) + (500 * 0.00006) = 0.03 + 0.03 = 0.06
  });

  it('should estimate cost correctly for GPT-3.5-turbo', () => {
    const estimate = costEstimator.estimateCost('gpt-3.5-turbo', 2000, 1000);

    expect(estimate.model).toBe('gpt-3.5-turbo');
    expect(estimate.estimatedCost).toBeCloseTo(0.005, 3); // (2000 * 0.0000015) + (1000 * 0.000002) = 0.003 + 0.002 = 0.005
  });

  it('should throw error for unknown model', () => {
    expect(() => {
      costEstimator.estimateCost('unknown-model', 100, 50);
    }).toThrow('Pricing not found for model: unknown-model');
  });

  it('should get available models', () => {
    const models = costEstimator.getAvailableModels();
    expect(models).toEqual(['gpt-4', 'gpt-3.5-turbo']);
  });

  it('should calculate remaining budget correctly', () => {
    const currentUsage = { tokens: 50000, cost: 50 };
    const limits = { dailyTokens: 10000, dailyCost: 10, monthlyTokens: 100000, monthlyCost: 100 };

    const remaining = costEstimator.calculateRemainingBudget(currentUsage, limits, 'monthly');

    expect(remaining.remainingTokens).toBe(50000);
    expect(remaining.remainingCost).toBe(50);
    expect(remaining.isOverLimit).toBe(false);
  });

  it('should detect when over limit', () => {
    const currentUsage = { tokens: 150000, cost: 150 };
    const limits = { dailyTokens: 10000, dailyCost: 10, monthlyTokens: 100000, monthlyCost: 100 };

    const remaining = costEstimator.calculateRemainingBudget(currentUsage, limits, 'monthly');

    expect(remaining.remainingTokens).toBe(0);
    expect(remaining.remainingCost).toBe(0);
    expect(remaining.isOverLimit).toBe(true);
  });
});