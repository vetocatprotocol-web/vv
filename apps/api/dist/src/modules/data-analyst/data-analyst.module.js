"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalystModule = void 0;
const common_1 = require("@nestjs/common");
const data_analyst_controller_1 = require("./data-analyst.controller");
const data_analyst_service_1 = require("./data-analyst.service");
const tasks_module_1 = require("../tasks/tasks.module");
const agents_module_1 = require("../agents/agents.module");
const files_module_1 = require("../files/files.module");
const ai_core_1 = require("@karyo/ai-core");
const agents_1 = require("@karyo/agents");
const memory_1 = require("@karyo/memory");
const execution_1 = require("@karyo/execution");
const governance_1 = require("@karyo/governance");
let DataAnalystModule = class DataAnalystModule {
};
exports.DataAnalystModule = DataAnalystModule;
exports.DataAnalystModule = DataAnalystModule = __decorate([
    (0, common_1.Module)({
        imports: [tasks_module_1.TasksModule, agents_module_1.AgentsModule, files_module_1.FilesModule],
        controllers: [data_analyst_controller_1.DataAnalystController],
        providers: [
            data_analyst_service_1.DataAnalystService,
            {
                provide: ai_core_1.TaskClassifier,
                useFactory: () => {
                    return {
                        classifyTask: async (task) => ({
                            ...task,
                            complexity: 'medium',
                            estimatedTokens: 1000,
                        }),
                    };
                },
            },
            {
                provide: agents_1.AgentLoop,
                useFactory: () => {
                    return {
                        executeTask: async (task) => ({ result: 'Analysis completed', success: true }),
                    };
                },
            },
            {
                provide: memory_1.MemoryInjector,
                useFactory: () => ({
                    buildEnrichedContext: async (context) => context,
                    storeExecutionResult: async () => { },
                }),
            },
            {
                provide: execution_1.ExecutionWorker,
                useFactory: () => ({
                    queueTask: async (task, context) => `job_${Date.now()}`,
                    getTaskStatus: async (jobId) => ({ state: 'completed', returnvalue: { analysis: 'Sample analysis result' } }),
                }),
            },
            {
                provide: governance_1.GovernanceService,
                useFactory: () => ({
                    authorizeRequest: async () => ({
                        allowed: true,
                        costEstimate: { estimatedCost: 0.1, currency: 'USD' },
                        remainingBudget: { tokens: 9000, cost: 9.9 },
                    }),
                    getUsageHistory: async () => [],
                    getUsageStats: async () => ({
                        usage: { tokens: 1000, cost: 0.1 },
                        limits: { tokens: 10000, cost: 10 },
                        remaining: { tokens: 9000, cost: 9.9 },
                    }),
                }),
            },
        ],
        exports: [data_analyst_service_1.DataAnalystService],
    })
], DataAnalystModule);
//# sourceMappingURL=data-analyst.module.js.map