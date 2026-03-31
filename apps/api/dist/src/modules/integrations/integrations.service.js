"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../database/database.module");
const integrations_1 = require("@karyo/integrations");
let IntegrationsService = class IntegrationsService {
    constructor(db) {
        this.db = db;
        this.integrationManager = new integrations_1.IntegrationManager();
    }
    async ensureWorkspaceMember(workspaceId, userId) {
        const member = await this.db.select()
            .from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId)))
            .limit(1);
        if (!member[0]) {
            throw new common_1.NotFoundException('Workspace access denied');
        }
        return member[0];
    }
    async list(workspaceId, userId) {
        await this.ensureWorkspaceMember(workspaceId, userId);
        return this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.workspaceId, workspaceId)).orderBy((0, drizzle_orm_1.desc)(schema_1.integrations.createdAt));
    }
    async connect(workspaceId, userId, provider) {
        await this.ensureWorkspaceMember(workspaceId, userId);
        const state = `${workspaceId}:${provider}:${Math.random().toString(36).slice(2)}`;
        const oauthUrl = `https://oauth.example.com/${provider}?client_id=fake-client-id&state=${encodeURIComponent(state)}`;
        const existing = await this.db.select().from(schema_1.integrations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.integrations.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.integrations.provider, provider)))
            .limit(1);
        if (!existing[0]) {
            await this.db.insert(schema_1.integrations).values({
                workspaceId,
                provider: provider,
                status: 'disconnected',
                syncStatus: 'disconnected',
            });
        }
        return { oauth_url: oauthUrl, state };
    }
    async callback(workspaceId, userId, provider, code, state) {
        await this.ensureWorkspaceMember(workspaceId, userId);
        const integration = await this.db.select().from(schema_1.integrations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.integrations.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.integrations.provider, provider)))
            .limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        const accessToken = `access-${provider}-${code}`;
        const refreshToken = `refresh-${provider}-${code}`;
        const updated = await this.db.update(schema_1.integrations).set({
            status: 'connected',
            config: { provider },
            accessToken,
            refreshToken,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integration[0].id)).returning();
        return updated[0];
    }
    async triggerSync(integrationId, userId) {
        const integration = await this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        await this.ensureWorkspaceMember(integration[0].workspaceId, userId);
        await this.db.update(schema_1.integrations).set({
            syncStatus: 'syncing',
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId));
        setTimeout(async () => {
            await this.db.update(schema_1.integrations).set({
                syncStatus: 'connected',
                lastSyncedAt: new Date(),
                updatedAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId));
        }, 1000);
        return { message: 'Sync queued' };
    }
    async disconnect(integrationId, userId) {
        const integration = await this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        await this.ensureWorkspaceMember(integration[0].workspaceId, userId);
        await this.integrationManager.disconnectIntegration(integrationId);
        await this.db.delete(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId));
        return { message: 'Integration disconnected' };
    }
    async getWorkspaceIntegrations(workspaceId, userId) {
        await this.ensureWorkspaceMember(workspaceId, userId);
        const dbIntegrations = await this.db.select().from(schema_1.integrations)
            .where((0, drizzle_orm_1.eq)(schema_1.integrations.workspaceId, workspaceId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.integrations.createdAt));
        return dbIntegrations.map(integration => ({
            id: integration.id,
            type: integration.provider,
            name: `${integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)} Integration`,
            status: integration.status,
            lastSync: integration.lastSyncedAt,
            config: integration.config || {}
        }));
    }
    async getTools(integrationId, userId) {
        const integration = await this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        await this.ensureWorkspaceMember(integration[0].workspaceId, userId);
        if (integration[0].status !== 'connected') {
            throw new common_1.BadRequestException('Integration is not connected');
        }
        return this.integrationManager.getIntegrationTools(integrationId);
    }
    async executeTool(integrationId, userId, toolName, parameters) {
        const integration = await this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        await this.ensureWorkspaceMember(integration[0].workspaceId, userId);
        if (integration[0].status !== 'connected') {
            throw new common_1.BadRequestException('Integration is not connected');
        }
        return this.integrationManager.executeTool(integrationId, toolName, parameters);
    }
    async configureIntegration(integrationId, userId, config) {
        const integration = await this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        await this.ensureWorkspaceMember(integration[0].workspaceId, userId);
        const updated = await this.db.update(schema_1.integrations).set({
            config: { ...integration[0].config, ...config },
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).returning();
        return updated[0];
    }
    async connectIntegration(workspaceId, userId, type) {
        await this.ensureWorkspaceMember(workspaceId, userId);
        const existing = await this.db.select().from(schema_1.integrations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.integrations.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.integrations.provider, type)))
            .limit(1);
        if (existing[0]) {
            if (existing[0].status === 'connected') {
                throw new common_1.BadRequestException('Integration already connected');
            }
            return {
                authUrl: this.getAuthUrl(type),
                integrationId: existing[0].id
            };
        }
        const newIntegration = await this.db.insert(schema_1.integrations).values({
            workspaceId,
            provider: type,
            status: 'disconnected',
            syncStatus: 'disconnected',
            config: {}
        }).returning();
        return {
            authUrl: this.getAuthUrl(type),
            integrationId: newIntegration[0].id
        };
    }
    async disconnectIntegration(integrationId, userId) {
        const integration = await this.db.select().from(schema_1.integrations).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId)).limit(1);
        if (!integration[0]) {
            throw new common_1.NotFoundException('Integration not found');
        }
        await this.ensureWorkspaceMember(integration[0].workspaceId, userId);
        await this.integrationManager.disconnectIntegration(integrationId);
        await this.db.update(schema_1.integrations).set({
            status: 'disconnected',
            syncStatus: 'disconnected',
            accessToken: null,
            refreshToken: null,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(schema_1.integrations.id, integrationId));
        return { message: 'Integration disconnected successfully' };
    }
    getAuthUrl(type) {
        const authUrls = {
            'google-drive': 'https://accounts.google.com/oauth/authorize?client_id=fake-client-id&scope=https://www.googleapis.com/auth/drive&response_type=code',
            'gmail': 'https://accounts.google.com/oauth/authorize?client_id=fake-client-id&scope=https://www.googleapis.com/auth/gmail.readonly&response_type=code',
            'slack': 'https://slack.com/oauth/authorize?client_id=fake-client-id&scope=channels:read,chat:write&response_type=code',
            'custom-api': null
        };
        return authUrls[type] || null;
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [void 0])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map