// packages/ai-core/src/types.ts

export type TaskComplexity = 'simple' | 'medium' | 'complex';

export interface Task {
  id: string;
  description: string;
  userId: string;
  workspaceId: string;
  metadata?: Record<string, any>;
}

export interface ClassifiedTask extends Task {
  complexity: TaskComplexity;
  estimatedTokens: number;
  keywords: string[];
}

export type ModelTier = 'free' | 'low-cost' | 'high-end';

export interface ModelConfig {
  provider: string;
  model: string;
  tier: ModelTier;
  maxTokens: number;
  costPerToken: number;
}

export interface ContextData {
  userContext: Record<string, any>;
  memoryContext: string[];
  taskHistory: Task[];
}

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
  variables: Record<string, any>;
}