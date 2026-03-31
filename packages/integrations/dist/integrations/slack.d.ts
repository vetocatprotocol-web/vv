import { IntegrationProvider, IntegrationConfig, ToolDefinition } from '../types';
/**
 * Slack Integration Provider
 *
 * Provides tools for:
 * - Message posting and reading
 * - Channel management
 * - User lookup
 * - File sharing
 */
export declare class SlackIntegration implements IntegrationProvider {
    readonly type: "slack";
    readonly name = "Slack";
    readonly description = "Communicate and collaborate via Slack workspaces";
    readonly authType: "api-key";
    private client;
    readonly tools: ToolDefinition[];
    initialize(config: IntegrationConfig): Promise<void>;
    authenticate(credentials: Record<string, any>): Promise<boolean>;
    disconnect(): Promise<void>;
    private postMessage;
    private getMessages;
    private listChannels;
}
//# sourceMappingURL=slack.d.ts.map