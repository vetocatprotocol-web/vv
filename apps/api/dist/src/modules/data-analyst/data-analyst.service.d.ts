import { TaskClassifier } from '@karyo/ai-core';
import { AgentLoop } from '@karyo/agents';
import { MemoryInjector } from '@karyo/memory';
import { ExecutionWorker, DataAnalystProcessor } from '@karyo/execution';
import { GovernanceService } from '@karyo/governance';
import { IntegrationManager } from '@karyo/integrations';
export interface DataAnalysisRequest {
    query: string;
    dataSource?: string;
    dataSources?: Array<{
        type: 'file' | 'database' | 'api' | 'integration';
        source: string;
        integrationId?: string;
        config?: Record<string, any>;
    }>;
    userId: string;
    workspaceId: string;
    analysisType?: 'exploratory' | 'diagnostic' | 'predictive' | 'prescriptive';
    outputFormat?: 'json' | 'markdown' | 'html' | 'chart';
    options?: {
        model?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        timeout?: number;
        includeVisualizations?: boolean;
        generateReport?: boolean;
    };
}
export interface DataAnalysisResult {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    result?: {
        insights: Array<{
            type: 'summary' | 'trend' | 'anomaly' | 'correlation' | 'prediction';
            title: string;
            description: string;
            confidence: number;
            data?: any;
        }>;
        visualizations?: Array<{
            type: 'chart' | 'graph' | 'table';
            title: string;
            data: any;
            config?: any;
        }>;
        report?: {
            title: string;
            summary: string;
            sections: Array<{
                title: string;
                content: string;
                insights: string[];
            }>;
            recommendations: string[];
        };
        rawData?: any;
    };
    error?: string;
    cost?: number;
    tokens?: number;
    executionTime?: number;
    metadata?: {
        dataSourcesUsed: string[];
        analysisType: string;
        modelUsed: string;
    };
}
export declare class DataAnalystService {
    private taskClassifier;
    private agentLoop;
    private memoryInjector;
    private executionWorker;
    private governanceService;
    private integrationManager;
    private dataAnalystProcessor;
    constructor(taskClassifier: TaskClassifier, agentLoop: AgentLoop, memoryInjector: MemoryInjector, executionWorker: ExecutionWorker, governanceService: GovernanceService, integrationManager: IntegrationManager, dataAnalystProcessor: DataAnalystProcessor);
    analyzeData(request: DataAnalysisRequest): Promise<DataAnalysisResult>;
    Validate(): any;
    and: any;
    prepare: any;
    data: any;
    sources: any;
}
