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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalystService = void 0;
const common_1 = require("@nestjs/common");
const ai_core_1 = require("@karyo/ai-core");
const agents_1 = require("@karyo/agents");
const memory_1 = require("@karyo/memory");
const execution_1 = require("@karyo/execution");
const governance_1 = require("@karyo/governance");
const integrations_1 = require("@karyo/integrations");
let DataAnalystService = class DataAnalystService {
    constructor(taskClassifier, agentLoop, memoryInjector, executionWorker, governanceService, integrationManager, dataAnalystProcessor) {
        this.taskClassifier = taskClassifier;
        this.agentLoop = agentLoop;
        this.memoryInjector = memoryInjector;
        this.executionWorker = executionWorker;
        this.governanceService = governanceService;
        this.integrationManager = integrationManager;
        this.dataAnalystProcessor = dataAnalystProcessor;
    }
    async analyzeData(request) {
        const { query, dataSources = [], userId, workspaceId, analysisType = 'exploratory', outputFormat = 'json', options = {} } = request;
        try {
            const validatedDataSources = await this.validateDataSources(dataSources, workspaceId, userId);
            const taskDescription = `AI Data Analysis: ${query} (${analysisType}) using ${validatedDataSources.length} data sources`;
            const classifiedTask = await this.taskClassifier.classifyTask({
                id: `analysis_${Date.now()}`,
                description: taskDescription,
                userId,
                workspaceId,
                metadata: {
                    dataSources: validatedDataSources,
                    analysisType,
                    outputFormat,
                    includeVisualizations: options.includeVisualizations,
                    generateReport: options.generateReport
                },
            });
            const estimatedTokens = this.estimateAnalysisTokens(validatedDataSources, analysisType, options);
            const authResult = await this.governanceService.authorizeRequest(userId, workspaceId, options.model || 'gpt-4', estimatedTokens.input, estimatedTokens.output);
            if (!authResult.allowed) {
                return {
                    jobId: '',
                    status: 'failed',
                    error: authResult.reason,
                };
            }
            const jobId = await this.executionWorker.queueTask(`AI Data Analyst: ${taskDescription}`, {
                userId,
                workspaceId,
                query,
                dataSources: validatedDataSources,
                analysisType,
                outputFormat,
                model: options.model || 'gpt-4',
                includeVisualizations: options.includeVisualizations || false,
                generateReport: options.generateReport || false,
                costEstimate: authResult.costEstimate,
            }, options.priority || 'high');
            return {
                jobId,
                status: 'queued',
                cost: authResult.costEstimate.estimatedCost,
                metadata: {
                    dataSourcesUsed: validatedDataSources.map(ds => ds.source),
                    analysisType,
                    modelUsed: options.model || 'gpt-4'
                }
            };
        }
        catch (error) {
            console.error('Data analysis error:', error);
            return {
                jobId: '',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    *Validate() { }
};
exports.DataAnalystService = DataAnalystService;
exports.DataAnalystService = DataAnalystService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_core_1.TaskClassifier,
        agents_1.AgentLoop,
        memory_1.MemoryInjector,
        execution_1.ExecutionWorker,
        governance_1.GovernanceService,
        integrations_1.IntegrationManager,
        execution_1.DataAnalystProcessor])
], DataAnalystService);
for (analysis
    * /; private; async)
    validateDataSources(dataSources, DataAnalysisRequest['dataSources'], workspaceId, string, userId, string);
