import { drizzle } from 'drizzle-orm/postgres-js';
export declare class IntegrationsService {
    private db;
    private integrationManager;
    constructor(db: ReturnType<typeof drizzle>);
    private ensureWorkspaceMember;
    list(workspaceId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        status: "connected" | "disconnected" | "error" | "syncing";
        config: unknown;
        provider: "google_drive" | "slack" | "gmail" | "airtable" | "stripe" | "dropbox";
        accessToken: string;
        refreshToken: string;
        syncStatus: "connected" | "disconnected" | "error" | "syncing";
        lastSyncedAt: Date;
    }[]>;
    connect(workspaceId: string, userId: string, provider: string): Promise<{
        oauth_url: string;
        state: string;
    }>;
    callback(workspaceId: string, userId: string, provider: string, code: string, state: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        status: "connected" | "disconnected" | "error" | "syncing";
        config: unknown;
        provider: "google_drive" | "slack" | "gmail" | "airtable" | "stripe" | "dropbox";
        accessToken: string;
        refreshToken: string;
        syncStatus: "connected" | "disconnected" | "error" | "syncing";
        lastSyncedAt: Date;
    }>;
    triggerSync(integrationId: string, userId: string): Promise<{
        message: string;
    }>;
    disconnect(integrationId: string, userId: string): Promise<{
        message: string;
    }>;
    getWorkspaceIntegrations(workspaceId: string, userId: string): Promise<{
        id: string;
        type: "google_drive" | "slack" | "gmail" | "airtable" | "stripe" | "dropbox";
        name: string;
        status: "connected" | "disconnected" | "error" | "syncing";
        lastSync: Date;
        config: unknown;
    }[]>;
    getTools(integrationId: string, userId: string): Promise<import("@karyo/integrations").ToolDefinition[]>;
    executeTool(integrationId: string, userId: string, toolName: string, parameters: Record<string, any>): Promise<import("@karyo/integrations").IntegrationResult>;
    configureIntegration(integrationId: string, userId: string, config: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        status: "connected" | "disconnected" | "error" | "syncing";
        config: unknown;
        provider: "google_drive" | "slack" | "gmail" | "airtable" | "stripe" | "dropbox";
        accessToken: string;
        refreshToken: string;
        syncStatus: "connected" | "disconnected" | "error" | "syncing";
        lastSyncedAt: Date;
    }>;
    connectIntegration(workspaceId: string, userId: string, type: string): Promise<{
        authUrl: string;
        integrationId: string;
    }>;
    disconnectIntegration(integrationId: string, userId: string): Promise<{
        message: string;
    }>;
    private getAuthUrl;
}
