import { IntegrationsService } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    list(workspaceId: string, req: any): Promise<{
        data: {
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
        }[];
    }>;
    getWorkspaceIntegrations(workspaceId: string, req: any): Promise<{
        integrations: {
            id: string;
            type: "google_drive" | "slack" | "gmail" | "airtable" | "stripe" | "dropbox";
            name: string;
            status: "connected" | "disconnected" | "error" | "syncing";
            lastSync: Date;
            config: unknown;
        }[];
    }>;
    getTools(integrationId: string, req: any): Promise<{
        tools: import("@karyo/integrations").ToolDefinition[];
    }>;
    executeTool(integrationId: string, body: {
        tool: string;
        parameters: Record<string, any>;
    }, req: any): Promise<{
        result: import("@karyo/integrations").IntegrationResult;
    }>;
    configureIntegration(integrationId: string, body: {
        config: Record<string, any>;
    }, req: any): Promise<{
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
    connectIntegration(body: {
        type: string;
        workspaceId: string;
    }, req: any): Promise<{
        authUrl: string;
        integrationId: string;
    }>;
    disconnectIntegration(integrationId: string, req: any): Promise<{
        message: string;
    }>;
    connect(provider: string, workspaceId: string, req: any): Promise<{
        data: {
            oauth_url: string;
            state: string;
        };
    }>;
    callback(provider: string, workspaceId: string, body: {
        code: string;
        state: string;
    }, req: any): Promise<{
        data: {
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
        };
    }>;
    sync(integrationId: string, req: any): Promise<{
        message: string;
    }>;
    disconnect(integrationId: string, req: any): Promise<{
        message: string;
    }>;
}
