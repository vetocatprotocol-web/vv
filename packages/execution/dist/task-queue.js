"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
const bullmq_1 = require("bullmq");
class TaskQueue {
    constructor(config, agentLoop, dataAnalystProcessor) {
        this.config = config;
        this.agentLoop = agentLoop;
        this.dataAnalystProcessor = dataAnalystProcessor;
        this.queue = new bullmq_1.Queue('karyo-tasks', {
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
        this.worker = new bullmq_1.Worker('karyo-tasks', async (job) => {
            return await this.processTask(job);
        }, {
            connection: { url: config.redisUrl },
            concurrency: config.concurrency,
        });
        this.setupWorkerEvents();
    }
    async addTask(taskJob) {
        const job = await this.queue.add('execute-task', {
            ...taskJob,
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        }, {
            priority: taskJob.priority === 'urgent' ? 3 : taskJob.priority === 'high' ? 2 : taskJob.priority === 'normal' ? 1 : 0,
        });
        return job.id;
    }
    async getTaskStatus(jobId) {
        const job = await this.queue.getJob(jobId);
        if (!job)
            return null;
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
    async processTask(job) {
        const startTime = Date.now();
        try {
            if (job.data.context?.analysisType === 'data_analyst' && this.dataAnalystProcessor) {
                // Ensure required fields are present for data analysis
                if (job.data.userId && job.data.workspaceId && job.data.query && job.data.dataSources) {
                    return await this.dataAnalystProcessor.executeAnalysis(job.data);
                }
            }
            // Default agent loop processing
            const task = {
                id: job.id,
                description: job.data.task,
                userId: job.data.userId || 'unknown',
                workspaceId: job.data.workspaceId || 'unknown',
                metadata: job.data.context || {},
            };
            const result = await this.agentLoop.executeTask(task);
            return {
                jobId: job.id,
                success: true,
                result,
                executionTime: Date.now() - startTime,
                completedAt: new Date(),
            };
        }
        catch (error) {
            console.error('Task processing error:', error);
            return {
                jobId: job.id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime: Date.now() - startTime,
                completedAt: new Date(),
            };
        }
    }
    setupWorkerEvents() {
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
    async close() {
        await this.worker.close();
        await this.queue.close();
    }
}
exports.TaskQueue = TaskQueue;
//# sourceMappingURL=task-queue.js.map