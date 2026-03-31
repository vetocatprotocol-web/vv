import { IntegrationProvider, IntegrationConfig, ToolDefinition } from '../types';
/**
 * Gmail Integration Provider
 *
 * Provides tools for:
 * - Email reading and sending
 * - Label management
 * - Search functionality
 * - Attachment handling
 */
export declare class GmailIntegration implements IntegrationProvider {
    readonly type: "gmail";
    readonly name = "Gmail";
    readonly description = "Access and manage Gmail messages and labels";
    readonly authType: "oauth2";
    readonly requiredScopes: string[];
    private gmail;
    readonly tools: ToolDefinition[];
    initialize(config: IntegrationConfig): Promise<void>;
    authenticate(credentials: Record<string, any>): Promise<boolean>;
    disconnect(): Promise<void>;
    private searchEmails;
    private sendEmail;
    private getEmail;
}
//# sourceMappingURL=gmail.d.ts.map