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
exports.DataAnalystController = void 0;
const common_1 = require("@nestjs/common");
const data_analyst_service_1 = require("./data-analyst.service");
let DataAnalystController = class DataAnalystController {
    constructor(dataAnalystService) {
        this.dataAnalystService = dataAnalystService;
    }
    async analyzeData(request) {
        return this.dataAnalystService.analyzeData(request);
    }
    async getAnalysisResult(jobId, userId) {
        return this.dataAnalystService.getAnalysisResult(jobId, userId);
    }
    async getAnalysisHistory(userId, workspaceId, limit) {
        return this.dataAnalystService.getAnalysisHistory(userId, workspaceId, limit);
    }
    async deleteAnalysis(analysisId, userId) {
        return this.dataAnalystService.deleteAnalysis(analysisId, userId);
    }
    async getDataSources(workspaceId) {
        return this.dataAnalystService.getDataSources(workspaceId);
    }
    async addDataSource(dataSource) {
        return this.dataAnalystService.addDataSource(dataSource);
    }
    async deleteDataSource(id) {
        return this.dataAnalystService.deleteDataSource(id);
    }
    async testDataSource(id) {
        return this.dataAnalystService.testDataSource(id);
    }
    async getUsageStats(userId, workspaceId) {
        return this.dataAnalystService.getUsageStats(userId, workspaceId);
    }
};
exports.DataAnalystController = DataAnalystController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "analyzeData", null);
__decorate([
    (0, common_1.Get)('result/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "getAnalysisResult", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('workspaceId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "getAnalysisHistory", null);
__decorate([
    (0, common_1.Delete)('history/:analysisId'),
    __param(0, (0, common_1.Param)('analysisId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "deleteAnalysis", null);
__decorate([
    (0, common_1.Get)('data-sources'),
    __param(0, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "getDataSources", null);
__decorate([
    (0, common_1.Post)('data-sources'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "addDataSource", null);
__decorate([
    (0, common_1.Delete)('data-sources/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "deleteDataSource", null);
__decorate([
    (0, common_1.Post)('data-sources/:id/test'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "testDataSource", null);
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataAnalystController.prototype, "getUsageStats", null);
exports.DataAnalystController = DataAnalystController = __decorate([
    (0, common_1.Controller)('data-analyst'),
    __metadata("design:paramtypes", [data_analyst_service_1.DataAnalystService])
], DataAnalystController);
//# sourceMappingURL=data-analyst.controller.js.map