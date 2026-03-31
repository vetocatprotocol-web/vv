import { IntegrationProvider, IntegrationConfig, ToolDefinition } from '../types';
/**
 * Custom API Integration Provider
 *
 * Generic provider for any REST API
 * Supports custom authentication and endpoint configuration
 * Highly flexible for third-party service integration
 */
export declare class CustomAPIIntegration implements IntegrationProvider {
    readonly type: "custom-api";
    readonly name = "Custom API";
    readonly description = "Connect to any REST API with custom configuration";
    readonly authType: "api-key";
    private client;
    private config;
    readonly tools: ToolDefinition[];
    initialize(config: IntegrationConfig): Promise<void>;
    authenticate(credentials: Record<string, any>): Promise<boolean>;
    disconnect(): Promise<void>;
    private setupAuthentication;
    private makeGetRequest;
    private makePostRequest;
    private makePutRequest;
    private makeDeleteRequest;
    private makeRequest;
}
//# sourceMappingURL=custom-api.d.ts.map