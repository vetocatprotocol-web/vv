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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const integrations_service_1 = require("./integrations.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let IntegrationsController = class IntegrationsController {
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async list(workspaceId, req) {
        return { data: await this.integrationsService.list(workspaceId, req.user.userId) };
    }
    async getWorkspaceIntegrations(workspaceId, req) {
        return { integrations: await this.integrationsService.getWorkspaceIntegrations(workspaceId, req.user.userId) };
    }
    async getTools(integrationId, req) {
        return { tools: await this.integrationsService.getTools(integrationId, req.user.userId) };
    }
    async executeTool(integrationId, body, req) {
        const result = await this.integrationsService.executeTool(integrationId, req.user.userId, body.tool, body.parameters);
        return { result };
    }
    async configureIntegration(integrationId, body, req) {
        return await this.integrationsService.configureIntegration(integrationId, req.user.userId, body.config);
    }
    async connectIntegration(body, req) {
        const result = await this.integrationsService.connectIntegration(body.workspaceId, req.user.userId, body.type);
        return result;
    }
    async disconnectIntegration(integrationId, req) {
        return await this.integrationsService.disconnectIntegration(integrationId, req.user.userId);
    }
    async connect(provider, workspaceId, req) {
        return { data: await this.integrationsService.connect(workspaceId, req.user.userId, provider) };
    }
    async callback(provider, workspaceId, body, req) {
        return { data: await this.integrationsService.callback(workspaceId, req.user.userId, provider, body.code, body.state) };
    }
    async sync(integrationId, req) {
        return this.integrationsService.triggerSync(integrationId, req.user.userId);
    }
    async disconnect(integrationId, req) {
        return this.integrationsService.disconnect(integrationId, req.user.userId);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('workspaceId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('workspace/:workspaceId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getWorkspaceIntegrations", null);
__decorate([
    (0, common_1.Get)(':integrationId/tools'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getTools", null);
__decorate([
    (0, common_1.Post)(':integrationId/execute'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "executeTool", null);
__decorate([
    (0, common_1.Put)(':integrationId/configure'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "configureIntegration", null);
__decorate([
    (0, common_1.Post)('connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "connectIntegration", null);
__decorate([
    (0, common_1.Post)(':integrationId/disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "disconnectIntegration", null);
__decorate([
    (0, common_1.Post)(':provider/connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)('workspaceId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "connect", null);
__decorate([
    (0, common_1.Post)(':provider/callback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)(':integrationId/sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "sync", null);
__decorate([
    (0, common_1.Delete)(':integrationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('integrationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "disconnect", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map