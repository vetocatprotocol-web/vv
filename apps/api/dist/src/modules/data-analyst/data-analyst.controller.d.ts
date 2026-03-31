import { DataAnalystService, DataAnalysisRequest, DataAnalysisResult } from './data-analyst.service';
export declare class DataAnalystController {
    private readonly dataAnalystService;
    constructor(dataAnalystService: DataAnalystService);
    analyzeData(request: DataAnalysisRequest): Promise<DataAnalysisResult>;
    getAnalysisResult(jobId: string, userId: string): Promise<DataAnalysisResult>;
    getAnalysisHistory(userId: string, workspaceId: string, limit?: number): Promise<any>;
    deleteAnalysis(analysisId: string, userId: string): Promise<any>;
    getDataSources(workspaceId: string): Promise<any>;
    addDataSource(dataSource: any): Promise<any>;
    deleteDataSource(id: string): Promise<any>;
    testDataSource(id: string): Promise<any>;
    getUsageStats(userId: string, workspaceId: string): Promise<any>;
}
