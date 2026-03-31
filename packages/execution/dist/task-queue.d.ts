import { TaskJob, WorkerConfig } from './types';
import { AgentLoop } from '@karyo/agents';
import { DataAnalystProcessor } from './data-analyst-processor';
export declare class TaskQueue {
    private config;
    private agentLoop;
    private dataAnalystProcessor?;
    private queue;
    private worker;
    constructor(config: WorkerConfig, agentLoop: AgentLoop, dataAnalystProcessor?: DataAnalystProcessor | undefined);
    addTask(taskJob: Omit<TaskJob, 'id' | 'createdAt'>): Promise<string>;
    getTaskStatus(jobId: string): Promise<any>;
    private processTask;
    private setupWorkerEvents;
    close(): Promise<void>;
}
//# sourceMappingURL=task-queue.d.ts.map