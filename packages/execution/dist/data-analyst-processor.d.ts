import { IntegrationManager } from '@karyo/integrations';
import { TaskClassifier, ModelRouter } from '@karyo/ai-core';
import { AgentLoop } from '@karyo/agents';
interface DataAnalysisTask {
    userId: string;
    workspaceId: string;
    query: string;
    dataSources: Array<{
        type: string;
        source: string;
        integrationId?: string;
        config?: Record<string, any>;
        data?: any;
    }>;
    analysisType: 'exploratory' | 'diagnostic' | 'predictive' | 'prescriptive';
    outputFormat: 'json' | 'markdown' | 'html' | 'chart';
    model: string;
    includeVisualizations: boolean;
    generateReport: boolean;
    costEstimate: any;
}
export declare class DataAnalystProcessor {
    private integrationManager;
    private taskClassifier;
    private agentLoop;
    private modelRouter;
    constructor(integrationManager: IntegrationManager, taskClassifier: TaskClassifier, agentLoop: AgentLoop, modelRouter: ModelRouter);
    /**
     * Execute comprehensive data analysis
     */
    executeAnalysis(task: DataAnalysisTask): Promise<any>;
    /**
     * Gather data from all configured sources
     */
    private gatherDataFromSources;
    /**
     * Gather data from integrated services
     */
    private gatherIntegrationData;
    /**
     * Gather data from files (placeholder)
     */
    private gatherFileData;
    /**
     * Gather data from databases (placeholder)
     */
    private gatherDatabaseData;
    /**
     * Gather data from APIs (placeholder)
     */
    private gatherApiData;
    /**
     * Perform the actual data analysis
     */
    private performAnalysis;
    temperature: 0.3;
    maxTokens: 4000;
}
export {};
//# sourceMappingURL=data-analyst-processor.d.ts.map