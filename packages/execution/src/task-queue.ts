import { Queue, Worker, Job } from 'bullmq';
import { TaskJob, TaskResult, WorkerConfig } from './types';
import { AgentLoop } from '@karyo/agents';
import { Task } from '@karyo/ai-core';
import { DataAnalystProcessor } from './data-analyst-processor';

export class TaskQueue {
  private queue: Queue;
  private worker: Worker;

  constructor(
    private config: WorkerConfig,
    private agentLoop: AgentLoop,
    private dataAnalystProcessor?: DataAnalystProcessor
  ) {
    this.queue = new Queue('karyo-tasks', {
      connection: { url: config.redisUrl },
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.worker = new Worker(
      'karyo-tasks',
      async (job: Job<TaskJob>) => {
        return await this.processTask(job);
      },
      {
        connection: { url: config.redisUrl },
        concurrency: config.concurrency,
      }
    );

    this.setupWorkerEvents();
  }

  async addTask(taskJob: Omit<TaskJob, 'id' | 'createdAt'>): Promise<string> {
    const job = await this.queue.add(
      'execute-task',
      {
        ...taskJob,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      },
      {
        priority: taskJob.priority === 'urgent' ? 3 : taskJob.priority === 'high' ? 2 : taskJob.priority === 'normal' ? 1 : 0,
      }
    );

    return job.id!;
  }

  async getTaskStatus(jobId: string): Promise<any> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  private async processTask(job: Job<TaskJob>): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      if (job.data.context?.analysisType === 'data_analyst' && this.dataAnalystProcessor) {
        // Ensure required fields are present for data analysis
        if (job.data.userId && job.data.workspaceId && job.data.query && job.data.dataSources) {
          return await this.dataAnalystProcessor.executeAnalysis(job.data as any);
        }
      }

      // Default agent loop processing
      const task: Task = {
        id: job.id!,
        description: job.data.task,
        userId: job.data.userId || 'unknown',
        workspaceId: job.data.workspaceId || 'unknown',
        metadata: job.data.context || {},
      };

      const result = await this.agentLoop.executeTask(task);

      return {
        jobId: job.id!,
        success: true,
        result,
        executionTime: Date.now() - startTime,
        completedAt: new Date(),
      };
    } catch (error) {
      console.error('Task processing error:', error);
      return {
        jobId: job.id!,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        completedAt: new Date(),
      };
    }
  }

  private setupWorkerEvents(): void {
    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id || 'unknown'} failed:`, err);
    });

    this.worker.on('stalled', (jobId) => {
      console.warn(`Job ${jobId} stalled`);
    });
  }

  async close(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }
}