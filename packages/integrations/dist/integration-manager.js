"use strict";
// packages/integrations/src/integration-manager.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationManager = void 0;
const google_drive_1 = require("./integrations/google-drive");
const slack_1 = require("./integrations/slack");
const gmail_1 = require("./integrations/gmail");
const custom_api_1 = require("./integrations/custom-api");
/**
 * Integration Manager
 *
 * Unified interface for all external service integrations
 * Manages authentication, tool execution, and provider lifecycle
 * Integrates with governance for cost tracking and rate limiting
 */
class IntegrationManager {
    constructor() {
        this.providers = new Map();
        this.activeIntegrations = new Map();
        this.availableTools = new Map();
        this.initializeProviders();
    }
    /**
     * Initialize all available integration providers
     */
    initializeProviders() {
        const providers = [
            new google_drive_1.GoogleDriveIntegration(),
            new slack_1.SlackIntegration(),
            new gmail_1.GmailIntegration(),
            new custom_api_1.CustomAPIIntegration(),
        ];
        providers.forEach(provider => {
            this.providers.set(provider.type, provider);
            // Register provider tools
            provider.tools.forEach(tool => {
                this.availableTools.set(`${provider.type}:${tool.name}`, tool);
            });
        });
    }
    /**
     * Configure and activate an integration
     */
    async configureIntegration(config) {
        try {
            const provider = this.providers.get(config.type);
            if (!provider) {
                return {
                    success: false,
                    error: `Integration type '${config.type}' not supported`,
                };
            }
            // Authenticate with the provider
            const authenticated = await provider.authenticate(config.credentials);
            if (!authenticated) {
                return {
                    success: false,
                    error: 'Authentication failed',
                };
            }
            // Initialize the provider
            await provider.initialize(config);
            // Store the active integration
            this.activeIntegrations.set(config.id, config);
            return {
                success: true,
                data: {
                    integrationId: config.id,
                    tools: provider.tools.map(tool => tool.name),
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Integration configuration failed: ${errorMessage}`,
            };
        }
    }
    /**
     * Get available tools for an integration
     */
    getIntegrationTools(integrationId) {
        const config = this.activeIntegrations.get(integrationId);
        if (!config) {
            return [];
        }
        const provider = this.providers.get(config.type);
        if (!provider) {
            return [];
        }
        return provider.tools;
    }
    /**
     * Execute a tool from an integrated service
     */
    async executeTool(integrationId, toolName, parameters, context) {
        try {
            const integration = this.activeIntegrations.get(integrationId);
            if (!integration) {
                return {
                    success: false,
                    error: `Integration '${integrationId}' not found or not active`,
                };
            }
            const provider = this.providers.get(integration.type);
            if (!provider) {
                return {
                    success: false,
                    error: `Provider for integration type '${integration.type}' not found`,
                };
            }
            const tool = this.availableTools.get(`${integration.type}:${toolName}`);
            if (!tool) {
                return {
                    success: false,
                    error: `Tool '${toolName}' not found for integration type '${integration.type}'`,
                };
            }
            // Execute the tool with governance context
            const result = await tool.execute(parameters);
            return {
                success: true,
                data: result.data,
                metadata: {
                    integrationId,
                    toolName,
                    context,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Tool execution failed: ${errorMessage}`,
            };
        }
    }
    /**
     * Get available tools for an integration
     */
    getAvailableTools(integrationId) {
        const integration = this.activeIntegrations.get(integrationId);
        if (!integration)
            return [];
        const provider = this.providers.get(integration.type);
        return provider?.tools || [];
    }
    /**
     * Get all supported integration types
     */
    getSupportedIntegrations() {
        return Array.from(this.providers.values()).map(provider => ({
            type: provider.type,
            name: provider.name,
            description: provider.description,
            authType: provider.authType,
        }));
    }
    /**
     * Disconnect an integration
     */
    async disconnectIntegration(integrationId) {
        try {
            const integration = this.activeIntegrations.get(integrationId);
            if (!integration) {
                return {
                    success: false,
                    error: `Integration '${integrationId}' not found`,
                };
            }
            const provider = this.providers.get(integration.type);
            if (provider) {
                await provider.disconnect();
            }
            this.activeIntegrations.delete(integrationId);
            return {
                success: true,
                data: { integrationId },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Disconnect failed: ${errorMessage}`,
            };
        }
    }
    /**
     * Get integration status
     */
    getIntegrationStatus(integrationId) {
        const integration = this.activeIntegrations.get(integrationId);
        if (!integration) {
            return { isActive: false };
        }
        const provider = this.providers.get(integration.type);
        return {
            isActive: true,
            type: integration.type,
            tools: provider?.tools.map(tool => tool.name) || [],
        };
    }
}
exports.IntegrationManager = IntegrationManager;
//# sourceMappingURL=integration-manager.js.map