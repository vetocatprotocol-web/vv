import { WorkerConfig, EventBusConfig } from './types';
import { AgentLoop } from '@karyo/agents';
import { MemoryInjector } from '@karyo/memory';
import { DataAnalystProcessor } from './data-analyst-processor';
export declare class ExecutionWorker {
    private taskQueue;
    private eventBus;
    private agentLoop;
    private memoryInjector;
    private dataAnalystProcessor;
    constructor(workerConfig: WorkerConfig, eventBusConfig: EventBusConfig, agentLoop: AgentLoop, memoryInjector: MemoryInjector, dataAnalystProcessor: DataAnalystProcessor);
    start(): Promise<void>;
    stop(): Promise<void>;
    queueTask(task: string, context?: Record<string, any>, priority?: string): Promise<string>;
    getTaskStatus(jobId: string): Promise<any>;
    private handleTaskQueued;
    private handleTaskCompleted;
    private handleTaskFailed;
    private setupEventHandlers;
}
//# sourceMappingURL=worker.d.ts.map