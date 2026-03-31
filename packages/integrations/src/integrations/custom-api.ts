// packages/integrations/src/integrations/custom-api.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  IntegrationProvider,
  IntegrationConfig,
  IntegrationResult,
  ToolDefinition
} from '../types';

/**
 * Custom API Integration Provider
 *
 * Generic provider for any REST API
 * Supports custom authentication and endpoint configuration
 * Highly flexible for third-party service integration
 */
export class CustomAPIIntegration implements IntegrationProvider {
  readonly type = 'custom-api' as const;
  readonly name = 'Custom API';
  readonly description = 'Connect to any REST API with custom configuration';
  readonly authType = 'api-key' as const; // Can be extended for other auth types

  private client: AxiosInstance | null = null;
  private config: IntegrationConfig | null = null;

  readonly tools: ToolDefinition[] = [
    {
      name: 'get_request',
      description: 'Make a GET request to a custom API endpoint',
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API endpoint path (relative to base URL)',
            required: ['endpoint'],
          },
          params: {
            type: 'object',
            description: 'Query parameters',
          },
          headers: {
            type: 'object',
            description: 'Additional headers',
          },
        },
        required: ['endpoint'],
      },
      execute: this.makeGetRequest.bind(this),
    },
    {
      name: 'post_request',
      description: 'Make a POST request to a custom API endpoint',
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API endpoint path (relative to base URL)',
            required: ['endpoint'],
          },
          data: {
            type: 'object',
            description: 'Request body data',
          },
          headers: {
            type: 'object',
            description: 'Additional headers',
          },
        },
        required: ['endpoint'],
      },
      execute: this.makePostRequest.bind(this),
    },
    {
      name: 'put_request',
      description: 'Make a PUT request to a custom API endpoint',
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API endpoint path (relative to base URL)',
            required: ['endpoint'],
          },
          data: {
            type: 'object',
            description: 'Request body data',
          },
          headers: {
            type: 'object',
            description: 'Additional headers',
          },
        },
        required: ['endpoint'],
      },
      execute: this.makePutRequest.bind(this),
    },
    {
      name: 'delete_request',
      description: 'Make a DELETE request to a custom API endpoint',
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API endpoint path (relative to base URL)',
            required: ['endpoint'],
          },
          headers: {
            type: 'object',
            description: 'Additional headers',
          },
        },
        required: ['endpoint'],
      },
      execute: this.makeDeleteRequest.bind(this),
    },
  ];

  async initialize(config: IntegrationConfig): Promise<void> {
    this.config = config;

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: config.settings.baseUrl,
      timeout: config.settings.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.settings.defaultHeaders,
      },
    });

    // Configure authentication
    this.setupAuthentication();
  }

  async authenticate(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!this.client || !this.config) return false;

      // Test authentication with a simple request
      const testEndpoint = this.config.settings.testEndpoint || '/health';
      await this.client.get(testEndpoint);

      return true;
    } catch (error) {
      console.error('Custom API authentication failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.config = null;
  }

  private setupAuthentication(): void {
    if (!this.client || !this.config) return;

    const { credentials, settings } = this.config;

    // API Key authentication
    if (settings.authType === 'api-key') {
      const headerName = settings.apiKeyHeader || 'Authorization';
      const headerValue = settings.apiKeyPrefix
        ? `${settings.apiKeyPrefix} ${credentials.apiKey}`
        : credentials.apiKey;

      this.client.defaults.headers.common[headerName] = headerValue;
    }

    // Bearer token authentication
    else if (settings.authType === 'bearer') {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${credentials.token}`;
    }

    // Basic authentication
    else if (settings.authType === 'basic') {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      this.client.defaults.headers.common['Authorization'] = `Basic ${auth}`;
    }

    // OAuth2 (would need token refresh logic)
    else if (settings.authType === 'oauth2') {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${credentials.accessToken}`;
    }
  }

  private async makeGetRequest(params: Record<string, any>): Promise<IntegrationResult> {
    return this.makeRequest('GET', params.endpoint, {
      params: params.params,
      headers: params.headers,
    });
  }

  private async makePostRequest(params: Record<string, any>): Promise<IntegrationResult> {
    return this.makeRequest('POST', params.endpoint, {
      data: params.data,
      headers: params.headers,
    });
  }

  private async makePutRequest(params: Record<string, any>): Promise<IntegrationResult> {
    return this.makeRequest('PUT', params.endpoint, {
      data: params.data,
      headers: params.headers,
    });
  }

  private async makeDeleteRequest(params: Record<string, any>): Promise<IntegrationResult> {
    return this.makeRequest('DELETE', params.endpoint, {
      headers: params.headers,
    });
  }

  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<IntegrationResult> {
    try {
      if (!this.client) {
        return { success: false, error: 'API client not initialized' };
      }

      const response = await this.client.request({
        method,
        url: endpoint,
        ...config,
      });

      return {
        success: true,
        data: {
          status: response.status,
          data: response.data,
          headers: response.headers,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `API request failed: ${error.message}`,
        metadata: {
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  }
}