Promise < Array < {
    type: string,
    source: string,
    integrationId: string,
    config: (Record),
    data: any
} >> {
    const: validatedSources = [],
    for(, source, of, dataSources) {
        try {
            switch (source.type) {
                case 'integration':
                    if (!source.integrationId) {
                        throw new Error('Integration ID required for integration data source');
                    }
                    const integrationStatus = this.integrationManager.getIntegrationStatus(source.integrationId);
                    if (!integrationStatus.isActive) {
                        throw new Error(`Integration ${source.integrationId} is not active`);
                    }
                    validatedSources.push({
                        ...source,
                        tools: integrationStatus.tools
                    });
                    break;
                case 'file':
                    validatedSources.push(source);
                    break;
                case 'database':
                    validatedSources.push(source);
                    break;
                case 'api':
                    validatedSources.push(source);
                    break;
                default:
                    throw new Error(`Unsupported data source type: ${source.type}`);
            }
        }
        catch (error) {
            console.warn(`Skipping invalid data source ${source.source}:`, error);
        }
    },
    return: validatedSources
};
estimateAnalysisTokens(dataSources, any[], analysisType, string, options, any);
{
    input: number;
    output: number;
}
{
    let baseInputTokens = 1000;
    let baseOutputTokens = 2000;
    for (const source of dataSources) {
        switch (source.type) {
            case 'integration':
                baseInputTokens += 500;
                break;
            case 'file':
                baseInputTokens += 2000;
                break;
            case 'database':
                baseInputTokens += 1500;
                break;
            case 'api':
                baseInputTokens += 1000;
                break;
        }
    }
    switch (analysisType) {
        case 'predictive':
            baseOutputTokens += 1000;
            break;
        case 'prescriptive':
            baseOutputTokens += 1500;
            break;
    }
    if (options.includeVisualizations)
        baseOutputTokens += 500;
    if (options.generateReport)
        baseOutputTokens += 1000;
    return {
        input: baseInputTokens,
        output: baseOutputTokens
    };
}
async;
getAnalysisResult(jobId, string, userId, string);
Promise < DataAnalysisResult > {
    try: {
        const: jobStatus = await this.executionWorker.getTaskStatus(jobId),
        if(, jobStatus) {
            return {
                jobId,
                status: 'failed',
                error: 'Job not found',
            };
        },
        const: status = jobStatus.state,
        let, resultStatus: 'queued' | 'processing' | 'completed' | 'failed', 'processing': ,
        if(status) { }
    } === 'completed'
};
{
    resultStatus = 'completed';
}
if (status === 'failed') {
    resultStatus = 'failed';
}
else if (status === 'active') {
    resultStatus = 'processing';
}
else {
    resultStatus = 'queued';
}
return {
    jobId,
    status: resultStatus,
    result: jobStatus.returnvalue,
    error: jobStatus.failedReason,
    executionTime: jobStatus.finishedOn ? (new Date(jobStatus.finishedOn).getTime() - new Date(jobStatus.processedOn).getTime()) : undefined,
};
try { }
catch (error) {
    console.error('Get analysis result error:', error);
    return {
        jobId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to get result',
    };
}
async;
getAnalysisHistory(userId, string, workspaceId, string, limit, number = 10);
{
    try {
        const history = await this.governanceService.getUsageHistory(userId, workspaceId, limit);
        return history.filter(record => record.operation === 'data_analysis' ||
            record.metadata?.analysisType === 'data_analyst');
    }
    catch (error) {
        console.error('Get analysis history error:', error);
        return [];
    }
}
async;
getUsageStats(userId, string, workspaceId, string);
{
    try {
        return await this.governanceService.getUsageStats(userId, workspaceId, 'monthly');
    }
    catch (error) {
        console.error('Get usage stats error:', error);
        return null;
    }
}
async;
getDataSources(workspaceId, string);
{
    try {
        return {
            dataSources: [
                {
                    id: '1',
                    name: 'Sample CSV Data',
                    type: 'file',
                    status: 'active',
                    config: {},
                    createdAt: new Date().toISOString(),
                    lastUsed: new Date().toISOString()
                }
            ]
        };
    }
    catch (error) {
        console.error('Get data sources error:', error);
        return { dataSources: [] };
    }
}
async;
addDataSource(dataSource, any);
{
    try {
        return {
            dataSource: {
                id: Date.now().toString(),
                ...dataSource,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        };
    }
    catch (error) {
        console.error('Add data source error:', error);
        throw error;
    }
}
async;
deleteDataSource(id, string);
{
    try {
        return { success: true };
    }
    catch (error) {
        console.error('Delete data source error:', error);
        throw error;
    }
}
async;
testDataSource(id, string);
{
    try {
        return { success: true };
    }
    catch (error) {
        console.error('Test data source error:', error);
        return { success: false, error: error.message };
    }
}
async;
deleteAnalysis(analysisId, string, userId, string);
{
    try {
        return { success: true };
    }
    catch (error) {
        console.error('Delete analysis error:', error);
        throw error;
    }
}
//# sourceMappingURL=data-analyst.service.js.map