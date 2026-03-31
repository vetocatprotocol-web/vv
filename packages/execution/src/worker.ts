import { TaskQueue } from './task-queue';
import { EventBus } from './event-bus';
import { WorkerConfig, EventBusConfig } from './types';
import { AgentLoop } from '@karyo/agents';
import { MemoryInjector } from '@karyo/memory';
import { DataAnalystProcessor } from './data-analyst-processor';

export class ExecutionWorker {
  private taskQueue: TaskQueue;
  private eventBus: EventBus;
  private agentLoop: AgentLoop;
  private memoryInjector: MemoryInjector;
  private dataAnalystProcessor: DataAnalystProcessor;

  constructor(
    workerConfig: WorkerConfig,
    eventBusConfig: EventBusConfig,
    agentLoop: AgentLoop,
    memoryInjector: MemoryInjector,
    dataAnalystProcessor: DataAnalystProcessor
  ) {
    this.agentLoop = agentLoop;
    this.memoryInjector = memoryInjector;
    this.dataAnalystProcessor = dataAnalystProcessor;

    this.taskQueue = new TaskQueue(workerConfig, agentLoop);
    this.eventBus = new EventBus(eventBusConfig);

    this.setupEventHandlers();
  }

  async start(): Promise<void> {
    console.log('Starting KARYO Execution Worker...');

    // Subscribe to relevant events
    await this.eventBus.subscribe('task:queued', this.handleTaskQueued.bind(this));
    await this.eventBus.subscribe('task:completed', this.handleTaskCompleted.bind(this));
    await this.eventBus.subscribe('task:failed', this.handleTaskFailed.bind(this));

    // Worker is already started in TaskQueue constructor
    console.log('Execution Worker started successfully');
  }

  async stop(): Promise<void> {
    console.log('Stopping KARYO Execution Worker...');
    await this.taskQueue.close();
    await this.eventBus.close();
    console.log('Execution Worker stopped');
  }

  async queueTask(task: string, context?: Record<string, any>, priority?: string): Promise<string> {
    const enrichedContext = await this.memoryInjector.buildEnrichedContext(context || {});

    const jobId = await this.taskQueue.addTask({
      task,
      context: enrichedContext,
      priority: priority as any,
    });

    // Publish event
    await this.eventBus.publish('task:queued', {
      jobId,
      task,
      context: enrichedContext,
      priority,
    });

    return jobId;
  }

  async getTaskStatus(jobId: string): Promise<any> {
    return await this.taskQueue.getTaskStatus(jobId);
  }

  private async handleTaskQueued(message: any): Promise<void> {
    console.log(`Task queued: ${message.payload.jobId}`);
    // Could add additional processing here, like logging to memory
  }

  private async handleTaskCompleted(message: any): Promise<void> {
    console.log(`Task completed: ${message.payload.jobId}`);
    // Store successful execution in memory for learning
    if (message.payload.result) {
      await this.memoryInjector.storeExecutionResult(
        message.payload.task,
        message.payload.result,
        true
      );
    }
  }

  private async handleTaskFailed(message: any): Promise<void> {
    console.error(`Task failed: ${message.payload.jobId} - ${message.payload.error}`);
    // Store failed execution for analysis
    await this.memoryInjector.storeExecutionResult(
      message.payload.task,
      { error: message.payload.error },
      false
    );
  }

  private setupEventHandlers(): void {
    // Additional event handlers can be set up here
  }
}