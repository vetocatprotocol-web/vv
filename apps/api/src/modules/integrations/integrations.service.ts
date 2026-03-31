import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import { integrations, workspaceMembers } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { IntegrationManager } from '@karyo/integrations';

@Injectable()
export class IntegrationsService {
  private integrationManager: IntegrationManager;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: ReturnType<typeof drizzle>,
  ) {
    this.integrationManager = new IntegrationManager();
  }

  private async ensureWorkspaceMember(workspaceId: string, userId: string) {
    const member = await this.db.select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
      .limit(1);

    if (!member[0]) {
      throw new NotFoundException('Workspace access denied');
    }

    return member[0];
  }

  async list(workspaceId: string, userId: string) {
    await this.ensureWorkspaceMember(workspaceId, userId);
    return this.db.select().from(integrations).where(eq(integrations.workspaceId, workspaceId)).orderBy(desc(integrations.createdAt));
  }

  async connect(workspaceId: string, userId: string, provider: string) {
    await this.ensureWorkspaceMember(workspaceId, userId);

    const state = `${workspaceId}:${provider}:${Math.random().toString(36).slice(2)}`;
    const oauthUrl = `https://oauth.example.com/${provider}?client_id=fake-client-id&state=${encodeURIComponent(state)}`;

    const existing = await this.db.select().from(integrations)
      .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, provider as any)))
      .limit(1);

    if (!existing[0]) {
      await this.db.insert(integrations).values({
        workspaceId,
        provider: provider as any,
        status: 'disconnected',
        syncStatus: 'disconnected',
      });
    }

    return { oauth_url: oauthUrl, state };
  }

  async callback(workspaceId: string, userId: string, provider: string, code: string, state: string) {
    await this.ensureWorkspaceMember(workspaceId, userId);

    const integration = await this.db.select().from(integrations)
      .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, provider as any)))
      .limit(1);

    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    // Simulated token exchange
    const accessToken = `access-${provider}-${code}`;
    const refreshToken = `refresh-${provider}-${code}`;

    const updated = await this.db.update(integrations).set({
      status: 'connected',
      config: { provider },
      accessToken,
      refreshToken,
      updatedAt: new Date(),
    }).where(eq(integrations.id, integration[0].id)).returning();

    return updated[0];
  }

  async triggerSync(integrationId: string, userId: string) {
    const integration = await this.db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    await this.ensureWorkspaceMember(integration[0].workspaceId, userId);

    // Mark sync started
    await this.db.update(integrations).set({
      syncStatus: 'syncing',
      updatedAt: new Date(),
    }).where(eq(integrations.id, integrationId));

    // Placeholder for async job queue
    setTimeout(async () => {
      await this.db.update(integrations).set({
        syncStatus: 'connected',
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(integrations.id, integrationId));
    }, 1000);

    return { message: 'Sync queued' };
  }

  async disconnect(integrationId: string, userId: string) {
    const integration = await this.db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    await this.ensureWorkspaceMember(integration[0].workspaceId, userId);

    // Disconnect from the integration manager
    await this.integrationManager.disconnectIntegration(integrationId);

    await this.db.delete(integrations).where(eq(integrations.id, integrationId));
    return { message: 'Integration disconnected' };
  }

  // New methods for UI integration
  async getWorkspaceIntegrations(workspaceId: string, userId: string) {
    await this.ensureWorkspaceMember(workspaceId, userId);
    const dbIntegrations = await this.db.select().from(integrations)
      .where(eq(integrations.workspaceId, workspaceId))
      .orderBy(desc(integrations.createdAt));

    return dbIntegrations.map(integration => ({
      id: integration.id,
      type: integration.provider,
      name: `${integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)} Integration`,
      status: integration.status,
      lastSync: integration.lastSyncedAt,
      config: integration.config || {}
    }));
  }

  async getTools(integrationId: string, userId: string) {
    const integration = await this.db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    await this.ensureWorkspaceMember(integration[0].workspaceId, userId);

    if (integration[0].status !== 'connected') {
      throw new BadRequestException('Integration is not connected');
    }

    // Get tools from the integration manager
    return this.integrationManager.getIntegrationTools(integrationId);
  }

  async executeTool(integrationId: string, userId: string, toolName: string, parameters: Record<string, any>) {
    const integration = await this.db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    await this.ensureWorkspaceMember(integration[0].workspaceId, userId);

    if (integration[0].status !== 'connected') {
      throw new BadRequestException('Integration is not connected');
    }

    // Execute tool using the integration manager
    return this.integrationManager.executeTool(integrationId, toolName, parameters);
  }

  async configureIntegration(integrationId: string, userId: string, config: Record<string, any>) {
    const integration = await this.db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    await this.ensureWorkspaceMember(integration[0].workspaceId, userId);

    // Update configuration in database
    const updated = await this.db.update(integrations).set({
      config: { ...integration[0].config, ...config },
      updatedAt: new Date(),
    }).where(eq(integrations.id, integrationId)).returning();

    return updated[0];
  }

  async connectIntegration(workspaceId: string, userId: string, type: string) {
    await this.ensureWorkspaceMember(workspaceId, userId);

    // Check if integration already exists
    const existing = await this.db.select().from(integrations)
      .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, type as any)))
      .limit(1);

    if (existing[0]) {
      if (existing[0].status === 'connected') {
        throw new BadRequestException('Integration already connected');
      }
      // Return auth URL for reconnection
      return {
        authUrl: this.getAuthUrl(type),
        integrationId: existing[0].id
      };
    }

    // Create new integration
    const newIntegration = await this.db.insert(integrations).values({
      workspaceId,
      provider: type as any,
      status: 'disconnected',
      syncStatus: 'disconnected',
      config: {}
    }).returning();

    return {
      authUrl: this.getAuthUrl(type),
      integrationId: newIntegration[0].id
    };
  }

  async disconnectIntegration(integrationId: string, userId: string) {
    const integration = await this.db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration[0]) {
      throw new NotFoundException('Integration not found');
    }

    await this.ensureWorkspaceMember(integration[0].workspaceId, userId);

    // Disconnect from the integration manager
    await this.integrationManager.disconnectIntegration(integrationId);

    // Update status in database
    await this.db.update(integrations).set({
      status: 'disconnected',
      syncStatus: 'disconnected',
      accessToken: null,
      refreshToken: null,
      updatedAt: new Date(),
    }).where(eq(integrations.id, integrationId));

    return { message: 'Integration disconnected successfully' };
  }

  private getAuthUrl(type: string): string {
    // Return appropriate OAuth URLs based on integration type
    const authUrls = {
      'google-drive': 'https://accounts.google.com/oauth/authorize?client_id=fake-client-id&scope=https://www.googleapis.com/auth/drive&response_type=code',
      'gmail': 'https://accounts.google.com/oauth/authorize?client_id=fake-client-id&scope=https://www.googleapis.com/auth/gmail.readonly&response_type=code',
      'slack': 'https://slack.com/oauth/authorize?client_id=fake-client-id&scope=channels:read,chat:write&response_type=code',
      'custom-api': null // Custom API doesn't need OAuth
    };

    return authUrls[type as keyof typeof authUrls] || null;
  }
}
