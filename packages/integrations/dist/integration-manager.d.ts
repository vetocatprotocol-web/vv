import { IntegrationConfig, IntegrationResult, IntegrationContext, ToolDefinition } from './types';
/**
 * Integration Manager
 *
 * Unified interface for all external service integrations
 * Manages authentication, tool execution, and provider lifecycle
 * Integrates with governance for cost tracking and rate limiting
 */
export declare class IntegrationManager {
    private providers;
    private activeIntegrations;
    private availableTools;
    constructor();
    /**
     * Initialize all available integration providers
     */
    private initializeProviders;
    /**
     * Configure and activate an integration
     */
    configureIntegration(config: IntegrationConfig): Promise<IntegrationResult>;
    /**
     * Get available tools for an integration
     */
    getIntegrationTools(integrationId: string): ToolDefinition[];
    /**
     * Execute a tool from an integrated service
     */
    executeTool(integrationId: string, toolName: string, parameters: Record<string, any>, context: IntegrationContext): Promise<IntegrationResult>;
    /**
     * Get available tools for an integration
     */
    getAvailableTools(integrationId: string): ToolDefinition[];
    /**
     * Get all supported integration types
     */
    getSupportedIntegrations(): Array<{
        type: string;
        name: string;
        description: string;
        authType: string;
    }>;
    /**
     * Disconnect an integration
     */
    disconnectIntegration(integrationId: string): Promise<IntegrationResult>;
    /**
     * Get integration status
     */
    getIntegrationStatus(integrationId: string): {
        isActive: boolean;
        type?: string;
        tools?: string[];
    };
}
//# sourceMappingURL=integration-manager.d.ts.map