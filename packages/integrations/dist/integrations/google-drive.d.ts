import { IntegrationProvider, IntegrationConfig, ToolDefinition } from '../types';
/**
 * Google Drive Integration Provider
 *
 * Provides tools for:
 * - File listing and search
 * - File download/upload
 * - Folder management
 * - Permission management
 */
export declare class GoogleDriveIntegration implements IntegrationProvider {
    readonly type: "google-drive";
    readonly name = "Google Drive";
    readonly description = "Access and manage Google Drive files and folders";
    readonly authType: "oauth2";
    readonly requiredScopes: string[];
    private drive;
    readonly tools: ToolDefinition[];
    initialize(config: IntegrationConfig): Promise<void>;
    authenticate(credentials: Record<string, any>): Promise<boolean>;
    disconnect(): Promise<void>;
    private listFiles;
    private downloadFile;
    private searchFiles;
}
//# sourceMappingURL=google-drive.d.ts.map