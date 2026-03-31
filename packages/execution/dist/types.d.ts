export interface TaskJob {
    id: string;
    task: string;
    context?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    timeout?: number;
    retryAttempts?: number;
    createdAt: Date;
    userId?: string;
    workspaceId?: string;
    query?: string;
    dataSources?: Array<{
        type: string;
        source: string;
        integrationId?: string;
        config?: Record<string, any>;
        data?: any;
    }>;
    analysisType?: 'exploratory' | 'diagnostic' | 'predictive' | 'prescriptive';
    outputFormat?: 'json' | 'markdown' | 'html' | 'chart';
    model?: string;
    includeVisualizations?: boolean;
    generateReport?: boolean;
    costEstimate?: any;
}
export interface TaskResult {
    jobId: string;
    success: boolean;
    result?: any;
    error?: string;
    executionTime: number;
    completedAt: Date;
    data?: any;
}
export interface EventMessage {
    type: string;
    payload: Record<string, any>;
    timestamp: Date;
    source?: string;
}
export interface WorkerConfig {
    concurrency: number;
    redisUrl: string;
    queueName: string;
}
export interface EventBusConfig {
    redisUrl: string;
    channelPrefix?: string;
}
//# sourceMappingURL=types.d.ts.map