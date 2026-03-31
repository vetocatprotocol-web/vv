// packages/integrations/src/types.ts

export type IntegrationType = 'google-drive' | 'slack' | 'gmail' | 'custom-api';

export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: Record<string, any>) => Promise<IntegrationResult>;
}

export interface IntegrationProvider {
  type: IntegrationType;
  name: string;
  description: string;
  authType: 'oauth2' | 'api-key' | 'basic-auth';
  requiredScopes?: string[];
  tools: ToolDefinition[];
  initialize: (config: IntegrationConfig) => Promise<void>;
  authenticate: (credentials: Record<string, any>) => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export interface IntegrationContext {
  userId: string;
  workspaceId: string;
  taskId?: string;
  sessionId?: string;
}